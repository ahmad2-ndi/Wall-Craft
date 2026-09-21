// SkillzHub LMS - Direct Event Handlers & State Controller

// Core Persistent Application State
let state = {
    courses: INITIAL_COURSES,
    users: INITIAL_USERS,
    paymentRequests: INITIAL_PAYMENT_REQUESTS,
    reviews: INITIAL_REVIEWS,
    contactMessages: INITIAL_CONTACT_MESSAGES,
    currentUser: null,
    studentFilter: 'my',
    adminTab: 'requests',
    selectedPaymentMethod: 'jazzcash',
    activeCourse: null,
    activeLesson: null,
    cart: []
};

// Load storage on boot
function initApp() {
    try {
        const storedCourses = localStorage.getItem('skillzhub_courses');
        const storedUsers = localStorage.getItem('skillzhub_users');
        const storedRequests = localStorage.getItem('skillzhub_payment_requests');
        const storedReviews = localStorage.getItem('skillzhub_reviews');
        const storedContactMessages = localStorage.getItem('skillzhub_contact_messages');
        const savedSession = sessionStorage.getItem('skillzhub_session_user');
        const savedCart = localStorage.getItem('skillzhub_cart');

        if (storedCourses) {
            const savedCourses = JSON.parse(storedCourses);
            const hasCncCatalog = savedCourses.some(course => course.id === 'cnc-quran-holder');
            state.courses = hasCncCatalog ? savedCourses : INITIAL_COURSES;
            if (!hasCncCatalog) localStorage.setItem('skillzhub_courses', JSON.stringify(state.courses));
        } else {
            localStorage.setItem('skillzhub_courses', JSON.stringify(state.courses));
        }

        if (storedUsers) state.users = JSON.parse(storedUsers);
        else localStorage.setItem('skillzhub_users', JSON.stringify(state.users));

        const adminUser = state.users.find(user => user.id === 'usr-admin-1' || user.role === 'admin');
        if (adminUser) {
            adminUser.email = 'mr.pakistani@gmail.com';
            adminUser.password = 'abubakar@123';
            localStorage.setItem('skillzhub_users', JSON.stringify(state.users));
        }

        normalizeStudentAccessData();

        if (storedRequests) state.paymentRequests = JSON.parse(storedRequests);
        else localStorage.setItem('skillzhub_payment_requests', JSON.stringify(state.paymentRequests));

        if (storedReviews) state.reviews = JSON.parse(storedReviews);
        else localStorage.setItem('skillzhub_reviews', JSON.stringify(state.reviews));

        if (storedContactMessages) state.contactMessages = JSON.parse(storedContactMessages);
        else localStorage.setItem('skillzhub_contact_messages', JSON.stringify(state.contactMessages));

        if (savedCart) state.cart = JSON.parse(savedCart);

        if (savedSession) {
            state.currentUser = JSON.parse(savedSession);
            updateNavbarUserControls();
            routeUserView();
            return;
        }
    } catch (e) {
        console.error("Storage init error:", e);
    }

    showView('view-landing');
}

function normalizeStudentAccessData() {
    state.users = (state.users || []).map(user => {
        if (user.role !== 'student') return user;
        user.enrolledCourseIds = Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : [];
        user.completedLessonIds = Array.isArray(user.completedLessonIds) ? user.completedLessonIds : [];
        return user;
    });

    if (state.currentUser && state.currentUser.role === 'student') {
        state.currentUser.enrolledCourseIds = Array.isArray(state.currentUser.enrolledCourseIds) ? state.currentUser.enrolledCourseIds : [];
        state.currentUser.completedLessonIds = Array.isArray(state.currentUser.completedLessonIds) ? state.currentUser.completedLessonIds : [];
    }
}

function saveUsers() {
    normalizeStudentAccessData();
    localStorage.setItem('skillzhub_users', JSON.stringify(state.users));
    if (state.currentUser) {
        const updated = state.users.find(u => u.id === state.currentUser.id);
        if (updated) {
            state.currentUser = updated;
            sessionStorage.setItem('skillzhub_session_user', JSON.stringify(state.currentUser));
        }
    }
}

function saveRequests() {
    localStorage.setItem('skillzhub_payment_requests', JSON.stringify(state.paymentRequests));
}

function saveReviews() {
    localStorage.setItem('skillzhub_reviews', JSON.stringify(state.reviews));
}

function saveContactMessages() {
    localStorage.setItem('skillzhub_contact_messages', JSON.stringify(state.contactMessages));
}

function saveCart() {
    localStorage.setItem('skillzhub_cart', JSON.stringify(state.cart));
    updateCartCount();
}

// --- VIEW NAVIGATION ---

function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.toggle('mobile-open');
}

function closeMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');
}

function showView(viewId) {
    document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById(viewId);
    if (target) target.style.display = 'block';

    // Update active navbar link
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    const linkId = `nav-item-${viewId.replace('view-', '')}`;
    const activeLink = document.getElementById(linkId);
    if (activeLink) activeLink.classList.add('active');

    closeMobileMenu();
    updateNavbarUserControls();
    updateCartCount();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewId === 'view-landing') {
        renderPublicCourses();
    } else if (viewId === 'view-courses') {
        renderCoursesPageGrid(state.courses);
    } else if (viewId === 'view-team') {
        renderTeamView();
    } else if (viewId === 'view-testimonials') {
        renderTestimonialsView();
    } else if (viewId === 'view-contact') {
        renderFaqsView();
    } else if (viewId === 'view-admin') {
        renderAdminDashboard();
    } else if (viewId === 'view-student') {
        renderStudentDashboard();
    }
}


function renderPublicCourses() {
    const grid = document.getElementById('public-courses-grid');
    if (!grid) return;

    grid.innerHTML = state.courses.map(course => `
        <div class="course-card" onclick="openProductDetail('${course.id}')" role="button" tabindex="0">
            <div class="course-thumb">
                <img src="${course.thumbnail}" alt="${escapeHtml(course.title)}">
                <span class="course-category-tag"><i class="fa-solid ${course.icon}"></i> ${course.category}</span>
                <span class="course-price-tag">${course.price}</span>
            </div>
            <div class="course-body">
                <h3>${escapeHtml(course.title)}</h3>
                <div class="course-meta">
                    <span><i class="fa-solid fa-user-tie"></i> ${course.instructor}</span>
                    <span><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                </div>
                <p class="course-desc">${escapeHtml(course.description)}</p>
                <div class="product-view-hint"><i class="fa-solid fa-arrow-up-right-from-square"></i> View product details</div>
            </div>
        </div>
    `).join('');
}

