// Gallery Management JavaScript

let allFolders = [];
let editModal = null;
let selectedFolderImages = new Set();
let selectedFolders = new Set();

// Initialize on page load
$(document).ready(function() {
    // Check authentication if function exists
    if (typeof checkAuth === 'function') {
        checkAuth();
    }
    editModal = new bootstrap.Modal(document.getElementById('editFolderModal'));
    loadFolders();
});

// Load all gallery folders
async function loadFolders() {
    try {
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            throw new Error('Configuration not loaded. Please refresh the page (Ctrl+Shift+R)');
        }
        
        // Use the admin endpoint so inactive folders remain visible in the admin UI.
        // The public gallery page should keep using the public active-only endpoint.
        allFolders = await AdminAPI.fetch('/admin/gallery/folders');
        console.log('Loaded folders:', allFolders);
        
        renderFolders();
        updateStats();
        
    } catch (error) {
        console.error('Error loading folders:', error);
        showError('Failed to load gallery folders. Please try again.');
        $('#foldersContainer').html(`
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle text-danger"></i>
                <h5 class="mt-3">Failed to Load Folders</h5>
                <p class="text-muted">${error.message}</p>
                <button class="btn btn-primary" onclick="loadFolders()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
            </div>
        `);
    }
}

// Render folders list
function renderFolders() {
    const container = $('#foldersContainer');
    
    if (allFolders.length === 0) {
        selectedFolders.clear();
        updateFolderSelectionUI();
        container.html(`
            <div class="empty-state">
                <i class="bi bi-folder-x"></i>
                <h5 class="mt-3">No Gallery Folders Found</h5>
                <p class="text-muted">Click "Scan Folders" to detect photo folders from the images/gallery directory.</p>
            </div>
        `);
        return;
    }
    
    // Sort by display order
    const sortedFolders = [...allFolders].sort((a, b) => a.displayOrder - b.displayOrder);
    
    let html = '<div class="row g-3">';
    
    sortedFolders.forEach(folder => {
        const isActive = folder.isActive !== false; // Default to true if undefined
        const statusClass = isActive ? 'active' : 'inactive';
        const cardClass = isActive ? '' : 'inactive';
        const isSelected = selectedFolders.has(folder.id);
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card folder-card ${cardClass} h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-end mb-2">
                            <div class="form-check mb-0">
                                <input class="form-check-input folder-select-checkbox" type="checkbox"
                                       id="folder-select-${folder.id}"
                                       onchange="toggleFolderSelection(${folder.id}, this.checked)"
                                       ${isSelected ? 'checked' : ''}>
                                <label class="form-check-label small" for="folder-select-${folder.id}">Select</label>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-folder-fill text-primary me-2"></i>${escapeHtml(folder.displayTitle || folder.folderName)}
                            </h5>
                            <span class="status-badge ${statusClass}">
                                ${isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        
                        <p class="card-text text-muted small mb-2">
                            ${escapeHtml(folder.description || 'No description')}
                        </p>
                        
                        <div class="folder-path mb-3">
                            <i class="bi bi-folder me-1"></i>${escapeHtml(folder.folderPath || folder.folderName)}
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="photo-count-badge">
                                <i class="bi bi-images me-1"></i>${folder.photoCount || 0} photos
                            </span>
                            <span class="text-muted small">
                                Order: ${folder.displayOrder || 0}
                            </span>
                        </div>
                        
                        <div class="action-buttons d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary" 
                                    onclick="editFolder(${folder.id})"
                                    title="Edit folder details">
                                <i class="bi bi-pencil me-2"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-outline-secondary"
                                    onclick="showFolderImages(${folder.id}, '${escapeHtml(folder.displayTitle || folder.folderName)}')"
                                    title="View and delete images">
                                <i class="bi bi-images me-2"></i>Images
                            </button>
                            <button class="btn btn-sm btn-outline-info" 
                                    onclick="showUploadModal(${folder.id}, '${escapeHtml(folder.folderName)}', '${escapeHtml(folder.displayTitle || folder.folderName)}')"
                                    title="Upload images">
                                <i class="bi bi-upload me-2"></i>Upload
                            </button>
                            <button class="btn btn-sm btn-outline-${isActive ? 'warning' : 'success'}" 
                                    onclick="toggleFolderStatus(${folder.id}, ${isActive})"
                                    title="${isActive ? 'Hide from gallery' : 'Show in gallery'}">
                                <i class="bi bi-${isActive ? 'eye-slash' : 'eye'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger"
                                    onclick="deleteFolder(${folder.id})"
                                    title="Delete folder">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.html(html);
    updateFolderSelectionUI();
}

function toggleFolderSelection(folderId, isSelected) {
    if (isSelected) {
        selectedFolders.add(folderId);
    } else {
        selectedFolders.delete(folderId);
    }
    updateFolderSelectionUI();
}

function toggleSelectAllFolders(selectAll) {
    const checkboxes = document.querySelectorAll('.folder-select-checkbox');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll;
        const folderId = Number(checkbox.id.replace('folder-select-', ''));
        if (selectAll) {
            selectedFolders.add(folderId);
        } else {
            selectedFolders.delete(folderId);
        }
    });
    updateFolderSelectionUI();
}

function updateFolderSelectionUI() {
    const countEl = document.getElementById('selectedFoldersCount');
    const deleteBtn = document.getElementById('deleteSelectedFoldersBtn');
    const selectAllCheckbox = document.getElementById('selectAllFolders');
    const checkboxes = document.querySelectorAll('.folder-select-checkbox');

    const total = checkboxes.length;
    const selected = selectedFolders.size;

    if (countEl) {
        countEl.textContent = `${selected} selected`;
    }

    if (deleteBtn) {
        deleteBtn.disabled = selected === 0;
    }

    if (selectAllCheckbox) {
        if (total === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = selected === total;
            selectAllCheckbox.indeterminate = selected > 0 && selected < total;
        }
    }
}

// Update statistics
function updateStats() {
    const totalCount = allFolders.length;
    const activeCount = allFolders.filter(f => f.isActive !== false).length;
    const totalPhotoCount = allFolders.reduce((sum, f) => sum + (f.photoCount || 0), 0);
    
    $('#totalFolders').text(totalCount);
    $('#activeFolders').text(activeCount);
    $('#totalPhotos').text(totalPhotoCount);
}

// Scan for new folders
async function scanFolders() {
    try {
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            alert('Configuration not loaded. Please refresh the page (Ctrl+Shift+R) to clear browser cache.');
            return;
        }
        
        showLoading('Scanning folders from filesystem...');
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        
        console.log('Attempting to scan folders...');
        console.log('Token exists:', !!token);
        console.log('API URL:', `${CONFIG.API_BASE_URL}/admin/gallery/folders/scan`);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/scan`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(errorText || `Server returned ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Scan result:', result);
        
        showSuccess(`
            <strong>Scan Completed!</strong><br>
            New folders: ${result.newCount}<br>
            Updated folders: ${result.updatedCount}
        `);
        
        // Reload folders to show updated data
        setTimeout(() => {
            loadFolders();
        }, 1500);
        
    } catch (error) {
        console.error('Error scanning folders:', error);
        showError('Failed to scan folders: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Edit folder
function editFolder(folderId) {
    const folder = allFolders.find(f => f.id === folderId);
    if (!folder) {
        showError('Folder not found');
        return;
    }
    
    $('#editFolderId').val(folder.id);
    $('#editFolderName').val(folder.folderName);
    $('#editDisplayTitle').val(folder.displayTitle || '');
    $('#editDescription').val(folder.description || '');
    $('#editDisplayOrder').val(folder.displayOrder || 0);
    
    editModal.show();
}

// Save folder changes
async function saveFolder() {
    const folderId = $('#editFolderId').val();
    const displayTitle = $('#editDisplayTitle').val().trim();
    const description = $('#editDescription').val().trim();
    const displayOrder = parseInt($('#editDisplayOrder').val()) || 0;
    
    if (!displayTitle) {
        showError('Display title is required');
        return;
    }
    
    try {
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            alert('Configuration not loaded. Please refresh the page (Ctrl+Shift+R) to clear browser cache.');
            return;
        }
        
        showLoading('Saving changes...');
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');

        if (!token) {
            throw new Error('Please login first');
        }
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ displayTitle, description, displayOrder })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Server returned ${response.status}` }));
            throw new Error(errorData.error || `Failed to save folder changes (${response.status})`);
        }
        
        editModal.hide();
        showSuccess('Changes saved successfully');
        
        // Reload folders
        setTimeout(() => loadFolders(), 500);
        
    } catch (error) {
        console.error('Error saving folder:', error);
        showError('Failed to save changes: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Toggle folder active/inactive status
async function toggleFolderStatus(folderId, currentStatus) {
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} this folder?`)) {
        return;
    }
    
    try {
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            showError('Configuration not loaded. Please refresh the page (Ctrl+Shift+R).');
            return;
        }
        
        showLoading(`${newStatus ? 'Activating' : 'Deactivating'} folder...`);
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        
        // Debug logging
        console.log('Toggle folder request:', {
            folderId,
            currentStatus,
            newStatus,
            url: `${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/toggle`,
            hasToken: !!token
        });
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/toggle`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Toggle response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Toggle failed:', errorData);
            throw new Error(errorData.error || `Server returned ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Toggle successful:', result);
        
        showSuccess(`Folder ${newStatus ? 'activated' : 'deactivated'} successfully`);
        
        // Reload folders
        setTimeout(() => loadFolders(), 500);
        
    } catch (error) {
        console.error('Error toggling folder status:', error);
        showError('Failed to update folder status: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Loading state
function showLoading(message = 'Loading...') {
    $('#foldersContainer').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">${message}</span>
            </div>
            <p class="mt-3 text-muted">${message}</p>
        </div>
    `);
}

function hideLoading() {
    // Loading will be replaced by renderFolders()
}

// Toast notifications (using Bootstrap Toast or simple alerts)
function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'danger');
}

function showInfo(message) {
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container.gallery-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container gallery-toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1090';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'gallery-toast-' + Date.now();
    const toastTypeClass = {
        success: 'text-bg-success',
        danger: 'text-bg-danger',
        warning: 'text-bg-warning',
        info: 'text-bg-info'
    }[type] || 'text-bg-primary';

    const toastHtml = `
        <div id="${toastId}" class="toast ${toastTypeClass}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex align-items-center">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Show create folder modal
function showCreateFolderModal() {
    $('#newFolderName').val('');
    $('#newDisplayTitle').val('');
    $('#newDescription').val('');
    
    const modal = new bootstrap.Modal(document.getElementById('createFolderModal'));
    modal.show();
}

// Create new folder
async function createFolder() {
    try {
        const folderName = $('#newFolderName').val().trim();
        const displayTitle = $('#newDisplayTitle').val().trim();
        const description = $('#newDescription').val().trim();
        
        if (!folderName) {
            showToast('Please enter a folder name', 'warning');
            return;
        }
        
        // Validate folder name format
        if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
            showToast('Folder name can only contain letters, numbers, hyphens, and underscores', 'warning');
            return;
        }
        
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            alert('Configuration not loaded. Please refresh the page (Ctrl+Shift+R) to clear browser cache.');
            return;
        }
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        
        if (!token) {
            showToast('Please login first', 'danger');
            return;
        }
        
        showLoading('Creating folder...');
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                folderName: folderName,
                displayTitle: displayTitle || null,
                description: description || null
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server returned ${response.status}`);
        }
        
        const folder = await response.json();
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('createFolderModal')).hide();
        
        // Reload folders
        await loadFolders();
        
        showToast(`Folder "${folder.displayTitle}" created successfully!`, 'success');
        
    } catch (error) {
        console.error('Create folder error:', error);
        showToast(`Failed to create folder: ${error.message}`, 'danger');
    } finally {
        hideLoading();
    }
}

async function deleteFolder(folderId) {
    const folder = allFolders.find((f) => f.id === folderId);
    if (!folder) {
        showToast('Folder not found', 'danger');
        return;
    }

    const folderName = folder.displayTitle || folder.folderName;
    if (!confirm(`Delete folder "${folderName}" and all images inside it? This cannot be undone.`)) {
        return;
    }

    try {
        await deleteGalleryFolderById(folderId);
        selectedFolders.delete(folderId);
        updateFolderSelectionUI();
        await loadFolders();
        showToast(`Folder "${escapeHtml(folderName)}" deleted successfully`, 'success');
    } catch (error) {
        console.error('Delete folder error:', error);
        showToast(`Failed to delete folder: ${error.message}`, 'danger');
    }
}

async function deleteSelectedFolders() {
    const selectedIds = Array.from(selectedFolders);
    if (selectedIds.length === 0) {
        showToast('Please select at least one folder', 'warning');
        return;
    }

    if (!confirm(`Delete ${selectedIds.length} selected folder(s) and all images inside them? This cannot be undone.`)) {
        return;
    }

    const deleteBtn = document.getElementById('deleteSelectedFoldersBtn');
    if (deleteBtn) {
        deleteBtn.disabled = true;
    }

    let successCount = 0;
    let failCount = 0;

    for (const folderId of selectedIds) {
        try {
            await deleteGalleryFolderById(folderId);
            successCount++;
        } catch (error) {
            console.error(`Failed to delete folder ${folderId}:`, error);
            failCount++;
        }
    }

    selectedFolders.clear();
    updateFolderSelectionUI();
    await loadFolders();

    if (failCount === 0) {
        showToast(`Deleted ${successCount} folder(s) successfully`, 'success');
    } else {
        showToast(`Deleted ${successCount} folder(s), failed ${failCount}`, 'warning');
    }
}

async function deleteGalleryFolderById(folderId) {
    const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');

    if (!token) {
        throw new Error('Please login first');
    }

    if (typeof CONFIG === 'undefined') {
        throw new Error('Configuration not loaded. Please refresh the page (Ctrl+Shift+R).');
    }

    const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Server returned ${response.status}` }));
        throw new Error(errorData.error || `Failed to delete folder (${response.status})`);
    }
}

