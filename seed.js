import dotenv from 'dotenv';
dotenv.config({ path: new URL('./.env', import.meta.url) });
import fs from 'node:fs/promises';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required in backend/.env');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

try {
    const schema = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    await pool.query(schema);
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'change-this-before-production', 12);
    await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ('Wall Crafter Admin', LOWER($1), $2, 'admin')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
        [process.env.ADMIN_EMAIL || 'admin@example.com', passwordHash]
    );
    console.log('Database schema applied and admin account seeded.');
} finally {
    await pool.end();
}