function updateCartCount() {
    const count = document.getElementById('cart-count');
    if (count) count.textContent = state.cart.length;
}

function requireCustomerAuth() {
    if (state.currentUser) return true;

    const modal = document.getElementById('auth-required-modal');
    if (modal) modal.classList.add('active');
    return false;
}

function openProductDetail(courseId) {
    if (!requireCustomerAuth()) return;

    const product = state.courses.find(course => course.id === courseId);
    const modal = document.getElementById('product-detail-modal');
    if (!product || !modal) return;

    const galleryItems = Array.isArray(product.gallery) && product.gallery.length
        ? product.gallery.map((src, index) => ({ src, title: `${product.title} image ${index + 1}` }))
        : [{ src: product.thumbnail, title: product.title }];
    document.getElementById('product-detail-title').textContent = product.title;
    document.getElementById('product-detail-category').textContent = product.category;
    document.getElementById('product-detail-price').textContent = product.price;
    document.getElementById('product-detail-description').textContent = product.description;
    document.getElementById('product-detail-main-image').src = product.thumbnail;
    document.getElementById('product-detail-main-image').alt = product.title;
    document.getElementById('product-detail-buy').onclick = () => openPaymentModal(product.id, product.title, product.price);
    document.getElementById('product-detail-cart').onclick = () => addToCart(product.id);
    document.getElementById('product-detail-gallery').innerHTML = galleryItems.map(item => `
        <button type="button" class="product-thumb ${item.src === product.thumbnail ? 'active' : ''}" onclick="selectProductImage('${item.src}', '${escapeHtml(item.title)}', this)">
            <img src="${item.src}" alt="${escapeHtml(item.title)}">
        </button>
    `).join('');
    modal.classList.add('active');
}

function selectProductImage(src, title, thumbnail) {
    const mainImage = document.getElementById('product-detail-main-image');
    if (mainImage) {
        mainImage.src = src;
        mainImage.alt = title;
    }
    document.querySelectorAll('.product-thumb').forEach(item => item.classList.remove('active'));
    if (thumbnail) thumbnail.classList.add('active');
}

function addToCart(courseId) {
    if (!requireCustomerAuth()) return;

    const course = state.courses.find(item => item.id === courseId);
    if (!course) return;

    if (state.cart.some(item => item.id === courseId)) {
        showToast('This product is already in your cart.', 'info');
    } else {
        state.cart.push({ id: course.id, title: course.title, price: course.price, thumbnail: course.thumbnail });
        saveCart();
        showToast(`${course.title} added to cart.`, 'success');
    }
    renderCart();
}

function removeFromCart(courseId) {
    state.cart = state.cart.filter(item => item.id !== courseId);
    saveCart();
    renderCart();
}

function openCart() {
    renderCart();
    const cart = document.getElementById('cart-drawer');
    if (cart) cart.classList.add('active');
}

