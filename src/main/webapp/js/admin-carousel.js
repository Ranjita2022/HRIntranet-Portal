// Carousel Management Script
let carouselData = [];
let editingCarouselId = null;
let carouselModal = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AdminAPI.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Set admin name
    const adminName = AdminAPI.getAdminName();
    if (adminName) {
        document.getElementById('adminNameDisplay').textContent = adminName;
    }
    
    // Initialize modal
    carouselModal = new bootstrap.Modal(document.getElementById('carouselModal'));
    
    // Load carousel slides
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
    
    if (carouselData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No carousel slides found</td></tr>';
        return;
    }
    
    // Sort by display order, then by createdAt
    const sortedData = [...carouselData].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    tbody.innerHTML = sortedData.map(slide => `
        <tr>
            <td>${slide.id}</td>
            <td>
                ${slide.image && slide.image.imageUrl 
                    ? `<img src="${slide.image.imageUrl}" alt="Preview" style="width: 80px; height: 40px; object-fit: cover; border-radius: 4px;">` 
                    : '<span class="text-muted">No image</span>'}
            </td>
            <td>${escapeHtml(slide.title || '-')}</td>
            <td>${escapeHtml(slide.subtitle || '-')}</td>
            <td><span class="badge bg-secondary">${slide.displayOrder}</span></td>
            <td>
                <span class="badge ${slide.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${slide.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${escapeHtml(slide.createdBy || '-')}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editCarouselSlide(${slide.id})" title="Edit">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSlide(${slide.id})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
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
            if (slide.image && slide.image.imageUrl) {
                const preview = document.getElementById('imagePreview');
                preview.src = slide.image.imageUrl;
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
            // Update existing slide (without image)
            const slideData = {
                title: title,
                subtitle: subtitle,
                displayOrder: displayOrder,
                isActive: isActive
            };
            
            const response = await AdminAPI.fetch(`/admin/carousel/${id}`, {
                method: 'PUT',
                body: JSON.stringify(slideData)
            });
            
            if (response && response.id) {
                showSuccess('Carousel slide updated successfully');
                carouselModal.hide();
                loadCarouselSlides();
            } else {
                throw new Error('Failed to update carousel slide');
            }
        } else {
            // Create new slide with image
            const formData = new FormData();
            formData.append('file', imageFile);
            if (title) formData.append('title', title);
            if (subtitle) formData.append('subtitle', subtitle);
            formData.append('displayOrder', displayOrder);
            
            const response = await AdminAPI.fetchMultipart(`/admin/carousel`, {
                method: 'POST',
                body: formData
            });
            
            if (response && response.id) {
                showSuccess('Carousel slide created successfully');
                carouselModal.hide();
                loadCarouselSlides();
            } else {
                throw new Error('Failed to create carousel slide');
            }
        }
    } catch (error) {
        console.error('Error saving carousel slide:', error);
        showError('Failed to save carousel slide: ' + error.message);
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

// Show success toast
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    toast.show();
}

// Show error toast
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    const toast = new bootstrap.Toast(document.getElementById('errorToast'));
    toast.show();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
