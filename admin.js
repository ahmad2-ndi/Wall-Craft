// SkillzHub LMS - Standalone Admin Panel Controller

let adminState = {
    courses: INITIAL_COURSES,
    users: INITIAL_USERS,
    paymentRequests: INITIAL_PAYMENT_REQUESTS,
    reviews: INITIAL_REVIEWS,
    contactMessages: INITIAL_CONTACT_MESSAGES,
    messageRecords: INITIAL_MESSAGE_RECORDS,
    currentAdmin: null,
    adminTab: 'requests'
};

function initAdminApp() {
    try {
        const storedCourses = localStorage.getItem('skillzhub_courses');
        const storedUsers = localStorage.getItem('skillzhub_users');
        const storedRequests = localStorage.getItem('skillzhub_payment_requests');
        const storedReviews = localStorage.getItem('skillzhub_reviews');
        const storedContactMessages = localStorage.getItem('skillzhub_contact_messages');
        const storedMessageRecords = localStorage.getItem('skillzhub_message_records');
        const savedAdminSession = sessionStorage.getItem('skillzhub_session_admin');

        if (storedCourses) adminState.courses = JSON.parse(storedCourses);
        else localStorage.setItem('skillzhub_courses', JSON.stringify(adminState.courses));

        if (storedUsers) adminState.users = JSON.parse(storedUsers);
        else localStorage.setItem('skillzhub_users', JSON.stringify(adminState.users));

        const adminUser = adminState.users.find(user => user.id === 'usr-admin-1' || user.role === 'admin');
        if (adminUser) {
            adminUser.email = 'mr.pakistani@gmail.com';
            adminUser.password = 'abubakar@123';
            localStorage.setItem('skillzhub_users', JSON.stringify(adminState.users));
        }

        if (storedRequests) adminState.paymentRequests = JSON.parse(storedRequests);
        else localStorage.setItem('skillzhub_payment_requests', JSON.stringify(adminState.paymentRequests));

        if (storedReviews) adminState.reviews = JSON.parse(storedReviews);
        else localStorage.setItem('skillzhub_reviews', JSON.stringify(adminState.reviews));

        if (storedContactMessages) adminState.contactMessages = JSON.parse(storedContactMessages);
        else localStorage.setItem('skillzhub_contact_messages', JSON.stringify(adminState.contactMessages));

        if (storedMessageRecords) adminState.messageRecords = JSON.parse(storedMessageRecords);
        else localStorage.setItem('skillzhub_message_records', JSON.stringify(adminState.messageRecords));

        if (savedAdminSession) {
            adminState.currentAdmin = JSON.parse(savedAdminSession);
            showAdminDashboard();
            return;
        }
    } catch (e) {
        console.error("Storage init error in Admin Panel:", e);
    }

    showAdminLoginView();
}

function saveUsers() {
    localStorage.setItem('skillzhub_users', JSON.stringify(adminState.users));
}

function saveRequests() {
    localStorage.setItem('skillzhub_payment_requests', JSON.stringify(adminState.paymentRequests));
}

function saveReviews() {
    localStorage.setItem('skillzhub_reviews', JSON.stringify(adminState.reviews));
}

function saveContactMessages() {
    localStorage.setItem('skillzhub_contact_messages', JSON.stringify(adminState.contactMessages));
}

function saveMessageRecords() {
    localStorage.setItem('skillzhub_message_records', JSON.stringify(adminState.messageRecords));
}

function saveCourses() {
    localStorage.setItem('skillzhub_courses', JSON.stringify(adminState.courses));
}

function readAdminImage(file, callback) {
    if (!file) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onload = event => callback(event.target.result);
    reader.onerror = () => callback(null);
    reader.readAsDataURL(file);
}

function readAdminImages(files, callback) {
    const selectedFiles = Array.from(files || []).slice(0, 4);
    if (!selectedFiles.length) {
        callback([]);
        return;
    }
    let completed = 0;
    const images = [];
    selectedFiles.forEach(file => readAdminImage(file, dataUrl => {
        if (dataUrl) images.push(dataUrl);
        completed += 1;
        if (completed === selectedFiles.length) callback(images);
    }));
}