function renderCart() {
    const items = document.getElementById('cart-items');
    const total = document.getElementById('cart-total');
    if (!items || !total) return;

    if (!state.cart.length) {
        items.innerHTML = '<div class="empty-cart"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty.</p><span>Add a digital product to get started.</span></div>';
        total.textContent = 'Rs. 0';
        return;
    }

    items.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <img src="${item.thumbnail}" alt="${escapeHtml(item.title)}">
            <div><strong>${escapeHtml(item.title)}</strong><span>${item.price}</span></div>
            <button type="button" class="btn btn-icon btn-secondary" onclick="removeFromCart('${item.id}')" title="Remove item"><i class="fa-solid fa-xmark"></i></button>
        </div>
    `).join('');
    const totalAmount = state.cart.reduce((sum, item) => {
        const course = state.courses.find(courseItem => courseItem.id === item.id);
        return sum + (course ? course.priceNumber : 0);
    }, 0);
    total.textContent = `Rs. ${totalAmount.toLocaleString('en-PK')}`;
}

function checkoutCart() {
    if (!requireCustomerAuth()) return;

    if (!state.cart.length) {
        showToast('Add a product to your cart first.', 'info');
        return;
    }
    const item = state.cart[0];
    closeModal('cart-drawer');
    openPaymentModal(item.id, item.title, item.price);
}

function updateNavbarUserControls() {
    const container = document.getElementById('nav-user-container');
    if (!container) return;

    if (state.currentUser) {
        const avatarMarkup = state.currentUser.profileImage
            ? `<img src="${state.currentUser.profileImage}" alt="${escapeHtml(state.currentUser.name)}">`
            : escapeHtml(state.currentUser.name.charAt(0).toUpperCase());
        container.innerHTML = `
            <div class="user-menu">
                <button type="button" class="user-menu-trigger" onclick="toggleUserMenu()" aria-label="Open account menu">
                    <span class="avatar">${avatarMarkup}</span>
                    <span class="user-menu-name">${escapeHtml(state.currentUser.name)}</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div class="user-menu-dropdown" id="user-menu-dropdown">
                    <button type="button" onclick="openAccountSettings()"><i class="fa-solid fa-gear"></i> Account Settings</button>
                    <button type="button" onclick="showView('view-landing')"><i class="fa-solid fa-house"></i> Home</button>
                    <button type="button" class="menu-danger" onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <button type="button" class="btn btn-outline btn-sm" onclick="showView('view-signup')">
                <i class="fa-solid fa-user-plus"></i> Sign Up
            </button>
            <button type="button" class="btn btn-primary btn-sm" onclick="showView('view-login')">
                <i class="fa-solid fa-right-to-bracket"></i> Login
            </button>
        `;
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('user-menu-dropdown');
    if (menu) menu.classList.toggle('active');
}

function openAccountSettings() {
    const modal = document.getElementById('account-settings-modal');
    if (!modal || !state.currentUser) return;
    document.getElementById('account-settings-name').value = state.currentUser.name;
    document.getElementById('account-settings-email').value = state.currentUser.email;
    document.getElementById('account-settings-password').value = '';
    const preview = document.getElementById('account-settings-preview');
    if (preview) {
        preview.src = state.currentUser.profileImage || '';
        preview.style.display = state.currentUser.profileImage ? 'block' : 'none';
    }
    modal.classList.add('active');
    toggleUserMenu();
}

function previewAccountPhoto(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    processImageFile(file, dataUrl => {
        const preview = document.getElementById('account-settings-preview');
        if (preview && dataUrl) {
            preview.src = dataUrl;
            preview.style.display = 'block';
        }
    });
}

function handleAccountSettingsSubmit(event) {
    if (event) event.preventDefault();
    if (!state.currentUser) return;

    const name = document.getElementById('account-settings-name').value.trim();
    const email = document.getElementById('account-settings-email').value.trim().toLowerCase();
    const password = document.getElementById('account-settings-password').value.trim();
    const photoInput = document.getElementById('account-settings-photo');
    const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;

    if (!name || !email) {
        showToast('Name and email are required.', 'error');
        return;
    }
    if (password && password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
    }
    if (state.users.some(user => user.id !== state.currentUser.id && user.email.toLowerCase() === email)) {
        showToast('This email is already in use.', 'error');
        return;
    }

    processImageFile(photoFile, photoDataUrl => {
        const user = state.users.find(item => item.id === state.currentUser.id);
        if (!user) return;
        user.name = name;
        user.email = email;
        if (password) user.password = password;
        if (photoDataUrl) user.profileImage = photoDataUrl;
        saveUsers();
        updateNavbarUserControls();
        closeModal('account-settings-modal');
        showToast('Account settings updated successfully.', 'success');
    });
}

// --- PAYMENT & ENROLLMENT MODAL ---

function openPaymentModal(courseId, title = '', price = '') {
    if (!requireCustomerAuth()) return;

    const course = state.courses.find(c => c.id === courseId);
    
    document.getElementById('pay-course-id').value = courseId;
    document.getElementById('pay-course-title').textContent = course ? course.title : title;
    document.getElementById('pay-course-price').textContent = `Fee: ${course ? course.price : price}`;

    selectPaymentMethod('jazzcash');

    // Reset screenshot input & preview
    const screenshotInput = document.getElementById('pay-trx-screenshot');
    if (screenshotInput) screenshotInput.value = '';
    const previewContainer = document.getElementById('pay-screenshot-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';

    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('active');
}

function selectPaymentMethod(methodId) {
    state.selectedPaymentMethod = methodId;

    const cardJazz = document.getElementById('method-jazzcash');
    const cardMeezan = document.getElementById('method-meezan');
    const ibanRow = document.getElementById('pay-iban-row');

    if (methodId === 'jazzcash') {
        cardJazz.classList.add('selected');
        cardMeezan.classList.remove('selected');
        document.getElementById('pay-acc-title').textContent = "Wall Crafter";
        document.getElementById('pay-acc-num').textContent = "0300-1234567";
        if (ibanRow) ibanRow.style.display = 'none';
        document.getElementById('pay-acc-instructions').textContent = "Send course fee via JazzCash or EasyPaisa app to 0300-1234567 and copy your Transaction ID (Trx ID).";
    } else {
        cardMeezan.classList.add('selected');
        cardJazz.classList.remove('selected');
        document.getElementById('pay-acc-title').textContent = "Wall Crafter";
        document.getElementById('pay-acc-num').textContent = "0102-0105849302";
        document.getElementById('pay-acc-iban').textContent = "PK92MEZN0001020105849302";
        if (ibanRow) ibanRow.style.display = 'flex';
        document.getElementById('pay-acc-instructions').textContent = "Transfer online via Bank Mobile App or ATM to Meezan Bank. Copy your Transaction ID (Trx ID).";
    }
}

function previewPaymentScreenshot(event) {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('pay-screenshot-preview-container');
    const previewImg = document.getElementById('pay-screenshot-preview');

    if (file && previewContainer && previewImg) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (previewContainer) {
        previewContainer.style.display = 'none';
    }
}

function processImageFile(file, callback) {
    if (!file) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.onerror = function() {
            callback(e.target.result);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handlePaymentSubmit(e) {
    if (e) e.preventDefault();

    const courseId = document.getElementById('pay-course-id').value;
    const course = state.courses.find(c => c.id === courseId);
    const name = document.getElementById('pay-student-name').value.trim();
    const phone = document.getElementById('pay-student-phone').value.trim();
    const email = document.getElementById('pay-student-email').value.trim();
    const address = document.getElementById('pay-delivery-address').value.trim();
    const trxId = document.getElementById('pay-trx-id').value.trim();
    const fileInput = document.getElementById('pay-trx-screenshot');
    const file = fileInput && fileInput.files ? fileInput.files[0] : null;

    if (!phone || !address) {
        showToast('Please enter your phone number and full delivery address.', 'error');
        return;
    }
    if (!trxId) {
        showToast('Please enter your Transaction ID (Trx ID).', 'error');
        return;
    }
    if (!file) {
        showToast('Payment receipt screenshot is required.', 'error');
        return;
    }

    processImageFile(file, function(screenshotDataUrl) {
        const newRequest = {
            id: 'pay-' + Date.now(),
            studentName: name,
            email: email,
            phone: phone,
            address: address,
            courseId: courseId,
            courseTitle: course ? course.title : 'Selected Course',
            amount: course ? course.price : 'Rs. 15,000',
            paymentMethod: state.selectedPaymentMethod === 'jazzcash' ? 'JazzCash / EasyPaisa' : 'Meezan Bank',
            trxId: trxId,
            screenshotDataUrl: screenshotDataUrl || null,
            status: 'pending',
            submittedAt: new Date().toLocaleString()
        };

        state.paymentRequests.unshift(newRequest);
        saveRequests();
        removeFromCart(courseId);

        closeModal('payment-modal');
        document.getElementById('payment-form').reset();
        const previewContainer = document.getElementById('pay-screenshot-preview-container');
        if (previewContainer) previewContainer.style.display = 'none';

        alert(`Thank you ${name}!\n\nYour order request with Transaction ID (${trxId}) and delivery address has been submitted successfully.\n\nWall Crafter will verify your payment and arrange delivery.`);
        showToast('Order payment and delivery details submitted successfully!', 'success');
    });
}

// --- AUTHENTICATION ---

function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    handleLogin(email, password);
}

function handleSignupSubmit(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value.trim();

    if (state.users.some(user => user.email.toLowerCase() === email)) {
        showToast('An account with this email already exists. Please login.', 'error');
        showView('view-login');
        return;
    }

    state.users.push({
        id: 'usr-customer-' + Date.now(),
        name,
        email,
        password,
        role: 'student',
        createdAt: new Date().toISOString().split('T')[0],
        enrolledCourseIds: [],
        completedLessonIds: []
    });
    saveUsers();

    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = '';
    showToast('Account created successfully. Please login to continue.', 'success');
    showView('view-login');
}

function handleAdminLoginSubmit(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value.trim();

    if (!email || !password) {
        showToast('Please enter Admin Email and Password.', 'error');
        return;
    }

    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === 'admin');

    if (!user) {
        showToast('Invalid Admin Credentials! Only authorized admin accounts can login here.', 'error');
        return;
    }

    state.currentUser = user;
    sessionStorage.setItem('skillzhub_session_user', JSON.stringify(user));
    showToast(`Welcome to Administrator Control Center, ${user.name}!`, 'success');
    
    updateNavbarUserControls();
    routeUserView();
}

function attachPasswordToggle(targetId) {
    const input = document.getElementById(targetId);
    const toggleButton = document.querySelector(`[data-target="${targetId}"]`);

    if (!input || !toggleButton) return;

    toggleButton.addEventListener('click', () => {
        const shouldShow = input.type === 'password';
        input.type = shouldShow ? 'text' : 'password';

        const icon = toggleButton.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye', !shouldShow);
            icon.classList.toggle('fa-eye-slash', shouldShow);
        }

        toggleButton.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
        toggleButton.title = shouldShow ? 'Hide password' : 'Show password';
    });
}

attachPasswordToggle('login-password');
attachPasswordToggle('admin-password');

function handleLogin(email, password) {
    if (!email || !password) {
        showToast('Please enter both Email Address and Password.', 'error');
        return;
    }

    // ─── FIXED ADMIN CREDENTIALS ───────────────────────────
    const ADMIN_EMAIL    = 'mr.pakistani@gmail.com';
    const ADMIN_PASSWORD = 'abubakar@123';
    // ────────────────────────────────────────────────────────

    // Check if admin credentials entered → redirect to admin.html
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Save a temporary admin session marker so admin.html can pick it up
        const adminUser = state.users.find(u => u.role === 'admin') || {
            id: 'usr-admin-1',
            name: 'SkillzHub Admin',
            email: ADMIN_EMAIL,
            role: 'admin'
        };
        state.currentUser = adminUser;
        sessionStorage.setItem('skillzhub_session_user', JSON.stringify(adminUser));
        showToast('Admin verified! Redirecting to Admin Control Center...', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 900);
        return;
    }

    // Regular student login
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
        showToast('Invalid Email or Password! Make sure Admin has approved your account.', 'error');
        return;
    }

    if (user.role === 'student') {
        user.enrolledCourseIds = Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : [];
        user.completedLessonIds = Array.isArray(user.completedLessonIds) ? user.completedLessonIds : [];
    }

    state.currentUser = user;
    sessionStorage.setItem('skillzhub_session_user', JSON.stringify(user));
    showToast(`Logged in successfully! Welcome back ${user.name}.`, 'success');
    
    updateNavbarUserControls();
    routeUserView();
}

function quickLogin(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
    handleLogin(email, password);
}

function handleLogout() {
    state.currentUser = null;
    sessionStorage.removeItem('skillzhub_session_user');
    updateNavbarUserControls();
    showView('view-landing');
    showToast('Logged out successfully.', 'info');
}

function routeUserView() {
    if (!state.currentUser) {
        showView('view-landing');
        return;
    }

    if (state.currentUser.role === 'admin') {
        // Admin always goes to admin.html
        window.location.href = 'admin.html';
    } else {
        showView('view-landing');
    }
}


// --- ADMIN PANEL ---

function setAdminTab(tab) {
    state.adminTab = tab;
    document.getElementById('tab-admin-requests').classList.toggle('active', tab === 'requests');
    document.getElementById('tab-admin-students').classList.toggle('active', tab === 'students');

    document.getElementById('admin-tab-requests-view').style.display = tab === 'requests' ? 'block' : 'none';
    document.getElementById('admin-tab-students-view').style.display = tab === 'students' ? 'block' : 'none';

    renderAdminDashboard();
}

function renderAdminDashboard() {
    const studentUsers = state.users.filter(u => u.role === 'student');
    const pendingRequests = state.paymentRequests.filter(r => r.status === 'pending');

    document.getElementById('stat-pending-payments').textContent = pendingRequests.length;
    document.getElementById('admin-pending-count').textContent = pendingRequests.length;
    document.getElementById('stat-total-students').textContent = studentUsers.length;

    let totalActiveEnrollments = 0;
    studentUsers.forEach(s => {
        totalActiveEnrollments += (s.enrolledCourseIds || []).length;
    });
    document.getElementById('stat-active-enrollments').textContent = totalActiveEnrollments;

    if (state.adminTab === 'requests') {
        renderPaymentRequestsTable();
    } else {
        renderStudentsTable(studentUsers);
    }
}

function renderPaymentRequestsTable() {
    const tbody = document.getElementById('payment-requests-table-body');
    if (!tbody) return;

    if (state.paymentRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-body);">
                    No payment requests submitted yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = state.paymentRequests.map(req => {
        const isPending = req.status === 'pending';
        const hasScreenshot = Boolean(req.screenshotDataUrl);

        return `
            <tr>
                <td><strong style="color: var(--blue-dark);">${escapeHtml(req.studentName)}</strong></td>
                <td>
                    <div>${escapeHtml(req.email)}</div>
                    <div style="font-size: 0.78rem; color: var(--text-body);"><i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> ${escapeHtml(req.phone)}</div>
                </td>
                <td><span class="badge badge-blue">${escapeHtml(req.courseTitle)}</span></td>
                <td>
                    <div><strong>${req.amount}</strong></div>
                    <div style="font-size: 0.78rem; color: var(--text-body);">${req.paymentMethod}</div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">
                        <code style="background: #fff8f3; color: var(--orange-main); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(243,112,33,0.3); font-weight: 700;">
                            ${escapeHtml(req.trxId)}
                        </code>
                        ${hasScreenshot ? `
                            <button type="button" class="btn btn-secondary btn-sm" onclick="viewPaymentScreenshot('${req.id}')" style="font-size: 0.75rem; padding: 3px 8px;">
                                <i class="fa-solid fa-image" style="color: var(--orange-main);"></i> View Receipt
                            </button>
                        ` : `
                            <span style="font-size: 0.74rem; color: #94a3b8;"><i class="fa-solid fa-ban"></i> No Screenshot</span>
                        `}
                    </div>
                </td>
                <td style="font-size: 0.8rem;">${req.submittedAt}</td>
                <td style="text-align: right;">
                    ${isPending ? `
                        <button type="button" class="btn btn-orange btn-sm" onclick="approvePaymentRequest('${req.id}')">
                            <i class="fa-solid fa-check"></i> Approve & Create Account
                        </button>
                    ` : `
                        <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Approved</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function viewPaymentScreenshot(requestId) {
    const req = state.paymentRequests.find(r => r.id === requestId);
    if (!req || !req.screenshotDataUrl) {
        showToast('No screenshot available for this request.', 'info');
        return;
    }

    const modalImg = document.getElementById('screenshot-modal-img');
    if (modalImg) modalImg.src = req.screenshotDataUrl;

    const modal = document.getElementById('screenshot-modal');
    if (modal) modal.classList.add('active');
}

function approvePaymentRequest(requestId) {
    const req = state.paymentRequests.find(r => r.id === requestId);
    if (!req) return;

    const autoPassword = "std" + Math.floor(1000 + Math.random() * 9000);
    let user = state.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());

    if (user) {
        if (!user.enrolledCourseIds.includes(req.courseId)) {
            user.enrolledCourseIds.push(req.courseId);
        }
    } else {
        user = {
            id: 'usr-std-' + Date.now(),
            name: req.studentName,
            email: req.email,
            password: autoPassword,
            role: 'student',
            createdAt: new Date().toISOString().split('T')[0],
            enrolledCourseIds: [req.courseId],
            completedLessonIds: []
        };
        state.users.push(user);
    }

    req.status = 'approved';

    saveUsers();
    saveRequests();

    alert(`✅ Account Approved & Created Successfully!\n\nStudent Name: ${req.studentName}\nLogin Email: ${req.email}\nAssigned Password: ${user.password}\nCourse Access Granted: ${req.courseTitle}\n\nPlease share these login credentials with the student.`);

    showToast(`Approved payment Trx ID: ${req.trxId}`, 'success');
    renderAdminDashboard();
}

function renderStudentsTable(studentUsers) {
    const searchInput = document.getElementById('admin-search-input');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = studentUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
    document.getElementById('student-count-badge').textContent = filtered.length;

    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px;">No student accounts found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(student => {
        const enrolledBadges = (student.enrolledCourseIds || []).map(cId => {
            const course = state.courses.find(c => c.id === cId);
            return course ? `<span class="badge badge-blue"><i class="fa-solid ${course.icon}"></i> ${course.title.split(' ')[0]}</span>` : '';
        }).join(' ');

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width: 32px; height: 32px; font-size: 0.82rem;">${student.name.charAt(0)}</div>
                        <strong style="color: var(--blue-dark);">${escapeHtml(student.name)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(student.email)}</td>
                <td><code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${escapeHtml(student.password)}</code></td>
                <td><div class="enrolled-courses-tags">${enrolledBadges || '<span style="color: #94a3b8; font-size: 0.8rem;">No courses assigned</span>'}</div></td>
                <td>${student.createdAt || '2026-02-15'}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openUserModal('${student.id}')" title="Edit Student">
                        <i class="fa-solid fa-pen-to-square"></i> Manage Access
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="deleteUser('${student.id}')" style="color: #ef4444; border-color: #fca5a5;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function openUserModal(userId = null) {
    const modal = document.getElementById('user-modal');
    const titleEl = document.getElementById('user-modal-title');
    const form = document.getElementById('user-form');
    const hiddenId = document.getElementById('edit-user-id');
    const nameInput = document.getElementById('modal-name');
    const emailInput = document.getElementById('modal-email');
    const passInput = document.getElementById('modal-password');
    const checkboxContainer = document.getElementById('modal-courses-checkboxes');

    form.reset();
    checkboxContainer.innerHTML = '';

    let targetUser = userId ? state.users.find(u => u.id === userId) : null;

    if (targetUser) {
        titleEl.innerHTML = `<i class="fa-solid fa-user-pen" style="color: var(--orange-main);"></i> Manage Student: ${escapeHtml(targetUser.name)}`;
        hiddenId.value = targetUser.id;
        nameInput.value = targetUser.name;
        emailInput.value = targetUser.email;
        passInput.value = targetUser.password;
    } else {
        titleEl.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--orange-main);"></i> Create New Student Account`;
        hiddenId.value = '';
    }

    checkboxContainer.innerHTML = state.courses.map(course => {
        const isChecked = targetUser && (targetUser.enrolledCourseIds || []).includes(course.id);
        return `
            <label class="checkbox-card">
                <input type="checkbox" name="enrolled_courses" value="${course.id}" ${isChecked ? 'checked' : ''}>
                <div>
                    <div style="font-weight: 700; color: var(--blue-dark); font-size: 0.88rem;">
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-body);">${course.duration} • ${course.category}</div>
                </div>
            </label>
        `;
    }).join('');

    modal.classList.add('active');
}

