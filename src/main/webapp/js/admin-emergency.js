// Emergency Contacts Management Script
let emergencyContactsData = [];
let editingEmergencyContactId = null;
let emergencyContactModal = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!AdminAPI.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }
    emergencyContactModal = new bootstrap.Modal(document.getElementById('emergencyContactModal'));
    loadEmergencyContacts();
});

// Load all emergency contacts
async function loadEmergencyContacts() {
    try {
        showLoadingTable('emergencyContactsTableBody', 9);
        const response = await AdminAPI.fetch('/admin/emergency-contacts');
        if (Array.isArray(response)) {
            emergencyContactsData = response;
            renderEmergencyContactsTable();
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error loading emergency contacts:', error);
        showError('Failed to load emergency contacts: ' + error.message);
        document.getElementById('emergencyContactsTableBody').innerHTML =
            '<tr><td colspan="9" class="text-center text-danger">Failed to load contacts</td></tr>';
    }
}

// Type label map
const TYPE_LABELS = {
    'SECURITY':   'Security',
    'IT_SUPPORT': 'IT Support',
    'HR':         'HR',
    'MEDICAL':    'Medical',
    'FACILITY':   'Facility',
    'GENERAL':    'General',
    'OTHER':      'Other'
};

// Type CSS class map (matches admin-emergency.html style block)
const TYPE_CSS = {
    'SECURITY':   'type-security',
    'IT_SUPPORT': 'type-it',
    'HR':         'type-hr',
    'MEDICAL':    'type-medical',
    'FACILITY':   'type-facility',
    'GENERAL':    'type-general',
    'OTHER':      'type-other'
};

// Render emergency contacts table
function renderEmergencyContactsTable() {
    const tbody = document.getElementById('emergencyContactsTableBody');

    // Stats
    const emergencyList = emergencyContactsData.filter(c => c.isEmergency);
    const activeList    = emergencyContactsData.filter(c => c.isActive);
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('statTotal',     emergencyContactsData.length);
    set('statEmergency', emergencyList.length);
    set('statActive',    activeList.length);
    const countEl = document.getElementById('recordCount');
    if (countEl) countEl.textContent = emergencyContactsData.length + ' record' + (emergencyContactsData.length !== 1 ? 's' : '');

    if (emergencyContactsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">No emergency contacts found</td></tr>';
        return;
    }

    const sortedData = [...emergencyContactsData].sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) return b.isEmergency ? 1 : -1;
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    tbody.innerHTML = sortedData.map((contact, index) => `
        <tr>
            <td class="text-muted">${index + 1}</td>
            <td>
                ${contact.isEmergency ? '<i class="bi bi-exclamation-triangle-fill emergency-flag me-1"></i>' : ''}
                <span class="fw-semibold">${escapeHtml(contact.title)}</span>
            </td>
            <td>${escapeHtml(contact.contactName)}</td>
            <td>
                <a href="tel:${escapeHtml(contact.phoneNumber)}" class="text-decoration-none">
                    <i class="bi bi-telephone me-1"></i>${escapeHtml(contact.phoneNumber)}
                </a>
            </td>
            <td class="small">
                ${contact.email
                    ? `<a href="mailto:${escapeHtml(contact.email)}" class="text-decoration-none">${escapeHtml(contact.email)}</a>`
                    : '<span class="text-muted">—</span>'}
            </td>
            <td>
                <span class="badge ${TYPE_CSS[contact.type] || 'type-other'}">
                    ${TYPE_LABELS[contact.type] || contact.type}
                </span>
            </td>
            <td class="text-center"><span class="order-badge">${contact.displayOrder}</span></td>
            <td>
                <span class="badge ${contact.isActive ? 'bg-success' : 'bg-secondary'}">
                    ${contact.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editEmergencyContact(${contact.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmergencyContact(${contact.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get badge color for contact type
function getContactTypeBadgeColor(type) {
    const colors = {
        'SECURITY': 'danger',
        'IT_SUPPORT': 'info',
        'HR': 'primary',
        'MEDICAL': 'success',
        'FACILITY': 'warning',
        'GENERAL': 'secondary',
        'OTHER': 'dark'
    };
    return colors[type] || 'secondary';
}

// Format contact type for display
function formatContactType(type) {
    const formatted = {
        'SECURITY': 'Security',
        'IT_SUPPORT': 'IT Support',
        'HR': 'HR',
        'MEDICAL': 'Medical',
        'FACILITY': 'Facility',
        'GENERAL': 'General',
        'OTHER': 'Other'
    };
    return formatted[type] || type;
}

// Show emergency contact modal for add/edit
function showEmergencyContactModal(id = null) {
    editingEmergencyContactId = id;
    const modalTitle = document.getElementById('emergencyContactModalTitle');
    const form = document.getElementById('emergencyContactForm');
    form.reset();
    
    if (id) {
        modalTitle.textContent = 'Edit Emergency Contact';
        const contact = emergencyContactsData.find(c => c.id === id);
        if (contact) {
            document.getElementById('emergencyContactId').value = contact.id;
            document.getElementById('emergencyContactTitle').value = contact.title;
            document.getElementById('emergencyContactName').value = contact.contactName;
            document.getElementById('emergencyContactPhone').value = contact.phoneNumber;
            document.getElementById('emergencyContactEmail').value = contact.email || '';
            document.getElementById('emergencyContactDescription').value = contact.description || '';
            document.getElementById('emergencyContactType').value = contact.type;
            document.getElementById('emergencyContactDisplayOrder').value = contact.displayOrder;
            document.getElementById('emergencyContactIsEmergency').checked = contact.isEmergency;
            document.getElementById('emergencyContactIsActive').checked = contact.isActive;
        }
    } else {
        modalTitle.textContent = 'Add Emergency Contact';
        document.getElementById('emergencyContactDisplayOrder').value = 0;
        document.getElementById('emergencyContactIsEmergency').checked = false;
        document.getElementById('emergencyContactIsActive').checked = true;
    }
    
    emergencyContactModal.show();
}

// Save emergency contact
async function saveEmergencyContact() {
    const id = editingEmergencyContactId;
    const title = document.getElementById('emergencyContactTitle').value.trim();
    const contactName = document.getElementById('emergencyContactName').value.trim();
    const phoneNumber = document.getElementById('emergencyContactPhone').value.trim();
    const email = document.getElementById('emergencyContactEmail').value.trim();
    const description = document.getElementById('emergencyContactDescription').value.trim();
    const type = document.getElementById('emergencyContactType').value;
    const displayOrder = parseInt(document.getElementById('emergencyContactDisplayOrder').value) || 0;
    const isEmergency = document.getElementById('emergencyContactIsEmergency').checked;
    const isActive = document.getElementById('emergencyContactIsActive').checked;
    
    // Validation
    if (!title) {
        showError('Please enter a title');
        return;
    }
    
    if (!contactName) {
        showError('Please enter a contact name');
        return;
    }
    
    if (!phoneNumber) {
        showError('Please enter a phone number');
        return;
    }
    
    if (!type) {
        showError('Please select a contact type');
        return;
    }
    
    // Email validation (if provided)
    if (email && !isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    const contactData = {
        title: title,
        contactName: contactName,
        phoneNumber: phoneNumber,
        email: email || null,
        description: description || null,
        type: type,
        displayOrder: displayOrder,
        isEmergency: isEmergency,
        isActive: isActive
    };
    
    try {
        let response;
        if (id) {
            // Update existing contact
            response = await AdminAPI.fetch(`/admin/emergency-contacts/${id}`, {
                method: 'PUT',
                body: JSON.stringify(contactData)
            });
        } else {
            // Create new contact
            response = await AdminAPI.fetch('/admin/emergency-contacts', {
                method: 'POST',
                body: JSON.stringify(contactData)
            });
        }
        
        if (response && response.id) {
            showSuccess(id ? 'Emergency contact updated successfully' : 'Emergency contact created successfully');
            emergencyContactModal.hide();
            loadEmergencyContacts();
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error saving emergency contact:', error);
        showError('Failed to save emergency contact: ' + error.message);
    }
}

// Edit emergency contact
function editEmergencyContact(id) {
    showEmergencyContactModal(id);
}

// Delete emergency contact
async function deleteEmergencyContact(id) {
    if (!confirm('Are you sure you want to delete this emergency contact?')) {
        return;
    }
    
    try {
        const response = await AdminAPI.fetch(`/admin/emergency-contacts/${id}`, {
            method: 'DELETE'
        });
        
        if (response && response.message) {
            showSuccess('Emergency contact deleted successfully');
            loadEmergencyContacts();
        } else {
            throw new Error('Failed to delete emergency contact');
        }
    } catch (error) {
        console.error('Error deleting emergency contact:', error);
        showError('Failed to delete emergency contact: ' + error.message);
    }
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

// Show toast notification
function showToast(message, type = 'info') {
    try {
        // Ensure bootstrap is available
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap not loaded');
            alert(message);
            return;
        }
        
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '11000';
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
        if (!toastElement) {
            console.error('Failed to create toast element');
            alert(message);
            return;
        }
        
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();
        console.log(`Toast shown: ${type} - ${message}`);
        
        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    } catch (error) {
        console.error('Error showing toast:', error);
        alert(message);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
