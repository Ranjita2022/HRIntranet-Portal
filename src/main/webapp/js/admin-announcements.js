/**
 * Announcements Management
 * CRUD operations for managing announcements with image upload
 */

let announcementsData = [];
let editingAnnouncementId = null;

/**
 * Initialize announcements section
 */
async function initAnnouncements() {
    await loadAnnouncements();
}

/**
 * Load all announcements from API
 */
async function loadAnnouncements() {
    try {
        showLoadingTable('announcementsTableBody', 8);
        const response = await AdminAPI.announcements.getAll();
        
        // API returns array directly
        if (Array.isArray(response)) {
            announcementsData = response;
            renderAnnouncementsTable();
        } else {
            showError('Failed to load announcements: Invalid response format');
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        showError('Error loading announcements: ' + error.message);
    }
}

/**
 * Render announcements table
 */
function renderAnnouncementsTable() {
    const tbody = document.getElementById('announcementsTableBody');
    const emptyState = document.getElementById('announcementsEmptyState');
    
    if (!announcementsData || announcementsData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('announcementsTable').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    document.getElementById('announcementsTable').style.display = 'table';
    
    // Sort by priority (highest first) then by publish date (newest first)
    const sortedAnnouncements = [...announcementsData].sort((a, b) => {
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        return new Date(b.publishDate) - new Date(a.publishDate);
    });
    
    tbody.innerHTML = sortedAnnouncements.map(announcement => {
        const publishDate = formatDate(announcement.publishDate);
        const expiryDate = announcement.expiryDate ? formatDate(announcement.expiryDate) : '-';
        const isExpired = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();
        
        const typeBadges = {
            'GENERAL': '<span class="badge bg-secondary">General</span>',
            'URGENT': '<span class="badge bg-warning text-dark">Urgent</span>',
            'BREAKING': '<span class="badge bg-danger">Breaking</span>',
            'POLICY': '<span class="badge bg-info">Policy</span>',
            'EVENT': '<span class="badge bg-success">Event</span>'
        };
        
        const statusBadge = announcement.isActive && !isExpired
            ? '<span class="badge bg-success ms-1">Active</span>'
            : isExpired
            ? '<span class="badge bg-secondary ms-1">Expired</span>'
            : '<span class="badge bg-secondary ms-1">Inactive</span>';
        
        const hasImage = announcement.imageId ? '<i class="bi bi-image-fill text-primary"></i>' : '';
        
        return `
            <tr>
                <td>${announcement.id}</td>
                <td>
                    <strong>${escapeHtml(announcement.title)}</strong>
                    ${hasImage}
                    ${announcement.priority > 0 ? `<span class="badge bg-primary ms-1">P${announcement.priority}</span>` : ''}
                </td>
                <td>${typeBadges[announcement.type] || announcement.type}</td>
                <td>${announcement.description ? escapeHtml(announcement.description.substring(0, 80)) + (announcement.description.length > 80 ? '...' : '') : '-'}</td>
                <td>${publishDate}</td>
                <td>${expiryDate}</td>
                <td>
                    ${typeBadges[announcement.type] || ''}
                    ${statusBadge}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditAnnouncementModal(${announcement.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" onclick="deleteAnnouncement(${announcement.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Show add announcement modal
 */
function showAddAnnouncementModal() {
    editingAnnouncementId = null;
    document.getElementById('announcementModalTitle').textContent = 'Add Announcement';
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementType').value = 'GENERAL';
    document.getElementById('announcementIsActive').checked = true;
    document.getElementById('announcementPriority').value = '0';
    
    // Set publish date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('announcementPublishDate').value = today;
    
    // Clear image preview
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('announcementImagePreview').src = '';
    
    const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
    modal.show();
}

/**
 * Show edit announcement modal
 */
async function showEditAnnouncementModal(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) {
        showError('Announcement not found');
        return;
    }
    
    editingAnnouncementId = id;
    document.getElementById('announcementModalTitle').textContent = 'Edit Announcement';
    document.getElementById('announcementType').value = announcement.type;
    document.getElementById('announcementTitle').value = announcement.title;
    document.getElementById('announcementDescription').value = announcement.description || '';
    document.getElementById('announcementPublishDate').value = announcement.publishDate;
    document.getElementById('announcementExpiryDate').value = announcement.expiryDate || '';
    document.getElementById('announcementIsActive').checked = announcement.isActive;
    document.getElementById('announcementPriority').value = announcement.priority || 0;
    
    // Show image preview if exists
    if (announcement.imageUrl) {
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('announcementImagePreview').src = announcement.imageUrl;
    } else {
        document.getElementById('imagePreviewContainer').style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
    modal.show();
}

/**
 * Handle image selection
 */
function handleAnnouncementImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('announcementImagePreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Save announcement (create or update)
 */
async function saveAnnouncement(event) {
    event.preventDefault();
    
    const type = document.getElementById('announcementType').value;
    const title = document.getElementById('announcementTitle').value.trim();
    const description = document.getElementById('announcementDescription').value.trim();
    const publishDate = document.getElementById('announcementPublishDate').value;
    const expiryDate = document.getElementById('announcementExpiryDate').value;
    const isActive = document.getElementById('announcementIsActive').checked;
    const priority = parseInt(document.getElementById('announcementPriority').value) || 0;
    const imageFile = document.getElementById('announcementImage').files[0];
    
    // Validation
    if (!title) {
        showError('Announcement title is required');
        return;
    }
    
    if (!publishDate) {
        showError('Publish date is required');
        return;
    }
    
    if (expiryDate && new Date(expiryDate) < new Date(publishDate)) {
        showError('Expiry date must be after publish date');
        return;
    }
    
    const announcementData = {
        type,
        title,
        description,
        publishDate,
        expiryDate: expiryDate || null,
        isActive,
        priority
    };
    
    try {
        let response;
        if (editingAnnouncementId) {
            // Update existing announcement
            response = await AdminAPI.announcements.update(editingAnnouncementId, announcementData);
        } else {
            // Create new announcement
            response = await AdminAPI.announcements.create(announcementData);
        }
        
        // API returns the announcement object directly
        if (response && response.id) {
            const announcementId = editingAnnouncementId || response.id;
            
            // Upload image if selected
            if (imageFile) {
                try {
                    const uploadResponse = await AdminAPI.announcements.uploadImage(announcementId, imageFile);
                    if (!uploadResponse || !uploadResponse.id) {
                        showError('Announcement saved but image upload failed');
                        await loadAnnouncements();
                        bootstrap.Modal.getInstance(document.getElementById('announcementModal')).hide();
                        return;
                    }
                } catch (uploadError) {
                    showError('Announcement saved but image upload failed: ' + uploadError.message);
                    await loadAnnouncements();
                    bootstrap.Modal.getInstance(document.getElementById('announcementModal')).hide();
                    return;
                }
            }
            
            showSuccess(editingAnnouncementId ? 'Announcement updated successfully' : 'Announcement created successfully');
            bootstrap.Modal.getInstance(document.getElementById('announcementModal')).hide();
            await loadAnnouncements();
        } else {
            showError('Failed to save announcement: Invalid response');
        }
    } catch (error) {
        console.error('Error saving announcement:', error);
        showError('Error saving announcement: ' + error.message);
    }
}

/**
 * Delete announcement
 */
async function deleteAnnouncement(id) {
    const announcement = announcementsData.find(a => a.id === id);
    if (!announcement) {
        showError('Announcement not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete the announcement "${announcement.title}"?`)) {
        return;
    }
    
    try {
        const response = await AdminAPI.announcements.delete(id);
        
        // API returns {message: "..."}
        if (response && response.message) {
            showSuccess('Announcement deleted successfully');
            await loadAnnouncements();
        } else {
            showError('Failed to delete announcement');
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showError('Error deleting announcement: ' + error.message);
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Show loading state
 */
function showLoadingTable(elementId, colspan) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<tr><td colspan="${colspan}" class="text-center"><div class="spinner-border spinner-border-sm" role="status"></div> Loading...</td></tr>`;
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show success message
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
    showToast(message, 'danger');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}