function handleSaveUser(e) {
    if (e) e.preventDefault();
    const userId = document.getElementById('edit-user-id').value;
    const name = document.getElementById('modal-name').value.trim();
    const email = document.getElementById('modal-email').value.trim();
    const password = document.getElementById('modal-password').value.trim();

    const checkedBoxes = document.querySelectorAll('input[name="enrolled_courses"]:checked');
    const enrolledCourseIds = Array.from(checkedBoxes).map(cb => cb.value);

    if (userId) {
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            state.users[userIndex].name = name;
            state.users[userIndex].email = email;
            state.users[userIndex].password = password;
            state.users[userIndex].enrolledCourseIds = enrolledCourseIds;
        }
        showToast(`Updated student account for ${name}`, 'success');
    } else {
        if (state.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('A student with this email address already exists.', 'error');
            return;
        }

        const newUser = {
            id: 'usr-std-' + Date.now(),
            name: name,
            email: email,
            password: password,
            role: 'student',
            createdAt: new Date().toISOString().split('T')[0],
            enrolledCourseIds: Array.isArray(enrolledCourseIds) ? enrolledCourseIds : [],
            completedLessonIds: []
        };

        state.users.push(newUser);
        showToast(`Student account created for ${name}!`, 'success');
    }

    saveUsers();
    closeModal('user-modal');
    renderAdminDashboard();
}

