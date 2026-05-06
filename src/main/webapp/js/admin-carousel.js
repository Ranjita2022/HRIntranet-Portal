// Carousel Management Script
let carouselData = [];
let editingCarouselId = null;
let carouselModal = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!AdminAPI.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }
    carouselModal = new bootstrap.Modal(document.getElementById('carouselModal'));
    loadCarouselSlides();
});

// Load all carousel slides
async function loadCarouselSlides() {
    try {
        showLoadingTable('carouselTableBody', 8);
        const response = await AdminAPI.fetch('/admin/carousel');
        
        if (Array.isArray(response)) {
            carouselData = response;
            renderCarouselTable();
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error loading carousel slides:', error);
        showError('Failed to load carousel slides: ' + error.message);
        document.getElementById('carouselTableBody').innerHTML = 
            '<tr><td colspan="8" class="text-center text-danger">Failed to load slides</td></tr>';
    }
}

// Render carousel table
function renderCarouselTable() {
    const tbody = document.getElementById('carouselTableBody');

    // Stats
    const active   = carouselData.filter(s => s.isActive);
    const inactive = carouselData.filter(s => !s.isActive);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotal',    carouselData.length);
    set('statActive',   active.length);
    set('statInactive', inactive.length);
    const countEl = document.getElementById('recordCount');
    if (countEl) countEl.textContent = carouselData.length + ' record' + (carouselData.length !== 1 ? 's' : '');

    if (carouselData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No carousel slides found</td></tr>';
        return;
    }

    const sortedData = [...carouselData].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    tbody.innerHTML = sortedData.map((slide, index) => `
        <tr>
            <td class="text-muted">${index + 1}</td>
            <td>
                ${getCarouselImageUrl(slide)
                    ? `<img src="${escapeHtml(getCarouselImageUrl(slide))}" alt="Preview" class="slide-thumb">`
                    : '<span class="slide-thumb-placeholder"><i class="bi bi-image"></i></span>'}
            </td>
            <td>
                <span class="slide-title-cell d-block" title="${escapeHtml(slide.title || '')}">
                    ${escapeHtml(slide.title || '—')}
                </span>
            </td>
            <td>
                <span class="slide-subtitle-cell d-block" title="${escapeHtml(slide.subtitle || '')}">
                    ${escapeHtml(slide.subtitle || '—')}
                </span>
            </td>
            <td class="text-center"><span class="order-badge">${slide.displayOrder}</span></td>
            <td>
                <span class="badge ${slide.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${slide.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="text-muted small text-truncate" style="max-width:100px" title="${escapeHtml(slide.createdBy || '')}">
                ${escapeHtml(slide.createdBy || '—')}
            </td>
            <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editCarouselSlide(${slide.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCarouselSlide(${slide.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show carousel modal for add/edit
function showCarouselModal(id = null) {
    editingCarouselId = id;
    const modalTitle = document.getElementById('carouselModalTitle');
    const form = document.getElementById('carouselForm');
    form.reset();
    
    // Hide image preview
    document.getElementById('imagePreviewContainer').style.display = 'none';
    
    if (id) {
        modalTitle.textContent = 'Edit Carousel Slide';
        const slide = carouselData.find(s => s.id === id);
        if (slide) {
            document.getElementById('carouselId').value = slide.id;
            document.getElementById('carouselTitle').value = slide.title || '';
            document.getElementById('carouselSubtitle').value = slide.subtitle || '';
            document.getElementById('carouselDisplayOrder').value = slide.displayOrder;
            document.getElementById('carouselIsActive').checked = slide.isActive;
            
            // Show existing image preview
            const imageUrl = getCarouselImageUrl(slide);
            if (imageUrl) {
                const preview = document.getElementById('imagePreview');
                preview.src = imageUrl;
                document.getElementById('imagePreviewContainer').style.display = 'block';
            }
        }
    } else {
        modalTitle.textContent = 'Add Carousel Slide';
        document.getElementById('carouselDisplayOrder').value = 0;
        document.getElementById('carouselIsActive').checked = true;
    }
    
    carouselModal.show();
}

// Handle image selection
function handleCarouselImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        event.target.value = '';
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Save carousel slide
async function saveCarouselSlide() {
    const id = editingCarouselId;
    const isEdit = !!editingCarouselId;
    const title = document.getElementById('carouselTitle').value.trim();
    const subtitle = document.getElementById('carouselSubtitle').value.trim();
    const displayOrder = parseInt(document.getElementById('carouselDisplayOrder').value) || 0;
    const isActive = document.getElementById('carouselIsActive').checked;
    const imageFile = document.getElementById('carouselImage').files[0];
    
    // Validation: image required for new slides
    if (!id && !imageFile) {
        showError('Please select an image');
        return;
    }
    
    try {
        if (id) {
            // Update existing slide
            await AdminAPI.fetch(`/admin/carousel/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ title, subtitle, displayOrder, isActive })
            });
        } else {
            // Create new slide with image
            const formData = new FormData();
            formData.append('file', imageFile);
            formData.append('title', title);
            formData.append('subtitle', subtitle);
            formData.append('displayOrder', displayOrder);
            
            await AdminAPI.fetchMultipart(`/admin/carousel`, {
                method: 'POST',
                body: formData
            });
        }

        showSuccess(isEdit ? 'Carousel slide updated successfully' : 'Carousel slide created successfully');
        carouselModal.hide();
        loadCarouselSlides().catch(error => console.warn('Reload failed:', error));
    } catch (error) {
        console.error('Error saving carousel slide:', error);
        showError('Failed to save carousel slide: ' + getApiErrorMessage(error));
    }
}

