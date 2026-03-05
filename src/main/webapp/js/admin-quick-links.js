// Quick Links Management Script
let quickLinksData = [];
let editingQuickLinkId = null;
let quickLinkModal = null;

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
    quickLinkModal = new bootstrap.Modal(document.getElementById('quickLinkModal'));
    
    // Load quick links
    loadQuickLinks();
});

// Load all quick links
async function loadQuickLinks() {
    try {
        showLoadingTable('quickLinksTableBody', 8);
        const response = await AdminAPI.fetch('/admin/quick-links');
        
        if (Array.isArray(response)) {
            quickLinksData = response;
            renderQuickLinksTable();
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error loading quick links:', error);
        showError('Failed to load quick links: ' + error.message);
        document.getElementById('quickLinksTableBody').innerHTML = 
            '<tr><td colspan="8" class="text-center text-danger">Failed to load quick links</td></tr>';
    }
}

// Render quick links table
function renderQuickLinksTable() {
    const tbody = document.getElementById('quickLinksTableBody');
    
    if (quickLinksData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No quick links found</td></tr>';
        return;
    }
    
    // Sort by display order, then by createdAt
    const sortedData = [...quickLinksData].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
            return a.displayOrder - b.displayOrder;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    tbody.innerHTML = sortedData.map(link => `
        <tr>
            <td>${link.id}</td>
            <td>
                ${link.icon 
                    ? `<i class="bi ${link.icon} fs-4 text-primary"></i>` 
                    : '<i class="bi bi-link text-muted"></i>'}
            </td>
            <td>${escapeHtml(link.title)}</td>
            <td>
                <a href="${escapeHtml(link.url)}" target="_blank" class="text-truncate d-inline-block" style="max-width: 200px;">
                    ${escapeHtml(link.url)}
                </a>
            </td>
            <td>
                ${link.category 
                    ? `<span class="badge bg-info">${escapeHtml(link.category)}</span>` 
                    : '<span class="text-muted">-</span>'}
            </td>
            <td><span class="badge bg-secondary">${link.displayOrder}</span></td>
            <td>
                <span class="badge ${link.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${link.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editQuickLink(${link.id})" title="Edit">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteQuickLink(${link.id})" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Show quick link modal for add/edit
function showQuickLinkModal(id = null) {
    editingQuickLinkId = id;
    const modalTitle = document.getElementById('quickLinkModalTitle');
    const form = document.getElementById('quickLinkForm');
    form.reset();
    
    if (id) {
        modalTitle.textContent = 'Edit Quick Link';
        const link = quickLinksData.find(l => l.id === id);
        if (link) {
            document.getElementById('quickLinkId').value = link.id;
            document.getElementById('quickLinkTitle').value = link.title;
            document.getElementById('quickLinkUrl').value = link.url;
            document.getElementById('quickLinkDescription').value = link.description || '';
            document.getElementById('quickLinkIcon').value = link.icon || '';
            document.getElementById('quickLinkCategory').value = link.category || '';
            document.getElementById('quickLinkDisplayOrder').value = link.displayOrder;
            document.getElementById('quickLinkOpenInNewTab').checked = link.openInNewTab;
            document.getElementById('quickLinkIsActive').checked = link.isActive;
        }
    } else {
        modalTitle.textContent = 'Add Quick Link';
        document.getElementById('quickLinkDisplayOrder').value = 0;
        document.getElementById('quickLinkOpenInNewTab').checked = true;
        document.getElementById('quickLinkIsActive').checked = true;
    }
    
    quickLinkModal.show();
}

// Save quick link
async function saveQuickLink() {
    const id = editingQuickLinkId;
    const title = document.getElementById('quickLinkTitle').value.trim();
    const url = document.getElementById('quickLinkUrl').value.trim();
    const description = document.getElementById('quickLinkDescription').value.trim();
    const icon = document.getElementById('quickLinkIcon').value.trim();
    const category = document.getElementById('quickLinkCategory').value.trim();
    const displayOrder = parseInt(document.getElementById('quickLinkDisplayOrder').value) || 0;
    const openInNewTab = document.getElementById('quickLinkOpenInNewTab').checked;
    const isActive = document.getElementById('quickLinkIsActive').checked;
    
    // Validation
    if (!title) {
        showError('Please enter a title');
        return;
    }
    
    if (!url) {
        showError('Please enter a URL');
        return;
    }
    
    const linkData = {
        title: title,
        url: url,
        description: description || null,
        icon: icon || null,
        category: category || null,
        displayOrder: displayOrder,
        openInNewTab: openInNewTab,
        isActive: isActive
    };
    
    try {
        let response;
        if (id) {
            // Update existing link
            response = await AdminAPI.fetch(`/admin/quick-links/${id}`, {
                method: 'PUT',
                body: JSON.stringify(linkData)
            });
        } else {
            // Create new link
            response = await AdminAPI.fetch('/admin/quick-links', {
                method: 'POST',
                body: JSON.stringify(linkData)
            });
        }
        
        if (response && response.id) {
            showSuccess(id ? 'Quick link updated successfully' : 'Quick link created successfully');
            quickLinkModal.hide();
            loadQuickLinks();
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error saving quick link:', error);
        showError('Failed to save quick link: ' + error.message);
    }
}

// Edit quick link
function editQuickLink(id) {
    showQuickLinkModal(id);
}

// Delete quick link
async function deleteQuickLink(id) {
    if (!confirm('Are you sure you want to delete this quick link?')) {
        return;
    }
    
    try {
        const response = await AdminAPI.fetch(`/admin/quick-links/${id}`, {
            method: 'DELETE'
        });
        
        if (response && response.message) {
            showSuccess('Quick link deleted successfully');
            loadQuickLinks();
        } else {
            throw new Error('Failed to delete quick link');
        }
    } catch (error) {
        console.error('Error deleting quick link:', error);
        showError('Failed to delete quick link: ' + error.message);
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