function deleteUser(userId) {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to delete student account "${user.name}"?`)) {
        state.users = state.users.filter(u => u.id !== userId);
        saveUsers();
        renderAdminDashboard();
        showToast('Student account deleted.', 'info');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// --- STUDENT DASHBOARD & PLAYER ---

function getAccessibleCourseIdsForUser(user = state.currentUser) {
    if (!user) return [];

    const enrolledIds = Array.isArray(user.enrolledCourseIds) ? user.enrolledCourseIds : [];
    return [...new Set(enrolledIds)];
}

function canAccessCourse(courseId, user = state.currentUser) {
    return getAccessibleCourseIdsForUser(user).includes(courseId);
}

function setStudentCourseFilter(filter) {
    state.studentFilter = filter;
    document.getElementById('tab-my-courses').classList.toggle('active', filter === 'my');
    document.getElementById('tab-all-courses').classList.toggle('active', filter === 'all');
    renderStudentDashboard();
}

function renderStudentDashboard() {
    if (!state.currentUser) return;

    const accessibleIds = getAccessibleCourseIdsForUser(state.currentUser);
    document.getElementById('student-welcome-name').textContent = state.currentUser.name;
    document.getElementById('student-enrolled-count').textContent = accessibleIds.length;

    const grid = document.getElementById('student-courses-grid');
    if (!grid) return;

    let displayedCourses = state.courses;
    if (state.studentFilter === 'my') {
        displayedCourses = state.courses.filter(c => accessibleIds.includes(c.id));
    }

    if (displayedCourses.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; color: var(--orange-main); margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">No Enrolled Courses Found</h3>
                <p style="color: var(--text-body); font-size: 0.95rem; max-width: 500px; margin: 0 auto 20px auto;">
                    Your account currently has no active course enrollments assigned by Admin.
                </p>
                <button type="button" class="btn btn-outline" onclick="setStudentCourseFilter('all')">View All Available Courses</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = displayedCourses.map(course => {
        const isEnrolled = accessibleIds.includes(course.id);
        const progress = calculateCourseProgress(course.id);

        return `
            <div class="course-card">
                <div class="course-thumb">
                    <img src="${course.thumbnail}" alt="${escapeHtml(course.title)}">
                    <span class="course-category-tag"><i class="fa-solid ${course.icon}"></i> ${course.category}</span>
                </div>
                <div class="course-body">
                    <h3>${escapeHtml(course.title)}</h3>
                    <div class="course-meta">
                        <span><i class="fa-solid fa-user-tie"></i> ${course.instructor}</span>
                        <span><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                    </div>
                    <p class="course-desc">${escapeHtml(course.description)}</p>

                    ${isEnrolled ? `
                        <div class="progress-container">
                            <div class="progress-info">
                                <span>Progress</span>
                                <span>${progress}%</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="course-footer">
                        <span class="badge ${isEnrolled ? 'badge-success' : 'badge-orange'}">
                            ${isEnrolled ? '<i class="fa-solid fa-circle-check"></i> Enrolled' : '<i class="fa-solid fa-lock"></i> Enrollment Required'}
                        </span>
                        
                        ${isEnrolled ? `
                            <button type="button" class="btn btn-orange btn-sm" onclick="openPlayerModal('${course.id}')">
                                <i class="fa-solid fa-play"></i> ${progress > 0 ? 'Continue' : 'Start Course'}
                            </button>
                        ` : `
                            <button type="button" class="btn btn-orange btn-sm" onclick="openPaymentModal('${course.id}', '${escapeHtml(course.title)}', '${course.price}')">
                                <i class="fa-solid fa-cart-shopping"></i> Enroll Now (${course.price})
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function calculateCourseProgress(courseId) {
    const course = state.courses.find(c => c.id === courseId);
    if (!course || !state.currentUser) return 0;

    let totalLessons = 0;
    let completedCount = 0;

    (course.modules || []).forEach(mod => {
        (mod.lessons || []).forEach(les => {
            totalLessons++;
            if ((state.currentUser.completedLessonIds || []).includes(les.id)) {
                completedCount++;
            }
        });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
}

function openPlayerModal(courseId) {
    const course = state.courses.find(c => c.id === courseId);
    if (!course) return;

    if (!canAccessCourse(courseId, state.currentUser)) {
        showToast('This course is locked. Please contact admin for access.', 'info');
        return;
    }

    state.activeCourse = course;
    let firstLesson = null;
    for (const mod of course.modules) {
        if (mod.lessons && mod.lessons.length > 0) {
            firstLesson = mod.lessons[0];
            break;
        }
    }

    if (!firstLesson) {
        showToast('No video lessons available in this course yet.', 'info');
        return;
    }

    state.activeLesson = firstLesson;

    document.getElementById('player-course-title').textContent = course.title;
    document.getElementById('player-instructor-name').textContent = `Instructor: ${course.instructor}`;

    renderPlayerCurriculum();
    loadLessonVideo(state.activeLesson);

    const playerModal = document.getElementById('player-modal');
    if (playerModal) playerModal.classList.add('active');

    protectPlayerFromDownload();
}

function closePlayerModal() {
    const iframe = document.getElementById('video-iframe');
    if (iframe) iframe.src = '';
    const playerModal = document.getElementById('player-modal');
    if (playerModal) playerModal.classList.remove('active');

    renderStudentDashboard();
}

function protectPlayerFromDownload() {
    const playerModal = document.getElementById('player-modal');
    if (!playerModal) return;

    document.addEventListener('contextmenu', (event) => {
        if (playerModal.classList.contains('active')) {
            event.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('keydown', (event) => {
        if (!playerModal.classList.contains('active')) return;

        const key = event.key.toLowerCase();
        const isDownloadShortcut = (event.ctrlKey || event.metaKey) && (key === 's' || key === 'p');
        if (isDownloadShortcut) {
            event.preventDefault();
            showToast('Downloads are disabled for course lessons.', 'info');
        }
    });
}

function loadLessonVideo(lesson) {
    state.activeLesson = lesson;

    document.getElementById('player-lesson-title').textContent = lesson.title;
    document.getElementById('player-lesson-summary').textContent = lesson.summary || 'Watch this video lesson carefully and mark it as complete when finished.';

    const iframe = document.getElementById('video-iframe');
    if (iframe) iframe.src = lesson.videoUrl;

    updateLessonCompletionButtonState();
    renderPlayerCurriculum();
}

function updateLessonCompletionButtonState() {
    const btn = document.getElementById('btn-toggle-lesson-complete');
    if (!btn || !state.activeLesson || !state.currentUser) return;

    const isCompleted = (state.currentUser.completedLessonIds || []).includes(state.activeLesson.id);

    if (isCompleted) {
        btn.className = 'btn btn-secondary';
        btn.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Completed (Click to Undo)';
    } else {
        btn.className = 'btn btn-orange';
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mark Lesson as Complete';
    }
}

function toggleCurrentLessonCompletion() {
    if (!state.currentUser || !state.activeLesson) return;

    let completedIds = state.currentUser.completedLessonIds || [];
    const isCompleted = completedIds.includes(state.activeLesson.id);

    if (isCompleted) {
        completedIds = completedIds.filter(id => id !== state.activeLesson.id);
        showToast('Lesson marked as incomplete.', 'info');
    } else {
        completedIds.push(state.activeLesson.id);
        showToast('Great job! Lesson completed! 🎉', 'success');
    }

    state.currentUser.completedLessonIds = completedIds;
    saveUsers();

    updateLessonCompletionButtonState();
    renderPlayerCurriculum();
}

function renderPlayerCurriculum() {
    if (!state.activeCourse) return;

    const listContainer = document.getElementById('player-modules-list');
    if (!listContainer) return;

    const progress = calculateCourseProgress(state.activeCourse.id);
    document.getElementById('player-progress-text').textContent = `${progress}%`;
    document.getElementById('player-progress-fill').style.width = `${progress}%`;

    const certContainer = document.getElementById('player-cert-btn-container');
    if (progress === 100) {
        certContainer.innerHTML = `
            <button type="button" class="btn btn-orange btn-sm" onclick="openCertificateModal('${state.activeCourse.id}')">
                <i class="fa-solid fa-award"></i> Claim Certificate
            </button>
        `;
    } else {
        certContainer.innerHTML = '';
    }

    listContainer.innerHTML = (state.activeCourse.modules || []).map(module => {
        const lessonsHtml = (module.lessons || []).map(lesson => {
            const isCurrent = state.activeLesson && state.activeLesson.id === lesson.id;
            const isCompleted = (state.currentUser.completedLessonIds || []).includes(lesson.id);

            return `
                <div class="lesson-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     onclick="selectLessonById('${lesson.id}')">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fa-solid ${isCompleted ? 'fa-circle-check' : (isCurrent ? 'fa-circle-play' : 'fa-circle-notch')}" 
                           style="${isCompleted ? 'color: var(--success);' : (isCurrent ? 'color: var(--orange-main);' : 'color: #cbd5e1;')}"></i>
                        <span>${escapeHtml(lesson.title)}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: #94a3b8;">${lesson.duration}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="module-group">
                <div class="module-header">${escapeHtml(module.title)}</div>
                <div>${lessonsHtml}</div>
            </div>
        `;
    }).join('');
}

function selectLessonById(lessonId) {
    if (!state.activeCourse) return;
    for (const mod of state.activeCourse.modules) {
        const found = (mod.lessons || []).find(l => l.id === lessonId);
        if (found) {
            loadLessonVideo(found);
            break;
        }
    }
}

function openCertificateModal(courseId) {
    const course = state.courses.find(c => c.id === courseId) || state.activeCourse;
    if (!course || !state.currentUser) return;

    document.getElementById('cert-student-name').textContent = state.currentUser.name;
    document.getElementById('cert-course-name').textContent = course.title;
    document.getElementById('cert-issue-date').textContent = new Date().toISOString().split('T')[0];
    document.getElementById('cert-code').textContent = `SKILLZ-${Math.floor(100000 + Math.random() * 900000)}`;

    const certModal = document.getElementById('certificate-modal');
    if (certModal) certModal.classList.add('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// --- NEW PAGES RENDERERS & EVENT HANDLERS ---

function renderCoursesPageGrid(coursesList) {
    const grid = document.getElementById('courses-page-grid');
    if (!grid) return;

    if (!coursesList || coursesList.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-body);">No courses found matching your search query.</div>`;
        return;
    }

    grid.innerHTML = coursesList.map(course => `
        <div class="course-card" onclick="openProductDetail('${course.id}')" role="button" tabindex="0">
            <div class="course-thumb">
                <img src="${course.thumbnail}" alt="${escapeHtml(course.title)}">
                <span class="course-category-tag"><i class="fa-solid ${course.icon}"></i> ${course.category}</span>
                <span class="course-price-tag">${course.price}</span>
            </div>
            <div class="course-body">
                <h3>${escapeHtml(course.title)}</h3>
                <div class="course-meta">
                    <span><i class="fa-solid fa-user-tie"></i> ${course.instructor}</span>
                    <span><i class="fa-regular fa-clock"></i> ${course.duration}</span>
                </div>
                <p class="course-desc">${escapeHtml(course.description)}</p>
                <div class="course-footer">
                    <button type="button" class="btn btn-orange btn-sm" onclick="event.stopPropagation(); addToCart('${course.id}')">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm buy-now-btn" onclick="event.stopPropagation(); openPaymentModal('${course.id}', '${escapeHtml(course.title)}', '${course.price}')">
                        <i class="fa-solid fa-bolt"></i> Buy Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterCoursesCategory(category, btnElement) {
    if (btnElement) {
        document.querySelectorAll('#course-category-pills .pill-btn').forEach(btn => btn.classList.remove('active'));
        btnElement.classList.add('active');
    }

    if (category === 'all') {
        renderCoursesPageGrid(state.courses);
    } else {
        const filtered = state.courses.filter(c => c.category === category);
        renderCoursesPageGrid(filtered);
    }
}

function handleCourseSearch(event) {
    const query = (event.target.value || '').toLowerCase().trim();
    if (!query) {
        renderCoursesPageGrid(state.courses);
        return;
    }

    const filtered = state.courses.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.instructor.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
    renderCoursesPageGrid(filtered);
}

function renderTeamView() {
    const grid = document.getElementById('team-cards-grid');
    if (!grid) return;

    const teamList = typeof INITIAL_TEAM !== 'undefined' ? INITIAL_TEAM : [];
    grid.innerHTML = teamList.map(member => `
        <div class="team-card">
            <img src="${member.avatar}" alt="${escapeHtml(member.name)}" class="team-avatar">
            <div class="team-body">
                <span class="badge badge-orange">${escapeHtml(member.badge)}</span>
                <h3 style="margin-top: 8px; font-size: 1.15rem;">${escapeHtml(member.name)}</h3>
                <div class="team-role">${escapeHtml(member.role)}</div>
                <div class="team-exp"><i class="fa-solid fa-briefcase"></i> ${escapeHtml(member.experience)}</div>
                <p style="font-size: 0.88rem; color: var(--text-body); margin-bottom: 12px;">${escapeHtml(member.bio)}</p>
                <div class="team-course-tag">
                    <i class="fa-solid fa-graduation-cap"></i> ${escapeHtml(member.courses)}
                </div>
            </div>
        </div>
    `).join('');
}

function renderTestimonialsView() {
    const grid = document.getElementById('testimonials-cards-grid');
    if (!grid) return;

    const approvedReviews = (state.reviews || []).filter(review => review.status === 'approved');

    if (approvedReviews.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--border-color); color: var(--text-body);">
                <i class="fa-solid fa-quote-left" style="font-size: 2rem; color: var(--orange-main); margin-bottom: 10px; display: block;"></i>
                <strong style="color: var(--blue-dark);">No approved reviews yet.</strong>
                <p style="margin-top: 6px;">Student feedback will appear here after admin approval.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = approvedReviews.map(item => `
        <div class="testimonial-card">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <img src="${item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${escapeHtml(item.name)}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h4 style="font-size: 1rem; color: var(--blue-dark);">${escapeHtml(item.name)}</h4>
                </div>
            </div>
            <div style="color: #f59e0b; font-size: 0.9rem; margin-bottom: 10px;">
                <i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i>
            </div>
            <p style="font-size: 0.92rem; color: var(--text-body); font-style: italic; margin-bottom: 15px;">"${escapeHtml(item.review)}"</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
                <span class="badge badge-success"><i class="fa-solid fa-trophy"></i> ${escapeHtml(item.outcome || 'Verified Graduate')}</span>
                <span style="font-size: 0.78rem; color: var(--text-body);">${escapeHtml(item.date || item.submittedAt || 'Just Now')}</span>
            </div>
        </div>
    `).join('');
}

function renderFaqsView() {
    const container = document.getElementById('faqs-accordion-container');
    if (!container) return;

    const faqs = typeof INITIAL_FAQS !== 'undefined' ? INITIAL_FAQS : [];
    container.innerHTML = faqs.map((faq, index) => `
        <div class="faq-item">
            <div class="faq-question" onclick="toggleFaqAnswer(this)">
                <span><i class="fa-solid fa-circle-question" style="color: var(--orange-main); margin-right: 8px;"></i> ${escapeHtml(faq.question)}</span>
                <i class="fa-solid fa-chevron-down faq-icon"></i>
            </div>
            <div class="faq-answer" style="display: ${index === 0 ? 'block' : 'none'};">
                ${escapeHtml(faq.answer)}
            </div>
        </div>
    `).join('');
}

function toggleFaqAnswer(headerElem) {
    const answerElem = headerElem.nextElementSibling;
    const icon = headerElem.querySelector('.faq-icon');
    if (answerElem.style.display === 'none') {
        answerElem.style.display = 'block';
        if (icon) icon.className = 'fa-solid fa-chevron-up faq-icon';
    } else {
        answerElem.style.display = 'none';
        if (icon) icon.className = 'fa-solid fa-chevron-down faq-icon';
    }
}

function handleAdmissionSubmit(event) {
    event.preventDefault();
    const courseId = document.getElementById('adm-course-select').value;
    const name = document.getElementById('adm-name').value.trim();
    const phone = document.getElementById('adm-phone').value.trim();
    const email = document.getElementById('adm-email').value.trim();
    const trxId = document.getElementById('adm-trx').value.trim();

    if (!courseId || !name || !phone || !email || !trxId) {
        showToast('Please fill out all required fields', 'error');
        return;
    }

    const course = state.courses.find(c => c.id === courseId);
    const newReq = {
        id: `pay-${Date.now().toString().slice(-5)}`,
        studentName: name,
        email: email,
        phone: phone,
        courseId: courseId,
        courseTitle: course ? course.title : 'Selected Course',
        amount: course ? course.price : 'Rs. 15,000',
        paymentMethod: 'JazzCash / Bank Transfer',
        trxId: trxId,
        status: 'pending',
        submittedAt: new Date().toLocaleString()
    };

    state.paymentRequests.unshift(newReq);
    saveRequests();

    document.getElementById('admission-online-form').reset();
    showToast('Admission application & payment details submitted! Admin will verify and activate your LMS account.', 'success');
}

function handleContactSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('c-name').value.trim();
    const email = document.getElementById('c-email').value.trim();
    const phone = document.getElementById('c-phone').value.trim();
    const subject = document.getElementById('c-subject').value.trim();
    const message = document.getElementById('c-message').value.trim();

    if (!name || !email || !phone || !message) {
        showToast('Please fill in your name, email, phone number, and message before sending.', 'error');
        return;
    }

    const newContactMessage = {
        id: `msg-${Date.now()}`,
        name: name,
        email: email,
        phone: phone,
        subject: subject || 'General Inquiry',
        message: message,
        submittedAt: new Date().toLocaleString(),
        status: 'new'
    };

    state.contactMessages.unshift(newContactMessage);
    saveContactMessages();
    document.getElementById('contact-message-form').reset();
    showToast(`Thank you ${name}! Your inquiry has been sent to SkillzHub Support. We will reply within 24 hours.`, 'success');
}

function previewReviewPhoto(event) {
    const file = event.target.files && event.target.files[0];
    const previewWrapper = document.getElementById('rev-photo-preview-wrapper');
    const previewImg = document.getElementById('rev-photo-preview');

    if (!file || !previewWrapper || !previewImg) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewWrapper.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function handleReviewSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('rev-name').value.trim();
    const course = document.getElementById('rev-course').value.trim();
    const reviewText = document.getElementById('rev-text').value.trim();
    const photoInput = document.getElementById('rev-photo');
    const photoFile = photoInput && photoInput.files ? photoInput.files[0] : null;

    if (!name || !course || !reviewText) {
        showToast('Please fill in all review fields before submitting.', 'error');
        return;
    }

    let avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    if (photoFile) {
        avatar = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) { resolve(e.target.result); };
            reader.onerror = function() { resolve('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'); };
            reader.readAsDataURL(photoFile);
        });
    }

    const newReview = {
        id: `review-${Date.now()}`,
        name: name,
        course: course,
        rating: 5,
        review: reviewText,
        outcome: 'Verified Graduate',
        avatar: avatar,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: 'pending',
        submittedAt: new Date().toLocaleString()
    };

    state.reviews.unshift(newReview);
    saveReviews();
    renderTestimonialsView();

    document.getElementById('review-submit-form').reset();
    const previewWrapper = document.getElementById('rev-photo-preview-wrapper');
    if (previewWrapper) previewWrapper.style.display = 'none';

    showToast('Thank you! Your review has been submitted and is waiting for admin approval.', 'success');
}

// Auto-run init on load
initApp();

