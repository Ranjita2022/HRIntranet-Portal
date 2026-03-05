/**
 * Holidays Management
 * CRUD operations for managing holidays
 */

let holidaysData = [];
let editingHolidayId = null;

/**
 * Initialize holidays section
 */
async function initHolidays() {
    await loadHolidays();
}

/**
 * Load all holidays from API
 */
async function loadHolidays() {
    try {
        showLoadingTable('holidaysTableBody', 6);
        const response = await AdminAPI.holidays.getAll();
        
        // API returns array directly
        if (Array.isArray(response)) {
            holidaysData = response;
            renderHolidaysTable();
        } else {
            showError('Failed to load holidays: Invalid response format');
        }
    } catch (error) {
        console.error('Error loading holidays:', error);
        showError('Error loading holidays: ' + error.message);
    }
}

/**
 * Render holidays table
 */
function renderHolidaysTable() {
    const tbody = document.getElementById('holidaysTableBody');
    const emptyState = document.getElementById('holidaysEmptyState');
    
    if (!holidaysData || holidaysData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('holidaysTable').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    document.getElementById('holidaysTable').style.display = 'table';
    
    // Sort by date (newest first)
    const sortedHolidays = [...holidaysData].sort((a, b) => {
        return new Date(b.holidayDate) - new Date(a.holidayDate);
    });
    
    tbody.innerHTML = sortedHolidays.map(holiday => {
        const date = formatDate(holiday.holidayDate);
        const isPast = new Date(holiday.holidayDate) < new Date();
        const statusBadge = holiday.isActive 
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Inactive</span>';
        const pastBadge = isPast 
            ? '<span class="badge bg-secondary ms-1">Past</span>'
            : '<span class="badge bg-primary ms-1">Upcoming</span>';
        
        return `
            <tr>
                <td>${holiday.id}</td>
                <td>
                    <strong>${escapeHtml(holiday.title)}</strong>
                </td>
                <td>${date}</td>
                <td>${holiday.description ? escapeHtml(holiday.description.substring(0, 100)) + (holiday.description.length > 100 ? '...' : '') : '-'}</td>
                <td>
                    ${statusBadge}
                    ${pastBadge}
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditHolidayModal(${holiday.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" onclick="deleteHoliday(${holiday.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Show add holiday modal
 */
function showAddHolidayModal() {
    editingHolidayId = null;
    document.getElementById('holidayModalTitle').textContent = 'Add Holiday';
    document.getElementById('holidayForm').reset();
    document.getElementById('holidayIsActive').checked = true;
    
    const modal = new bootstrap.Modal(document.getElementById('holidayModal'));
    modal.show();
}

/**
 * Show edit holiday modal
 */
async function showEditHolidayModal(id) {
    const holiday = holidaysData.find(h => h.id === id);
    if (!holiday) {
        showError('Holiday not found');
        return;
    }
    
    editingHolidayId = id;
    document.getElementById('holidayModalTitle').textContent = 'Edit Holiday';
    document.getElementById('holidayTitle').value = holiday.title;
    document.getElementById('holidayDate').value = holiday.holidayDate;
    document.getElementById('holidayDescription').value = holiday.description || '';
    document.getElementById('holidayIsActive').checked = holiday.isActive;
    
    const modal = new bootstrap.Modal(document.getElementById('holidayModal'));
    modal.show();
}

/**
 * Save holiday (create or update)
 */
async function saveHoliday(event) {
    event.preventDefault();
    
    const title = document.getElementById('holidayTitle').value.trim();
    const holidayDate = document.getElementById('holidayDate').value;
    const description = document.getElementById('holidayDescription').value.trim();
    const isActive = document.getElementById('holidayIsActive').checked;
    
    // Validation
    if (!title) {
        showError('Holiday title is required');
        return;
    }
    
    if (!holidayDate) {
        showError('Holiday date is required');
        return;
    }
    
    const holidayData = {
        title,
        holidayDate,
        description,
        isActive
    };
    
    try {
        let response;
        if (editingHolidayId) {
            // Update existing holiday
            response = await AdminAPI.holidays.update(editingHolidayId, holidayData);
        } else {
            // Create new holiday
            response = await AdminAPI.holidays.create(holidayData);
        }
        
        // API returns the holiday object directly
        if (response && (response.id || response.message)) {
            showSuccess(editingHolidayId ? 'Holiday updated successfully' : 'Holiday created successfully');
            bootstrap.Modal.getInstance(document.getElementById('holidayModal')).hide();
            await loadHolidays();
        } else {
            showError('Failed to save holiday: Invalid response');
        }
    } catch (error) {
        console.error('Error saving holiday:', error);
        showError('Error saving holiday: ' + error.message);
    }
}

/**
 * Delete holiday
 */
async function deleteHoliday(id) {
    const holiday = holidaysData.find(h => h.id === id);
    if (!holiday) {
        showError('Holiday not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete the holiday "${holiday.title}"?`)) {
        return;
    }
    
    try {
        const response = await AdminAPI.holidays.delete(id);
        
        // API returns {message: "..."}
        if (response && response.message) {
            showSuccess('Holiday deleted successfully');
            await loadHolidays();
        } else {
            showError('Failed to delete holiday');
        }
    } catch (error) {
        console.error('Error deleting holiday:', error);
        showError('Error deleting holiday: ' + error.message);
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