function openProductModal() {
    const form = document.getElementById('product-form');
    if (form) form.reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-main-image').required = true;
    document.querySelector('#product-modal h3').innerHTML = '<i class="fa-solid fa-cube" style="color:var(--orange-main);"></i> Add Store Product';
    document.querySelector('#product-form button[type="submit"]').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Product';
    const duration = document.getElementById('product-duration');
    if (duration) duration.value = 'Ready to Order';
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('active');
}

function editProduct(productId) {
    const product = adminState.courses.find(item => item.id === productId);
    if (!product) return;
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.priceNumber;
    document.getElementById('product-duration').value = product.duration || 'Ready to Order';
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-main-image').required = false;
    document.querySelector('#product-modal h3').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color:var(--orange-main);"></i> Edit Store Product';
    document.querySelector('#product-form button[type="submit"]').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Changes';
    document.getElementById('product-modal').classList.add('active');
}

function deleteProduct(productId) {
    const product = adminState.courses.find(item => item.id === productId);
    if (!product) return;
    if (!confirm(`Delete "${product.title}" from the storefront?`)) return;
    adminState.courses = adminState.courses.filter(item => item.id !== productId);
    saveCourses();
    renderProductsTable();
    showToast('Product deleted from the Shop.', 'success');
}

function renderProductsTable() {
    const grid = document.getElementById('products-admin-grid');
    const count = document.getElementById('products-count');
    if (!grid) return;
    if (count) count.textContent = adminState.courses.length;
    grid.innerHTML = adminState.courses.map(product => `
        <article class="admin-product-card">
            <img src="${product.thumbnail}" alt="${escapeHtml(product.title)}">
            <div class="admin-product-card-body">
                <span>${escapeHtml(product.category)}</span>
                <h3>${escapeHtml(product.title)}</h3>
                <strong>${escapeHtml(product.price)}</strong>
                <p>${escapeHtml(product.description)}</p>
                <div class="admin-product-actions">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="editProduct('${product.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                    <button type="button" class="btn btn-outline btn-sm product-delete-btn" onclick="deleteProduct('${product.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
                </div>
            </div>
        </article>
    `).join('');
}

function handleAddProduct(event) {
    if (event) event.preventDefault();

    const title = document.getElementById('product-title').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const priceNumber = Number(document.getElementById('product-price').value);
    const duration = document.getElementById('product-duration').value.trim() || 'Ready to Order';
    const description = document.getElementById('product-description').value.trim();
    const mainInput = document.getElementById('product-main-image');
    const galleryInput = document.getElementById('product-gallery-images');
    const mainFile = mainInput.files && mainInput.files[0];
    const productId = document.getElementById('product-id').value;
    const existingProduct = adminState.courses.find(item => item.id === productId);

    if (!title || !category || !description || !Number.isFinite(priceNumber) || priceNumber < 0 || (!mainFile && !existingProduct)) {
        showToast('Complete product details and select a main image.', 'error');
        return;
    }

    readAdminImage(mainFile, mainImage => {
        const selectedMainImage = mainImage || (existingProduct && existingProduct.thumbnail);
        if (!selectedMainImage) {
            showToast('The main product image could not be read.', 'error');
            return;
        }
        readAdminImages(galleryInput.files, galleryImages => {
            const previousGallery = existingProduct && Array.isArray(existingProduct.gallery) ? existingProduct.gallery : [];
            const gallery = [selectedMainImage, ...(galleryImages.length ? galleryImages : previousGallery).filter(image => image !== selectedMainImage)].slice(0, 4);
            const product = {
                ...(existingProduct || {}),
                id: productId || 'product-' + Date.now(),
                title,
                category,
                price: `Rs. ${priceNumber.toLocaleString('en-PK')}`,
                priceNumber,
                icon: 'fa-cube',
                thumbnail: selectedMainImage,
                gallery,
                description,
                instructor: 'Wall Crafter',
                level: 'Custom Product',
                duration,
                badge: '',
                modules: []
            };
            if (existingProduct) {
                const index = adminState.courses.findIndex(item => item.id === productId);
                adminState.courses[index] = product;
            } else {
                adminState.courses.unshift(product);
            }
            saveCourses();
            closeModal('product-modal');
            renderProductsTable();
            showToast(existingProduct ? 'Product updated in the Shop.' : 'Product added to the Wall Crafter Shop.', 'success');
        });
    });
}