// Edit carousel slide
function editCarouselSlide(id) {
    showCarouselModal(id);
}

// Delete carousel slide
async function deleteCarouselSlide(id) {
    if (!confirm('Are you sure you want to delete this carousel slide?')) {
        return;
    }
    
    try {
        const response = await AdminAPI.fetch(`/admin/carousel/${id}`, {
            method: 'DELETE'
        });
        
        if (response && response.message) {
            showSuccess('Carousel slide deleted successfully');
            loadCarouselSlides();
        } else {
            throw new Error('Failed to delete carousel slide');
        }
    } catch (error) {
        console.error('Error deleting carousel slide:', error);
        showError('Failed to delete carousel slide: ' + error.message);
    }
}

// Backward compatibility for any stale inline handlers.
function deleteSlide(id) {
    return deleteCarouselSlide(id);
}

// Show loading spinner in table
function showLoadingTable(elementId, colspan) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <tr>
                <td colspan="${colspan}" class="text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-2">Loading...</span>
                </td>
            </tr>
        `;
    }
}

// Show success message
function showSuccess(message) {
    showToast(message, 'success');
}

// Show error message
function showError(message) {
    showToast(message, 'danger');
}

function showToast(message, type = 'info') {
    if (typeof bootstrap === 'undefined') {
        alert(message);
        return;
    }
    
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '11000';
        document.body.appendChild(container);
    }
    
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${escapeHtml(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    new bootstrap.Toast(toastElement, { delay: 3000 }).show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

function getApiErrorMessage(error) {
    const fallback = 'Please try again.';
    const raw = (error && error.message ? String(error.message) : '').trim();
    if (!raw) return fallback;

    try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
            if (parsed.error) return String(parsed.error);
            if (parsed.message) return String(parsed.message);
        }
    } catch (e) {
        // Not JSON; use raw message.
    }

    return raw;
}

function getCarouselImageUrl(slide) {
    if (!slide) return '';

    // 1. Explicit imageUrl field (full http URL only)
    if (slide.image && slide.image.imageUrl && slide.image.imageUrl.startsWith('http')) {
        return slide.image.imageUrl;
    }

    // 2. Slide-level imageUrl (full http URL only)
    if (slide.imageUrl && slide.imageUrl.startsWith('http')) {
        return slide.imageUrl;
    }

    // 3. Build URL from filename — ALWAYS preferred over filePath.
    //    filePath stores the OS filesystem path (e.g. /opt/hrintranet/uploads/images/UUID.jpg
    //    on the Ubuntu server, or C:\...\UUID.jpg on Windows dev), NOT a URL.
    if (slide.image && slide.image.filename) {
        return `${CONFIG.API_BASE_URL}/uploads/${slide.image.filename}`;
    }

    // 4. Last resort: only use filePath if it is already a full http URL
    if (slide.image && slide.image.filePath && slide.image.filePath.startsWith('http')) {
        return slide.image.filePath;
    }

    return '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
