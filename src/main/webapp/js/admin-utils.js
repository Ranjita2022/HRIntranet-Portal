/**
 * Admin Utilities - JWT Authentication & API Helper
 * Database-based authentication using JWT tokens
 */

const AdminAPI = {
    get baseURL() {
        return CONFIG.API_BASE_URL;
    },
    token: null,
    
    /**
     * Initialize - Load token from localStorage
     */
    init() {
        const storedToken = localStorage.getItem('admin_jwt_token');
        this.token = storedToken;
        console.log('🔧 AdminAPI initialized');
        console.log('  📦 Token from localStorage:', storedToken ? storedToken.substring(0, 50) + '...' : 'null');
        console.log('  ✓ Token loaded:', this.token !== null);
        console.log('  👤 Username:', localStorage.getItem('admin_username'));
        console.log('  🔍 Is Authenticated:', this.isAuthenticated());
    },
    
    /**
     * Login with username and password
     */
    async login(username, password) {
        try {
            console.log('🔐 AdminAPI.login() called for:', username);
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Login failed';
                
                // Try to parse as JSON and extract error message
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || 'Invalid username or password';
                } catch {
                    // If not JSON, use the text as-is (but only if it looks like a message)
                    errorMessage = errorText && errorText.length < 200 ? errorText : 'Invalid username or password';
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            console.log('📦 Login response:', data);
            
            this.token = data.token;
            console.log('💾 Setting token in memory:', this.token !== null);
            
            // Store token and user info
            localStorage.setItem('admin_jwt_token', data.token);
            localStorage.setItem('admin_username', data.username);
            localStorage.setItem('admin_fullname', data.fullName || data.username);
            localStorage.setItem('admin_role', data.role || 'USER');
            localStorage.setItem('admin_must_change_password', data.mustChangePassword ? 'true' : 'false');

            console.log('💾 Token saved to localStorage');
            console.log('✅ Login successful for:', data.username);
            console.log('🔍 Verification - Token in localStorage:', localStorage.getItem('admin_jwt_token') !== null);
            
            return data;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },
    
    /**
     * Logout - Clear token and redirect
     */
    logout() {
        this.token = null;
        localStorage.removeItem('admin_jwt_token');
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_fullname');
        localStorage.removeItem('admin_role');
        localStorage.removeItem('admin_must_change_password');
        console.log('🔓 Logged out');
    },
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const hasToken = !!this.token;
        if (!hasToken) {
            console.log('⚠️ isAuthenticated: false (no token)');
        }
        return hasToken;
    },
    
    /**
     * Get current user info
     */
    getCurrentUser() {
        return {
            username: localStorage.getItem('admin_username'),
            fullName: localStorage.getItem('admin_fullname'),
            role: localStorage.getItem('admin_role')
        };
    },
    
    /**
     * Get admin display name
     */
    getAdminName() {
        return localStorage.getItem('admin_fullname') || localStorage.getItem('admin_username') || 'Admin';
    },
    
    /**
     * Make authenticated API request
     */
    async fetch(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('Not authenticated. Please login first.');
        }
        
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const method = (options.method || 'GET').toUpperCase();
        
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };
        
        // Don't set Content-Type for FormData
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                cache: method === 'GET' ? 'no-store' : options.cache,
                headers
            });
            
            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                this.logout();
                window.location.href = 'admin-login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            // Handle 403 Forbidden - insufficient role
            if (response.status === 403) {
                throw new Error('Access denied. You do not have permission to access this resource.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}`;
                
                // Try to parse as JSON and extract error message
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || `HTTP ${response.status}`;
                } catch {
                    // If not JSON, strip HTML tags and use the text
                    const cleanError = errorText.replace(/<[^>]*>/g, '').trim();
                    errorMessage = cleanError.substring(0, 200) || `HTTP ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }
            
            // Return response for various content types
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    /**
     * Make authenticated multipart/form-data API request (for file uploads)
     */
    async fetchMultipart(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('Not authenticated. Please login first.');
        }
        
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };
        
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (options.headers && options.headers['Content-Type']) {
            delete headers['Content-Type'];
        }
        
        try {
            const response = await fetch(url, {
                ...options,
                headers
            });
            
            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                this.logout();
                window.location.href = 'admin-login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            // Handle 403 Forbidden - insufficient role
            if (response.status === 403) {
                throw new Error('Access denied. You do not have permission to access this resource.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}`;
                
                // Try to parse as JSON and extract error message
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || `HTTP ${response.status}`;
                } catch {
                    // If not JSON, strip HTML tags and use the text
                    const cleanError = errorText.replace(/<[^>]*>/g, '').trim();
                    errorMessage = cleanError.substring(0, 200) || `HTTP ${response.status}`;
                }
                
                throw new Error(errorMessage);
            }
            
            // Return response for various content types
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // === EMPLOYEES API ===
    employees: {
        async getAll() {
            return AdminAPI.fetch('/admin/employees');
        },
        
        async getDepartments() {
            return AdminAPI.fetch('/admin/employees/departments');
        },
        
        async getById(id) {
            return AdminAPI.fetch(`/admin/employees/${id}`);
        },
        
        async create(employee) {
            return AdminAPI.fetch('/admin/employees', {
                method: 'POST',
                body: JSON.stringify(employee)
            });
        },
        
        async update(id, employee) {
            return AdminAPI.fetch(`/admin/employees/${id}`, {
                method: 'PUT',
                body: JSON.stringify(employee)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/employees/${id}`, {
                method: 'DELETE'
            });
        },
        
        async uploadPhoto(id, file) {
            const formData = new FormData();
            formData.append('file', file);
            
            return AdminAPI.fetch(`/admin/employees/${id}/upload-photo`, {
                method: 'POST',
                body: formData
            });
        },
        
        async deletePhoto(id) {
            return AdminAPI.fetch(`/admin/employees/${id}/photo`, {
                method: 'DELETE'
            });
        }
    },
    
    // === ANNOUNCEMENTS API ===
    announcements: {
        async getAll() {
            return AdminAPI.fetch('/admin/announcements');
        },
        
        async create(announcement) {
            return AdminAPI.fetch('/admin/announcements', {
                method: 'POST',
                body: JSON.stringify(announcement)
            });
        },
        
        async update(id, announcement) {
            return AdminAPI.fetch(`/admin/announcements/${id}`, {
                method: 'PUT',
                body: JSON.stringify(announcement)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/announcements/${id}`, {
                method: 'DELETE'
            });
        },
        
        async uploadImage(id, file) {
            const formData = new FormData();
            formData.append('file', file);
            
            return AdminAPI.fetch(`/admin/announcements/${id}/upload-image`, {
                method: 'POST',
                body: formData
            });
        },

        async deleteImage(id) {
            return AdminAPI.fetch(`/admin/announcements/${id}/image`, {
                method: 'DELETE'
            });
        }
    },
    
    // === HOLIDAYS API ===
    holidays: {
        async getAll() {
            return AdminAPI.fetch('/admin/holidays');
        },
        
        async create(holiday) {
            return AdminAPI.fetch('/admin/holidays', {
                method: 'POST',
                body: JSON.stringify(holiday)
            });
        },
        
        async update(id, holiday) {
            return AdminAPI.fetch(`/admin/holidays/${id}`, {
                method: 'PUT',
                body: JSON.stringify(holiday)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/holidays/${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // === CAROUSEL API ===
    carousel: {
        async getAll() {
            return AdminAPI.fetch('/admin/carousel');
        },
        
        async create(formData) {
            return AdminAPI.fetch('/admin/carousel', {
                method: 'POST',
                body: formData
            });
        },
        
        async update(id, carousel) {
            return AdminAPI.fetch(`/admin/carousel/${id}`, {
                method: 'PUT',
                body: JSON.stringify(carousel)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/carousel/${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // === GALLERY API ===
    gallery: {
        async getAll() {
            return AdminAPI.fetch('/admin/gallery');
        },
        
        async upload(file, title, description, category) {
            const formData = new FormData();
            formData.append('file', file);
            if (title) formData.append('title', title);
            if (description) formData.append('description', description);
            if (category) formData.append('category', category);
            
            return AdminAPI.fetch('/admin/gallery', {
                method: 'POST',
                body: formData
            });
        },
        
        async bulkUpload(files, category) {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            if (category) formData.append('category', category);
            
            return AdminAPI.fetch('/admin/gallery/bulk-upload', {
                method: 'POST',
                body: formData
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/gallery/${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // === QUICK LINKS API ===
    quickLinks: {
        async getAll() {
            return AdminAPI.fetch('/admin/quick-links');
        },
        
        async create(link) {
            return AdminAPI.fetch('/admin/quick-links', {
                method: 'POST',
                body: JSON.stringify(link)
            });
        },
        
        async update(id, link) {
            return AdminAPI.fetch(`/admin/quick-links/${id}`, {
                method: 'PUT',
                body: JSON.stringify(link)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/quick-links/${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // === EMERGENCY CONTACTS API ===
    emergencyContacts: {
        async getAll() {
            return AdminAPI.fetch('/admin/emergency-contacts');
        },
        
        async create(contact) {
            return AdminAPI.fetch('/admin/emergency-contacts', {
                method: 'POST',
                body: JSON.stringify(contact)
            });
        },
        
        async update(id, contact) {
            return AdminAPI.fetch(`/admin/emergency-contacts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(contact)
            });
        },
        
        async delete(id) {
            return AdminAPI.fetch(`/admin/emergency-contacts/${id}`, {
                method: 'DELETE'
            });
        }
    },
    
    // === AUDIT LOGS API ===
    auditLogs: {
        async getAll(page = 0, size = 50) {
            return AdminAPI.fetch(`/admin/audit-logs?page=${page}&size=${size}`);
        },
        
        async getRecent(hours = 24) {
            return AdminAPI.fetch(`/admin/audit-logs/recent?hours=${hours}`);
        },
        
        async getStats() {
            return AdminAPI.fetch('/admin/audit-logs/stats');
        }
    },

    // === SHOUTOUTS API (READ-ONLY) ===
    shoutouts: {
        async getAll() {
            return AdminAPI.fetch('/admin/shoutouts');
        }
    },

    // === SUGGESTIONS API ===
    suggestions: {
        async getAll(status) {
            const qs = status && status !== 'ALL' ? `?status=${status}` : '';
            return AdminAPI.fetch(`/admin/suggestions${qs}`);
        },
        async update(id, payload) {
            return AdminAPI.fetch(`/admin/suggestions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        },
        async delete(id) {
            return AdminAPI.fetch(`/admin/suggestions/${id}`, { method: 'DELETE' });
        }
    },

    // === ADMIN USERS API ===
    adminUsers: {
        async getAll() {
            return AdminAPI.fetch('/admin/users');
        },
        async getById(id) {
            return AdminAPI.fetch(`/admin/users/${id}`);
        },
        async create(userData) {
            return AdminAPI.fetch('/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        },
        async createFromEmployee(data) {
            return AdminAPI.fetch('/admin/users/from-employee', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        async update(id, userData) {
            return AdminAPI.fetch(`/admin/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        },
        async delete(id) {
            return AdminAPI.fetch(`/admin/users/${id}`, { method: 'DELETE' });
        },
        async toggleActive(id) {
            return AdminAPI.fetch(`/admin/users/${id}/toggle-active`, { method: 'PATCH' });
        },
        async resetPassword(id, newPassword) {
            return AdminAPI.fetch(`/admin/users/${id}/reset-password`, {
                method: 'POST',
                body: JSON.stringify({ newPassword })
            });
        },
        async changePassword(username, oldPassword, newPassword) {
            return AdminAPI.fetch('/admin/users/change-password', {
                method: 'POST',
                body: JSON.stringify({ username, oldPassword, newPassword })
            });
        }
    }
};

// === UTILITY FUNCTIONS ===

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

/**
 * Show confirmation dialog
 */
function confirmAction(message) {
    return confirm(message);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Format datetime for display
 */
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Show loading spinner
 */
function showLoading(element) {
    element.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading...</p>
        </div>
    `;
}

/**
 * Show error message
 */
function showError(element, message) {
    element.innerHTML = `
        <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle"></i>
            ${message}
        </div>
    `;
}

/**
 * Validate file upload
 */
function validateImageFile(file, maxSizeMB = 10) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }
    
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
    }
    
    return true;
}

/**
 * Preview image file
 */
function previewImage(file, imgElement) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imgElement.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Restore the sidebar scroll position so the active menu item stays in view
 * when navigating between admin pages.
 */
function restoreSidebarScrollPosition() {
    const sidebar = document.querySelector('.sidebar');

    if (!sidebar) {
        return;
    }

    const savedScrollTop = sessionStorage.getItem('adminSidebarScrollTop');
    if (savedScrollTop !== null) {
        sidebar.scrollTop = Number.parseInt(savedScrollTop, 10) || 0;
    }

    sidebar.addEventListener('scroll', () => {
        sessionStorage.setItem('adminSidebarScrollTop', String(sidebar.scrollTop));
    }, { passive: true });
}

/**
 * Keep the active sidebar item visible without forcing a visible jump.
 */
function revealActiveSidebarItem() {
    const sidebar = document.querySelector('.sidebar');
    const activeItem = document.querySelector('.sidebar-menu a.menu-item.active');

    if (!sidebar || !activeItem) {
        return;
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const isVisible = itemRect.top >= sidebarRect.top && itemRect.bottom <= sidebarRect.bottom;

    if (isVisible) {
        return;
    }

    const targetScrollTop = sidebar.scrollTop + (itemRect.top - sidebarRect.top) - (sidebar.clientHeight / 2) + (activeItem.clientHeight / 2);
    sidebar.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'auto'
    });
}

/**
 * Show user-friendly logout confirmation dialog
 */
function showLogoutConfirmation() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="logoutConfirmationModal" tabindex="-1" style="display: none;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title d-flex align-items-center gap-2">
                            <i class="bi bi-exclamation-circle text-warning" style="font-size: 1.5rem;"></i>
                            Confirm Logout
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">
                            <i class="bi bi-info-circle text-primary"></i>
                            Are you sure you want to logout? You will need to login again to access the admin panel.
                        </p>
                    </div>
                    <div class="modal-footer border-0 pt-0">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-1"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-danger" id="confirmLogoutBtn">
                            <i class="bi bi-box-arrow-right me-1"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Check if modal already exists
    let modalElement = document.getElementById('logoutConfirmationModal');
    if (!modalElement) {
        // Create modal element
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        modalElement = tempDiv.firstElementChild;
        document.body.appendChild(modalElement);
    }
    
    // Set up logout button click handler
    const confirmBtn = modalElement.querySelector('#confirmLogoutBtn');
    confirmBtn.onclick = () => {
        AdminAPI.logout();
        window.location.href = 'admin-login.html';
    };
    
    // Show modal
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

/**
 * Activate sidebar menu item based on current page URL.
 * Runs automatically on every admin page — no need to hardcode active class.
 */
function activateCurrentMenu() {
    // Extract just the filename (e.g. "admin-employees.html")
    let currentPage = window.location.pathname.split('/').pop();

    // Fallback: treat root / empty as the dashboard
    if (!currentPage || currentPage === '') {
        currentPage = 'admin-panel.html';
    }

    // Remove query string if present
    currentPage = currentPage.split('?')[0];

    const menuItems = document.querySelectorAll('.sidebar-menu a.menu-item');
    let matched = false;

    menuItems.forEach(item => {
        const href = (item.getAttribute('href') || '').split('?')[0];
        if (href === currentPage) {
            item.classList.add('active');
            matched = true;
        } else {
            item.classList.remove('active');
        }
    });

    // If no exact match (e.g. deployed under a context path), try ends-with
    if (!matched) {
        menuItems.forEach(item => {
            const href = (item.getAttribute('href') || '');
            if (href && window.location.pathname.endsWith(href)) {
                item.classList.add('active');
            }
        });
    }
}

/**
 * Mobile sidebar toggle with backdrop.
 */
function setupMobileSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
        return;
    }

    let toggleBtn = document.getElementById('sidebarToggleBtn');
    if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.id = 'sidebarToggleBtn';
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.type = 'button';
        toggleBtn.setAttribute('aria-label', 'Toggle Sidebar');
        toggleBtn.setAttribute('title', 'Menu');
        toggleBtn.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
        // If a page header exists, place the toggle inside the header so it does
        // not float above and hide the page title when scrolling.
        const header = document.querySelector('.content-header');
        if (header) {
            // Place the toggle *above* the header so it doesn't overlap the title.
            toggleBtn.setAttribute('data-in-header', 'above');
            toggleBtn.style.position = 'fixed';
            toggleBtn.style.left = '0.75rem';
            toggleBtn.style.top = '0.6rem';
            toggleBtn.style.transform = '';
            toggleBtn.style.zIndex = '1200';
            // Insert before header to ensure logical order and enable header padding adjustment
            header.parentNode.insertBefore(toggleBtn, header);
            header.classList.add('has-toggle-above');
        } else {
            document.body.appendChild(toggleBtn);
        }
    }

    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebarBackdrop';
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);
    }

    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;

    const closeSidebar = () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
        // Show toggle button again when sidebar is closed
        if (toggleBtn) {
            toggleBtn.style.display = '';
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    };

    const openSidebar = () => {
        sidebar.classList.add('mobile-open');
        backdrop.classList.add('active');
        // Hide the toggle while sidebar is open to avoid covering content
        if (toggleBtn) {
            toggleBtn.style.display = 'none';
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
    };

    toggleBtn.onclick = () => {
        if (!isMobile()) {
            return;
        }
        if (sidebar.classList.contains('mobile-open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    };

    backdrop.onclick = closeSidebar;

    sidebar.addEventListener('click', (event) => {
        const clickedMenuItem = event.target.closest('.menu-item');
        if (clickedMenuItem && isMobile()) {
            closeSidebar();
        }
    });

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            closeSidebar();
        }
    });
}

/**
 * Allow collapsing sidebar sections on smaller screens.
 */
function setupSidebarCollapsibleSections() {
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (!sidebarMenu) {
        return;
    }

    if (sidebarMenu.dataset.sectionized === 'true') {
        return;
    }

    const children = Array.from(sidebarMenu.children);
    let currentWrapper = null;

    children.forEach((child) => {
        if (child.classList.contains('menu-section')) {
            child.classList.add('collapsible');
            child.setAttribute('role', 'button');
            child.setAttribute('tabindex', '0');

            currentWrapper = document.createElement('div');
            currentWrapper.className = 'menu-section-items';
            child.insertAdjacentElement('afterend', currentWrapper);
            return;
        }

        if (currentWrapper && child.classList.contains('menu-item')) {
            currentWrapper.appendChild(child);
        }
    });

    const sections = sidebarMenu.querySelectorAll('.menu-section.collapsible');
    sections.forEach((section) => {
        const wrapper = section.nextElementSibling;
        if (!wrapper || !wrapper.classList.contains('menu-section-items')) {
            return;
        }

        const sectionKey = `adminSidebarSection:${section.textContent.trim()}`;
        const savedState = sessionStorage.getItem(sectionKey);

        const hasActiveItem = Boolean(wrapper.querySelector('.menu-item.active'));
        const shouldCollapse = savedState === 'collapsed' && !hasActiveItem;

        if (shouldCollapse) {
            section.classList.add('collapsed');
            wrapper.classList.add('collapsed');
        }

        const toggleSection = () => {
            const isCollapsed = section.classList.toggle('collapsed');
            wrapper.classList.toggle('collapsed', isCollapsed);
            sessionStorage.setItem(sectionKey, isCollapsed ? 'collapsed' : 'expanded');
        };

        section.addEventListener('click', toggleSection);
        section.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleSection();
            }
        });
    });

    sidebarMenu.dataset.sectionized = 'true';
}

// Initialize API on load
AdminAPI.init();

// Activate current menu on page load
document.addEventListener('DOMContentLoaded', restoreSidebarScrollPosition);
document.addEventListener('DOMContentLoaded', activateCurrentMenu);
document.addEventListener('DOMContentLoaded', revealActiveSidebarItem);
document.addEventListener('DOMContentLoaded', setupMobileSidebarToggle);
document.addEventListener('DOMContentLoaded', setupSidebarCollapsibleSections);
document.addEventListener('DOMContentLoaded', function() {
    // Hide role-restricted menu items based on user role
    const role = localStorage.getItem('admin_role');
    if (role !== 'SUPER_ADMIN') {
        document.querySelectorAll('.super-admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    // Audit logs only available to ADMIN and SUPER_ADMIN
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
});

// Make AdminAPI available globally
window.AdminAPI = AdminAPI;
window.showToast = showToast;
window.confirmAction = confirmAction;
window.showLogoutConfirmation = showLogoutConfirmation;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.showLoading = showLoading;
window.showError = showError;
window.validateImageFile = validateImageFile;
window.previewImage = previewImage;
window.restoreSidebarScrollPosition = restoreSidebarScrollPosition;
window.revealActiveSidebarItem = revealActiveSidebarItem;
window.activateCurrentMenu = activateCurrentMenu;
window.setupMobileSidebarToggle = setupMobileSidebarToggle;
window.setupSidebarCollapsibleSections = setupSidebarCollapsibleSections;