function showAdminLoginView() {
    document.getElementById('admin-login-view').style.display = 'block';
    document.getElementById('admin-dashboard-view').style.display = 'none';

    const container = document.getElementById('admin-nav-user-container');
    if (container) {
        container.innerHTML = `<span class="badge-admin"><i class="fa-solid fa-lock"></i> Secure Workspace</span>`;
    }
}

function showAdminDashboard() {
    document.getElementById('admin-login-view').style.display = 'none';
    document.getElementById('admin-dashboard-view').style.display = 'block';

    const container = document.getElementById('admin-nav-user-container');
    if (container && adminState.currentAdmin) {
        const displayName = adminState.currentAdmin.role === 'admin' ? 'Wall Crafter Admin' : adminState.currentAdmin.name;
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
                <span style="font-weight: 700; color: var(--blue-dark); font-size: 0.88rem;">${escapeHtml(displayName)}</span>
                <span class="badge-admin">ADMIN</span>
            </div>
        `;
    }

    renderDashboard();
}

function handleAdminLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!email || !password) {
        showToast('Please enter both Email and Password.', 'error');
        return;
    }

    const adminUser = adminState.users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === 'admin'
    );

    if (!adminUser) {
        showToast('Invalid Admin credentials! Only authorized admins can login.', 'error');
        return;
    }

    adminState.currentAdmin = adminUser;
    sessionStorage.setItem('skillzhub_session_admin', JSON.stringify(adminUser));
    showToast(`Welcome ${adminUser.name}! Logged in successfully.`, 'success');
    showAdminDashboard();
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

attachPasswordToggle('admin-password');

function handleAdminLogout() {
    adminState.currentAdmin = null;
    sessionStorage.removeItem('skillzhub_session_admin');
    showAdminLoginView();
    showToast('Admin logged out successfully.', 'info');
}

// --- TABS ---
function setTab(tab) {
    adminState.adminTab = tab;

    document.getElementById('tab-requests').classList.toggle('active', tab === 'requests');
    const productsTab = document.getElementById('tab-products');
    if (productsTab) productsTab.classList.toggle('active', tab === 'products');
    const studentsTab = document.getElementById('tab-students');
    const reviewsTab = document.getElementById('tab-reviews');
    if (studentsTab) studentsTab.classList.toggle('active', tab === 'students');
    if (reviewsTab) reviewsTab.classList.toggle('active', tab === 'reviews');
    document.getElementById('tab-messages').classList.toggle('active', tab === 'messages');

    document.getElementById('requests-view').style.display = tab === 'requests' ? 'block' : 'none';
    const productsView = document.getElementById('products-view');
    if (productsView) productsView.style.display = tab === 'products' ? 'block' : 'none';
    const studentsView = document.getElementById('students-view');
    const reviewsView = document.getElementById('reviews-view');
    if (studentsView) studentsView.style.display = tab === 'students' ? 'block' : 'none';
    if (reviewsView) reviewsView.style.display = tab === 'reviews' ? 'block' : 'none';
    document.getElementById('messages-view').style.display = tab === 'messages' ? 'block' : 'none';

    renderDashboard();
}

// --- RENDER DASHBOARD ---
function renderDashboard() {
    // Sync from localStorage (stay updated with LMS main site)
    const storedUsers = localStorage.getItem('skillzhub_users');
    const storedRequests = localStorage.getItem('skillzhub_payment_requests');
    const storedMessages = localStorage.getItem('skillzhub_contact_messages');
    const storedRecords = localStorage.getItem('skillzhub_message_records');
    if (storedUsers) adminState.users = JSON.parse(storedUsers);
    if (storedRequests) adminState.paymentRequests = JSON.parse(storedRequests);
    if (storedMessages) adminState.contactMessages = JSON.parse(storedMessages);
    if (storedRecords) adminState.messageRecords = JSON.parse(storedRecords);

    const studentUsers = adminState.users.filter(u => u.role === 'student');
    const pendingRequests = adminState.paymentRequests.filter(r => r.status === 'pending');
    const totalMessages = adminState.contactMessages || [];

    document.getElementById('stat-pending').textContent = pendingRequests.length;
    document.getElementById('pending-count').textContent = pendingRequests.length;
    const messagesCountEl = document.getElementById('messages-count');
    if (messagesCountEl) messagesCountEl.textContent = totalMessages.length;

    const countEl = document.getElementById('students-count');
    if (countEl) countEl.textContent = studentUsers.length;

    if (adminState.adminTab === 'requests') {
        renderPaymentRequestsTable();
    } else if (adminState.adminTab === 'products') {
        renderProductsTable();
    } else if (adminState.adminTab === 'reviews') {
        renderReviewsTable();
    } else if (adminState.adminTab === 'messages') {
        renderContactMessagesTable();
        renderMessageRecordsTable();
    } else {
        renderStudentsTable(studentUsers);
    }
}

// --- PAYMENT REQUESTS TABLE ---
function renderPaymentRequestsTable() {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;

    if (adminState.paymentRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-body);">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.4;"></i>
                    No payment requests submitted yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = adminState.paymentRequests.map(req => {
        const isPending = req.status === 'pending';
        const hasScreenshot = Boolean(req.screenshotDataUrl);

        return `
            <tr>
                <td><strong style="color: var(--blue-dark);">${escapeHtml(req.studentName)}</strong></td>
                <td>
                    <div>${escapeHtml(req.email)}</div>
                    <div style="font-size: 0.78rem; color: var(--text-body);">
                        <i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> ${escapeHtml(req.phone)}
                    </div>
                </td>
                <td><span class="badge badge-blue">${escapeHtml(req.courseTitle)}</span></td>
                <td style="max-width: 220px; white-space: normal; font-size: 0.8rem;">${escapeHtml(req.address || 'No address provided')}</td>
                <td>
                    <div><strong>${escapeHtml(req.amount)}</strong></div>
                    <div style="font-size: 0.78rem; color: var(--text-body);">${escapeHtml(req.paymentMethod)}</div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 6px; align-items: flex-start;">
                        <code>${escapeHtml(req.trxId)}</code>
                        ${hasScreenshot ? `
                            <button type="button" class="btn btn-secondary btn-sm" onclick="viewPaymentScreenshot('${req.id}')" style="font-size: 0.75rem; padding: 4px 9px;">
                                <i class="fa-solid fa-image" style="color: var(--orange-main);"></i> View Receipt
                            </button>
                        ` : `
                            <span style="font-size: 0.74rem; color: #94a3b8;"><i class="fa-solid fa-ban"></i> No Screenshot</span>
                        `}
                    </div>
                </td>
                <td style="font-size: 0.8rem;">${escapeHtml(req.submittedAt)}</td>
                <td style="text-align: right;">
                    ${isPending ? `
                        <button type="button" class="btn btn-orange btn-sm" onclick="approvePaymentRequest('${req.id}')">
                            <i class="fa-solid fa-check"></i> Approve
                        </button>
                    ` : `
                        <span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Approved</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function viewPaymentScreenshot(requestId) {
    const req = adminState.paymentRequests.find(r => r.id === requestId);
    if (!req || !req.screenshotDataUrl) {
        showToast('No screenshot image available for this request.', 'info');
        return;
    }

    const modalImg = document.getElementById('screenshot-modal-img');
    if (modalImg) modalImg.src = req.screenshotDataUrl;

    const modal = document.getElementById('screenshot-modal');
    if (modal) modal.classList.add('active');
}

function approvePaymentRequest(requestId) {
    const req = adminState.paymentRequests.find(r => r.id === requestId);
    if (!req) return;

    const autoPassword = "std" + Math.floor(1000 + Math.random() * 9000);
    let user = adminState.users.find(u => u.email.toLowerCase() === req.email.toLowerCase());

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
        adminState.users.push(user);
    }

    req.status = 'approved';

    saveUsers();
    saveRequests();

    alert(`✅ Account Approved & Created Successfully!\n\nStudent Name: ${req.studentName}\nLogin Email: ${req.email}\nAssigned Password: ${user.password}\nCourse Access Granted: ${req.courseTitle}\n\nPlease share these login credentials with the student.`);

    showToast(`Approved! Trx ID: ${req.trxId}`, 'success');
    renderDashboard();
}

function renderReviewsTable() {
    const tbody = document.getElementById('reviews-table-body');
    if (!tbody) return;

    const reviews = adminState.reviews || [];

    if (reviews.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-body);">
                    <i class="fa-solid fa-star-half-stroke" style="font-size: 2rem; display: block; margin-bottom: 10px; opacity: 0.45;"></i>
                    No student reviews submitted yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = reviews.map(review => {
        const isPending = review.status === 'pending';

        return `
            <tr>
                <td><strong style="color: var(--blue-dark);">${escapeHtml(review.name)}</strong></td>
                <td><span class="badge badge-blue">${escapeHtml(review.course)}</span></td>
                <td>
                    <div style="max-width: 320px;">${escapeHtml(review.review)}</div>
                </td>
                <td>
                    ${review.avatar ? `<img src="${review.avatar}" alt="${escapeHtml(review.name)}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);">` : '—'}
                </td>
                <td style="font-size: 0.8rem;">${escapeHtml(review.submittedAt || review.date || 'Just Now')}</td>
                <td style="text-align: right;">
                    ${isPending ? `
                        <div style="display:flex; gap:6px; justify-content:flex-end; flex-wrap:wrap;">
                            <button type="button" class="btn btn-orange btn-sm" onclick="approveReview('${review.id}')"><i class="fa-solid fa-check"></i> Approve</button>
                            <button type="button" class="btn btn-secondary btn-sm" onclick="rejectReview('${review.id}')"><i class="fa-solid fa-xmark"></i> Reject</button>
                        </div>
                    ` : `
                        <span class="badge badge-green"><i class="fa-solid fa-circle-check"></i> Approved</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

function approveReview(reviewId) {
    const review = adminState.reviews.find(r => r.id === reviewId);
    if (!review) return;

    review.status = 'approved';
    saveReviews();
    renderDashboard();
    showToast('Review approved and now visible on public pages.', 'success');
}

function rejectReview(reviewId) {
    const review = adminState.reviews.find(r => r.id === reviewId);
    if (!review) return;

    review.status = 'rejected';
    saveReviews();
    renderDashboard();
    showToast('Review rejected and hidden from public pages.', 'info');
}

function renderContactMessagesTable() {
    const tbody = document.getElementById('messages-table-body');
    if (!tbody) return;

    const messages = adminState.contactMessages || [];

    if (messages.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-body);">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 10px; opacity: 0.45;"></i>
                    No client messages received yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = messages.map(message => `
        <tr>
            <td><strong style="color: var(--blue-dark);">${escapeHtml(message.name)}</strong></td>
            <td>${escapeHtml(message.email)}</td>
            <td>${escapeHtml(message.phone || '—')}</td>
            <td><span class="badge badge-blue">${escapeHtml(message.subject || 'General Inquiry')}</span></td>
            <td>
                <div style="max-width: 320px; white-space: normal;">${escapeHtml(message.message)}</div>
            </td>
            <td style="font-size: 0.8rem;">${escapeHtml(message.submittedAt || 'Just Now')}</td>
            <td style="text-align: right;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="readMessage('${message.id}')">
                    <i class="fa-solid fa-check"></i> Read
                </button>
            </td>
        </tr>
    `).join('');
}

function readMessage(messageId) {
    const messageIndex = adminState.contactMessages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const [message] = adminState.contactMessages.splice(messageIndex, 1);
    adminState.messageRecords.unshift({
        id: message.id,
        name: message.name,
        email: message.email,
        phone: message.phone || '—',
        readAt: new Date().toLocaleString()
    });

    saveContactMessages();
    saveMessageRecords();
    renderDashboard();
    showToast('Message marked as read and moved to records.', 'success');
}

function renderMessageRecordsTable() {
    const tbody = document.getElementById('message-records-table-body');
    if (!tbody) return;

    const records = adminState.messageRecords || [];

    if (records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-body);">
                    <i class="fa-solid fa-bookmark" style="font-size: 1.8rem; display: block; margin-bottom: 10px; opacity: 0.45;"></i>
                    No message records yet.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = records.map(record => `
        <tr>
            <td><strong style="color: var(--blue-dark);">${escapeHtml(record.name)}</strong></td>
            <td>${escapeHtml(record.email)}</td>
            <td>${escapeHtml(record.phone || '—')}</td>
            <td style="font-size: 0.8rem;">${escapeHtml(record.readAt || 'Just Now')}</td>
            <td style="text-align: right;">
                <button type="button" class="btn btn-outline btn-sm" onclick="deleteMessageRecord('${record.id}')" style="color:#ef4444; border-color:#fca5a5;">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

function deleteMessageRecord(recordId) {
    const recordIndex = adminState.messageRecords.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return;

    adminState.messageRecords.splice(recordIndex, 1);
    saveMessageRecords();
    renderDashboard();
    showToast('Message record deleted successfully.', 'info');
}

// --- STUDENTS TABLE ---
function renderStudentsTable(studentUsers) {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = studentUsers.filter(u =>
        u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );

    const countEl = document.getElementById('students-count');
    if (countEl) countEl.textContent = filtered.length;

    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 40px;">No student accounts found.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(student => {
        const enrolledBadges = (student.enrolledCourseIds || []).map(cId => {
            const course = adminState.courses.find(c => c.id === cId);
            return course ? `<span class="badge badge-blue"><i class="fa-solid ${course.icon}"></i> ${course.title.split(' ')[0]}</span>` : '';
        }).join(' ');

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="avatar" style="width:32px; height:32px; font-size:0.82rem;">${student.name.charAt(0).toUpperCase()}</div>
                        <strong style="color: var(--blue-dark);">${escapeHtml(student.name)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(student.email)}</td>
                <td><code>${escapeHtml(student.password)}</code></td>
                <td>${enrolledBadges || '<span style="color:#94a3b8; font-size:0.8rem;">No courses</span>'}</td>
                <td>${student.createdAt || '—'}</td>
                <td style="text-align: right;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="openUserModal('${student.id}')" title="Edit">
                        <i class="fa-solid fa-pen-to-square"></i> Manage
                    </button>
                    <button type="button" class="btn btn-outline btn-sm" onclick="deleteUser('${student.id}')" style="color:#ef4444; border-color:#fca5a5; margin-left:4px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// --- USER MODAL ---
function openUserModal(userId) {
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

    let targetUser = userId ? adminState.users.find(u => u.id === userId) : null;

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

    checkboxContainer.innerHTML = adminState.courses.map(course => {
        const isChecked = targetUser && (targetUser.enrolledCourseIds || []).includes(course.id);
        return `
            <label class="checkbox-card">
                <input type="checkbox" name="enrolled_courses" value="${course.id}" ${isChecked ? 'checked' : ''}>
                <div>
                    <div style="font-weight: 700; color: var(--blue-dark); font-size: 0.88rem;">
                        <i class="fa-solid ${course.icon}" style="color: var(--orange-main);"></i> ${escapeHtml(course.title)}
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
        const idx = adminState.users.findIndex(u => u.id === userId);
        if (idx !== -1) {
            adminState.users[idx].name = name;
            adminState.users[idx].email = email;
            adminState.users[idx].password = password;
            adminState.users[idx].enrolledCourseIds = enrolledCourseIds;
        }
        showToast(`Updated account for ${name}`, 'success');
    } else {
        if (adminState.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('A user with this email already exists.', 'error');
            return;
        }

        const newUser = {
            id: 'usr-std-' + Date.now(),
            name, email, password,
            role: 'student',
            createdAt: new Date().toISOString().split('T')[0],
            enrolledCourseIds,
            completedLessonIds: []
        };
        adminState.users.push(newUser);
        showToast(`Account created for ${name}!`, 'success');
    }

    saveUsers();
    closeModal('user-modal');
    renderDashboard();
}

function deleteUser(userId) {
    const user = adminState.users.find(u => u.id === userId);
    if (!user) return;

    if (confirm(`Are you sure you want to delete student account "${user.name}"?`)) {
        adminState.users = adminState.users.filter(u => u.id !== userId);
        saveUsers();
        renderDashboard();
        showToast('Student account deleted.', 'info');
    }
}

// --- MODALS ---
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

// --- TOAST ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    const icons = { success: 'fa-circle-check', error: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const icon = icons[type] || icons.info;

    toast.style.background = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#0a4c8a';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --- HELPERS ---
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Auto-initialize
initAdminApp();
