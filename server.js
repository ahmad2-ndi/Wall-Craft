import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url) });
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.warn('JWT_SECRET is not set. Configure backend/.env before using authentication.');
}

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })
    : null;

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(value => value.trim()) || true }));
app.use(express.json({ limit: '10mb' }));

function createToken(user) {
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' });
}

function auth(required = true) {
    return (req, res, next) => {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token || !jwtSecret) {
            if (required) return res.status(401).json({ error: 'Authentication required.' });
            return next();
        }
        try {
            req.user = jwt.verify(token, jwtSecret);
            next();
        } catch {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
    };
}

function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    next();
}

function requireDb(req, res, next) {
    if (!pool) return res.status(503).json({ error: 'Database is not configured. Set DATABASE_URL in backend/.env.' });
    next();
}

app.get('/api/health', async (req, res) => {
    let database = 'not-configured';
    if (pool) {
        try {
            await pool.query('SELECT 1');
            database = 'connected';
        } catch {
            database = 'unavailable';
        }
    }
    res.json({ service: 'wall-crafter-backend', status: 'ok', database });
});

app.post('/api/auth/register', requireDb, async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password || password.length < 6) {
            return res.status(400).json({ error: 'Name, email, and a password of at least 6 characters are required.' });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, LOWER($2), $3) RETURNING id, name, email, role, profile_image',
            [name.trim(), email.trim(), passwordHash]
        );
        const user = result.rows[0];
        res.status(201).json({ user, token: createToken(user) });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'An account with this email already exists.' });
        next(error);
    }
});

app.post('/api/auth/login', requireDb, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE email = LOWER($1)', [email?.trim()]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, profile_image: user.profile_image };
        res.json({ user: safeUser, token: createToken(safeUser) });
    } catch (error) {
        next(error);
    }
});

app.get('/api/auth/me', requireDb, auth(), async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, profile_image FROM users WHERE id = $1', [req.user.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found.' });
        res.json({ user: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.get('/api/products', requireDb, async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, title, category, price_number, description, thumbnail, gallery, delivery_note, created_at, updated_at FROM products ORDER BY created_at DESC');
        res.json({ products: result.rows });
    } catch (error) {
        next(error);
    }
});

app.post('/api/products', requireDb, auth(), adminOnly, async (req, res, next) => {
    try {
        const { title, category, priceNumber, description, thumbnail, gallery = [], deliveryNote = 'Ready to Order' } = req.body;
        if (!title || !category || !description || !thumbnail || !Number.isInteger(priceNumber) || priceNumber < 0) {
            return res.status(400).json({ error: 'Product name, category, integer price, description, and main image are required.' });
        }
        const result = await pool.query(
            `INSERT INTO products (title, category, price_number, description, thumbnail, gallery, delivery_note)
             VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING *`,
            [title.trim(), category.trim(), priceNumber, description.trim(), thumbnail, JSON.stringify(gallery.slice(0, 4)), deliveryNote.trim()]
        );
        res.status(201).json({ product: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/products/:id', requireDb, auth(), adminOnly, async (req, res, next) => {
    try {
        const { title, category, priceNumber, description, thumbnail, gallery, deliveryNote } = req.body;
        const result = await pool.query(
            `UPDATE products SET title = COALESCE($1, title), category = COALESCE($2, category),
             price_number = COALESCE($3, price_number), description = COALESCE($4, description),
             thumbnail = COALESCE($5, thumbnail), gallery = COALESCE($6::jsonb, gallery),
             delivery_note = COALESCE($7, delivery_note), updated_at = NOW()
             WHERE id = $8 RETURNING *`,
            [title, category, priceNumber, description, thumbnail, gallery ? JSON.stringify(gallery.slice(0, 4)) : null, deliveryNote, req.params.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Product not found.' });
        res.json({ product: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/products/:id', requireDb, auth(), adminOnly, async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
        if (!result.rows[0]) return res.status(404).json({ error: 'Product not found.' });
        res.status(204).end();
    } catch (error) {
        next(error);
    }
});

app.post('/api/orders', requireDb, auth(), async (req, res, next) => {
    try {
        const { productId, customerName, email, phone, deliveryAddress, amount, paymentMethod, transactionId, receiptUrl } = req.body;
        if (!productId || !customerName || !email || !phone || !deliveryAddress || !amount || !paymentMethod || !transactionId || !receiptUrl) {
            return res.status(400).json({ error: 'Delivery details, payment details, and receipt are required.' });
        }
        const result = await pool.query(
            `INSERT INTO orders (user_id, product_id, customer_name, email, phone, delivery_address, amount, payment_method, transaction_id, receipt_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [req.user.id, productId, customerName.trim(), email.trim(), phone.trim(), deliveryAddress.trim(), amount, paymentMethod, transactionId.trim(), receiptUrl]
        );
        res.status(201).json({ order: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => {
    console.log(`Wall Crafter backend listening on http://localhost:${port}`);
});