// Show upload images modal
function showUploadModal(folderId, folderName, displayTitle) {
    $('#uploadFolderId').val(folderId);
    $('#uploadFolderName').val(folderName);
    $('#uploadFolderDisplayName').text(displayTitle);
    $('#imageFiles').val('');
    $('#uploadPreview').hide().html('');
    $('#uploadProgress').hide();
    $('#uploadButton').prop('disabled', false);
    
    const modal = new bootstrap.Modal(document.getElementById('uploadImagesModal'));
    modal.show();
}

// Preview selected images
$('#imageFiles').on('change', function() {
    const files = this.files;
    const previewContainer = $('#uploadPreview');
    
    if (files.length === 0) {
        previewContainer.hide().html('');
        return;
    }
    
    previewContainer.html('').show();
    
    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const col = $(`
                <div class="col-md-2 col-4">
                    <div class="card">
                        <img src="${e.target.result}" class="card-img-top" style="height: 100px; object-fit: cover;">
                        <div class="card-body p-1 text-center">
                            <small class="text-muted">${file.name}</small>
                        </div>
                    </div>
                </div>
            `);
            previewContainer.append(col);
        };
        reader.readAsDataURL(file);
    });
});

// Upload images
async function uploadImages() {
    try {
        const folderId = $('#uploadFolderId').val();
        const files = $('#imageFiles')[0].files;
        
        if (!files || files.length === 0) {
            showToast('Please select at least one image', 'warning');
            return;
        }
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        
        if (!token) {
            showToast('Please login first', 'danger');
            return;
        }
        
        // Check if CONFIG is defined (in case of browser cache issues)
        if (typeof CONFIG === 'undefined') {
            alert('Configuration not loaded. Please refresh the page (Ctrl+Shift+R) to clear browser cache.');
            return;
        }
        
        // Disable upload button
        $('#uploadButton').prop('disabled', true);
        
        // Show progress
        $('#uploadProgress').show();
        $('#uploadProgressBar').css('width', '50%');
        $('#uploadStatusText').text(`Uploading ${files.length} image(s)...`);
        
        // Create FormData
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Server returned ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update progress
        $('#uploadProgressBar').css('width', '100%');
        $('#uploadStatusText').text('Upload complete!');
        
        // Close modal after a short delay
        setTimeout(() => {
            bootstrap.Modal.getInstance(document.getElementById('uploadImagesModal')).hide();
            
            // Reload folders to update photo counts
            loadFolders();
            
            let message = `Uploaded ${result.uploadedCount} image(s) successfully!`;
            if (result.errors && result.errors.length > 0) {
                message += ` (${result.errors.length} failed)`;
            }
            
            showToast(message, result.errors && result.errors.length > 0 ? 'warning' : 'success');
            
            // Log errors if any
            if (result.errors && result.errors.length > 0) {
                console.error('Upload errors:', result.errors);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Upload error:', error);
        showToast(`Failed to upload images: ${error.message}`, 'danger');
        $('#uploadButton').prop('disabled', false);
        $('#uploadProgress').hide();
    }
}

// Show folder images modal
async function showFolderImages(folderId, displayTitle) {
    $('#manageImagesFolderId').val(folderId);
    $('#manageImagesFolderTitle').text(displayTitle);
    selectedFolderImages.clear();
    $('#selectAllFolderImages').prop('checked', false);
    updateSelectedImagesUI();
    $('#folderImagesContainer').html(`
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading images...</span>
            </div>
        </div>
    `);

    const modal = new bootstrap.Modal(document.getElementById('manageImagesModal'));
    modal.show();

    await loadFolderImages(folderId);
}

// Load all images for a selected folder
async function loadFolderImages(folderId) {
    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');

        if (!token) {
            showToast('Please login first', 'danger');
            return;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/images`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `Server returned ${response.status}` }));
            throw new Error(error.error || `Server returned ${response.status}`);
        }

        const images = await response.json();
        const container = $('#folderImagesContainer');

        if (!images || images.length === 0) {
            selectedFolderImages.clear();
            updateSelectedImagesUI();
            container.html(`
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-image fs-1 d-block mb-2"></i>
                    No images found in this folder.
                </div>
            `);
            return;
        }

        let html = '<div class="row g-3">';
        images.forEach((image) => {
            const encodedFilename = encodeURIComponent(image.filename);
            const isSelected = selectedFolderImages.has(encodedFilename);
            html += `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100">
                        <div class="card-header py-2 d-flex justify-content-between align-items-center">
                            <div class="form-check mb-0">
                                <input class="form-check-input folder-image-checkbox" type="checkbox"
                                       id="img-${encodedFilename}"
                                       onchange="toggleFolderImageSelection('${encodedFilename}', this.checked)"
                                       ${isSelected ? 'checked' : ''}>
                                <label class="form-check-label small" for="img-${encodedFilename}">Select</label>
                            </div>
                        </div>
                        <img src="${image.url}" class="card-img-top" style="height: 150px; object-fit: cover;" alt="${escapeHtml(image.filename)}">
                        <div class="card-body p-2">
                            <div class="small text-truncate mb-2" title="${escapeHtml(image.filename)}">${escapeHtml(image.filename)}</div>
                            <button class="btn btn-sm btn-outline-danger w-100"
                                    onclick="deleteFolderImage(${folderId}, '${encodedFilename}')">
                                <i class="bi bi-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.html(html);
        updateSelectAllCheckbox();
        updateSelectedImagesUI();

    } catch (error) {
        console.error('Failed to load folder images:', error);
        $('#folderImagesContainer').html(`
            <div class="alert alert-danger mb-0">
                Failed to load images: ${escapeHtml(error.message)}
            </div>
        `);
    }
}

function toggleFolderImageSelection(encodedFilename, isSelected) {
    if (isSelected) {
        selectedFolderImages.add(encodedFilename);
    } else {
        selectedFolderImages.delete(encodedFilename);
    }
    updateSelectAllCheckbox();
    updateSelectedImagesUI();
}

function toggleSelectAllFolderImages(selectAll) {
    const checkboxes = document.querySelectorAll('.folder-image-checkbox');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = selectAll;
        const encodedFilename = checkbox.id.replace('img-', '');
        if (selectAll) {
            selectedFolderImages.add(encodedFilename);
        } else {
            selectedFolderImages.delete(encodedFilename);
        }
    });
    updateSelectedImagesUI();
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllFolderImages');
    if (!selectAllCheckbox) return;

    const checkboxes = document.querySelectorAll('.folder-image-checkbox');
    const total = checkboxes.length;
    const selected = document.querySelectorAll('.folder-image-checkbox:checked').length;

    if (total === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }

    selectAllCheckbox.checked = selected === total;
    selectAllCheckbox.indeterminate = selected > 0 && selected < total;
}

function updateSelectedImagesUI() {
    const countEl = document.getElementById('selectedImagesCount');
    const deleteBtn = document.getElementById('deleteSelectedImagesBtn');
    const count = selectedFolderImages.size;

    if (countEl) {
        countEl.textContent = `${count} selected`;
    }
    if (deleteBtn) {
        deleteBtn.disabled = count === 0;
    }
}

async function deleteSelectedFolderImages() {
    const folderId = $('#manageImagesFolderId').val();
    const selected = Array.from(selectedFolderImages);

    if (!folderId || selected.length === 0) {
        showToast('Please select at least one image', 'warning');
        return;
    }

    if (!confirm(`Delete ${selected.length} selected image(s)? This cannot be undone.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        if (!token) {
            showToast('Please login first', 'danger');
            return;
        }

        const deleteBtn = document.getElementById('deleteSelectedImagesBtn');
        if (deleteBtn) deleteBtn.disabled = true;

        const results = await Promise.allSettled(
            selected.map((encodedFilename) =>
                fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/images/${encodedFilename}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            )
        );

        let successCount = 0;
        let failureCount = 0;

        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.ok) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        selectedFolderImages.clear();
        $('#selectAllFolderImages').prop('checked', false);
        updateSelectedImagesUI();

        await loadFolderImages(folderId);
        await loadFolders();

        if (failureCount === 0) {
            showToast(`Deleted ${successCount} image(s)`, 'success');
        } else {
            showToast(`Deleted ${successCount} image(s), failed ${failureCount}`, 'warning');
        }
    } catch (error) {
        console.error('Failed to delete selected images:', error);
        showToast(`Failed to delete selected images: ${error.message}`, 'danger');
    } finally {
        updateSelectedImagesUI();
    }
}

// Delete selected image file from folder
async function deleteFolderImage(folderId, encodedFilename) {
    const filename = decodeURIComponent(encodedFilename);
    if (!confirm(`Delete image "${filename}"? This cannot be undone.`)) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('admin_jwt_token');
        const response = await fetch(`${CONFIG.API_BASE_URL}/admin/gallery/folders/${folderId}/images/${encodedFilename}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: `Server returned ${response.status}` }));
            throw new Error(error.error || `Server returned ${response.status}`);
        }

        showToast(`Deleted ${filename}`, 'success');
    selectedFolderImages.delete(encodedFilename);
    updateSelectedImagesUI();
        await loadFolderImages(folderId);
        await loadFolders();
    } catch (error) {
        console.error('Failed to delete image:', error);
        showToast(`Failed to delete image: ${error.message}`, 'danger');
    }
}
