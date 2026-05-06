/**
 * Announcements Management
 * CRUD operations for managing announcements with image upload
 */

let announcementsData = [];
let editingAnnouncementId = null;
let hasExistingImageInEdit = false;

// Pagination variables
let announcementsCurrentPage = 1;
let announcementsItemsPerPage = 15;

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
    const tableCard  = document.getElementById('tableCard');

    if (!announcementsData || announcementsData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        if (tableCard) tableCard.style.display = 'none';
        updateStats([], []);
        updateAnnouncementsPaginationControls(0);
        return;
    }

    emptyState.style.display = 'none';
    if (tableCard) tableCard.style.display = '';

    // Sort by priority (highest first) then by publish date (newest first)
    const sortedAnnouncements = [...announcementsData].sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return new Date(b.publishDate) - new Date(a.publishDate);
    });

    // ── Stats ──
    const now = new Date();
    const activeList  = announcementsData.filter(a => a.isActive && !isAnnouncementExpired(a, now));
    const expiredList = announcementsData.filter(a => isAnnouncementExpired(a, now));
    const urgentList  = announcementsData.filter(a => a.type === 'URGENT' || a.type === 'BREAKING');
    updateStats(activeList, expiredList, urgentList);

    // ── Record count badge ──
    const countEl = document.getElementById('recordCount');
    if (countEl) countEl.textContent = announcementsData.length + ' record' + (announcementsData.length !== 1 ? 's' : '');

    // ── Pagination ──
    const totalPages = Math.ceil(sortedAnnouncements.length / announcementsItemsPerPage);
    if (announcementsCurrentPage > totalPages) {
        announcementsCurrentPage = Math.max(1, totalPages);
    }

    const startIndex = (announcementsCurrentPage - 1) * announcementsItemsPerPage;
    const pageAnnouncements = sortedAnnouncements.slice(startIndex, startIndex + announcementsItemsPerPage);

    // ── Type badge map ──
    const typeBadges = {
        'GENERAL': '<span class="badge badge-general">General</span>',
        'TRAINING':'<span class="badge badge-training">Training</span>',
        'URGENT':  '<span class="badge badge-urgent">Urgent</span>',
        'BREAKING':'<span class="badge badge-breaking">Breaking</span>',
        'POLICY':  '<span class="badge badge-policy">Policy</span>',
        'EVENT':   '<span class="badge badge-event">Event</span>'
    };

    tbody.innerHTML = pageAnnouncements.map((announcement, index) => {
        const rowNumber = startIndex + index + 1;
        const publishDate = formatDate(announcement.publishDate);
        const effectiveExpiryDate = getEffectiveAnnouncementExpiryDate(announcement);
        const expiryDate  = effectiveExpiryDate
            ? formatDate(effectiveExpiryDate.toISOString().split('T')[0])
            : '<span class="text-muted">—</span>';
        const isExpired   = isAnnouncementExpired(announcement, now);

        const statusBadge = announcement.isActive && !isExpired
            ? '<span class="badge status-active">Active</span>'
            : isExpired
            ? '<span class="badge status-expired">Expired</span>'
            : '<span class="badge status-inactive">Inactive</span>';

        const hasImage = announcement.imageId
            ? '<i class="bi bi-image-fill image-indicator ms-1" title="Has image"></i>' : '';

        const priorityBadge = announcement.priority > 0
            ? `<span class="priority-badge ms-1"><i class="bi bi-arrow-up"></i>P${announcement.priority}</span>` : '';

        const descText = announcement.description
            ? escapeHtml(announcement.description)
            : '<span class="text-muted fst-italic">No description</span>';

        return `
            <tr>
                <td class="text-muted">${rowNumber}</td>
                <td>
                    <span class="announcement-title">${escapeHtml(announcement.title)}</span>
                    ${hasImage}${priorityBadge}
                </td>
                <td>${typeBadges[announcement.type] || `<span class="badge bg-secondary">${escapeHtml((announcement.type || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</span>`}</td>
                <td class="text-muted small" title="${announcement.description ? escapeHtml(announcement.description) : ''}">${descText}</td>
                <td>${publishDate}</td>
                <td>${expiryDate}</td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="showEditAnnouncementModal(${announcement.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAnnouncement(${announcement.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updateAnnouncementsPaginationControls(totalPages);
}

function getEffectiveAnnouncementExpiryDate(announcement) {
    if (announcement.expiryDate) {
        const explicitExpiry = new Date(announcement.expiryDate);
        return isNaN(explicitExpiry.getTime()) ? null : explicitExpiry;
    }

    if (!announcement.publishDate) {
        return null;
    }

    const publishDate = new Date(announcement.publishDate);
    if (isNaN(publishDate.getTime())) {
        return null;
    }

    // Auto-expire after 30 days if no explicit expiry date is set.
    publishDate.setDate(publishDate.getDate() + 30);
    return publishDate;
}

function isAnnouncementExpired(announcement, now = new Date()) {
    const effectiveExpiry = getEffectiveAnnouncementExpiryDate(announcement);
    if (!effectiveExpiry) {
        return false;
    }
    return effectiveExpiry < now;
}

/**
 * Update stats cards
 */
function updateStats(activeList, expiredList, urgentList) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statTotal',   announcementsData.length);
    set('statActive',  activeList.length);
    set('statExpired', expiredList.length);
    set('statUrgent',  urgentList ? urgentList.length : 0);
}

/**
 * Show add announcement modal
 */
function showAddAnnouncementModal() {
    editingAnnouncementId = null;
    hasExistingImageInEdit = false;
    document.getElementById('announcementModalTitle').textContent = 'Add Announcement';
    document.getElementById('announcementForm').reset();
    document.getElementById('announcementType').value = 'GENERAL';
    document.getElementById('announcementIsActive').checked = true;
    document.getElementById('announcementPriority').value = '0';
    
    // Set publish date to today
    document.getElementById('announcementPublishDate').value = new Date().toISOString().split('T')[0];
    
    // Clear image preview
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('announcementImagePreview').src = '';
    const removeBtn = document.getElementById('removeAnnouncementImageBtn');
    if (removeBtn) removeBtn.style.display = 'none';
    
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
    document.getElementById('announcementImage').value = '';
    
    // Show image preview if exists
    const existingImageUrl = getAnnouncementImageUrl(announcement);
    if (existingImageUrl) {
        hasExistingImageInEdit = true;
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('announcementImagePreview').src = existingImageUrl;
        const removeBtn = document.getElementById('removeAnnouncementImageBtn');
        if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
        hasExistingImageInEdit = false;
        document.getElementById('imagePreviewContainer').style.display = 'none';
        const removeBtn = document.getElementById('removeAnnouncementImageBtn');
        if (removeBtn) removeBtn.style.display = 'none';
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
        const removeBtn = document.getElementById('removeAnnouncementImageBtn');
        if (removeBtn) removeBtn.style.display = hasExistingImageInEdit ? 'inline-block' : 'none';
    };
    reader.readAsDataURL(file);
}

function getAnnouncementImageUrl(announcement) {
    if (!announcement) return '';

    if (announcement.imageUrl) return announcement.imageUrl;
    if (announcement.ImageURL) return announcement.ImageURL;

    if (announcement.image && announcement.image.filePath) {
        if (announcement.image.filePath.startsWith('http')) {
            return announcement.image.filePath;
        }
    }

    if (announcement.image && announcement.image.filename) {
        return `${CONFIG.API_BASE_URL}/uploads/${announcement.image.filename}`;
    }

    return '';
}

async function removeAnnouncementImage() {
    if (!editingAnnouncementId) return;

    if (!confirm('Remove the current announcement image?')) {
        return;
    }

    try {
        const response = await AdminAPI.announcements.deleteImage(editingAnnouncementId);
        if (response && response.message) {
            showSuccess('Announcement image removed successfully');
            hasExistingImageInEdit = false;
            document.getElementById('announcementImagePreview').src = '';
            document.getElementById('imagePreviewContainer').style.display = 'none';
            document.getElementById('announcementImage').value = '';
            const removeBtn = document.getElementById('removeAnnouncementImageBtn');
            if (removeBtn) removeBtn.style.display = 'none';
            await loadAnnouncements();
        } else {
            showError('Failed to remove announcement image');
        }
    } catch (error) {
        console.error('Error removing announcement image:', error);
        showError('Error removing announcement image: ' + error.message);
    }
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
                    if (!uploadResponse || (!uploadResponse.image && !uploadResponse.id)) {
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

/**
 * Announcements Pagination Functions
 */
function announcementsChangeItemsPerPage() {
    const select = document.getElementById('announcementsItemsPerPageSelect');
    announcementsItemsPerPage = parseInt(select.value);
    announcementsCurrentPage = 1;
    renderAnnouncementsTable();
}

function announcementsNextPage() {
    const totalPages = Math.ceil(announcementsData.length / announcementsItemsPerPage);
    if (announcementsCurrentPage < totalPages) {
        announcementsCurrentPage++;
        renderAnnouncementsTable();
    }
}

function announcementsPreviousPage() {
    if (announcementsCurrentPage > 1) {
        announcementsCurrentPage--;
        renderAnnouncementsTable();
    }
}

function updateAnnouncementsPaginationControls(totalPages) {
    const paginationContainer = document.getElementById('announcementsPaginationContainer');
    const currentPageInfo = document.getElementById('announcementsCurrentPageInfo');
    const totalPagesInfo = document.getElementById('announcementsTotalPagesInfo');
    const prevPageItem = document.getElementById('announcementsPrevPageItem');
    const nextPageItem = document.getElementById('announcementsNextPageItem');

    if (announcementsData.length <= announcementsItemsPerPage) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    
    if (currentPageInfo) currentPageInfo.textContent = announcementsCurrentPage;
    if (totalPagesInfo) totalPagesInfo.textContent = totalPages;

    if (prevPageItem) {
        prevPageItem.classList.toggle('disabled', announcementsCurrentPage <= 1);
    }

    if (nextPageItem) {
        nextPageItem.classList.toggle('disabled', announcementsCurrentPage >= totalPages);
    }
}
