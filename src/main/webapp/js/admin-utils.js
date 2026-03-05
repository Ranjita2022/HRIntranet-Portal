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
                const error = await response.text();
                throw new Error(error || 'Login failed');
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
                headers
            });
            
            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                this.logout();
                window.location.href = 'admin-login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
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
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
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
 * Activate sidebar menu item based on current page URL
 */
function activateCurrentMenu() {
    const currentPage = window.location.pathname.split('/').pop();
    const menuItems = document.querySelectorAll('.sidebar-menu a.menu-item');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Initialize API on load
AdminAPI.init();

// Activate current menu on page load
document.addEventListener('DOMContentLoaded', activateCurrentMenu);

// Make AdminAPI available globally
window.AdminAPI = AdminAPI;
window.showToast = showToast;
window.confirmAction = confirmAction;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.showLoading = showLoading;
window.showError = showError;
window.validateImageFile = validateImageFile;
window.previewImage = previewImage;
window.activateCurrentMenu = activateCurrentMenu;
