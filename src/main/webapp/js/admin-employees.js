/**
 * Employees Management
 * CRUD operations for managing employees with photo upload
 */

let employeesData = [];
let editingEmployeeId = null;

/**
 * Initialize employees section
 */
async function initEmployees() {
    await loadEmployees();
}

/**
 * Load all employees from API
 */
async function loadEmployees() {
    try {
        showLoadingTable('employeesTableBody', 9);
        const response = await AdminAPI.employees.getAll();
        
        // API returns array directly
        if (Array.isArray(response)) {
            employeesData = response;
            renderEmployeesTable();
        } else {
            showError('Failed to load employees: Invalid response format');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showError('Error loading employees: ' + error.message);
    }
}

/**
 * Render employees table
 */
function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    const emptyState = document.getElementById('employeesEmptyState');
    
    if (!employeesData || employeesData.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        document.getElementById('employeesTable').style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    document.getElementById('employeesTable').style.display = 'table';
    
    // Sort by employee_id
    const sortedEmployees = [...employeesData].sort((a, b) => {
        return a.employeeId.localeCompare(b.employeeId);
    });
    
    tbody.innerHTML = sortedEmployees.map(employee => {
        const startDate = formatDate(employee.startDate);
        const profileImage = employee.profileImageUrl 
            ? `<img src="${employee.profileImageUrl}" alt="${escapeHtml(employee.fullName)}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`
            : `<span class="user-avatar" style="width: 32px; height: 32px; font-size: 0.875rem;">${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}</span>`;
        
        const statusBadges = {
            'ACTIVE': '<span class="badge bg-success">Active</span>',
            'INACTIVE': '<span class="badge bg-warning text-dark">Inactive</span>',
            'TERMINATED': '<span class="badge bg-danger">Terminated</span>'
        };
        
        // Check if new joiner (within last 30 days)
        const daysSinceJoining = Math.floor((new Date() - new Date(employee.startDate)) / (1000 * 60 * 60 * 24));
        const isNewJoiner = daysSinceJoining >= 0 && daysSinceJoining <= 30;
        
        return `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.employeeId}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${profileImage}
                        <div>
                            <strong>${escapeHtml(employee.fullName)}</strong>
                            ${isNewJoiner ? '<span class="badge bg-info ms-2">New Joiner</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${escapeHtml(employee.email)}</td>
                <td>${escapeHtml(employee.position)}</td>
                <td>${escapeHtml(employee.department)}</td>
                <td>${startDate}</td>
                <td>${statusBadges[employee.status] || employee.status}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="showEditEmployeeModal(${employee.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger ms-1" onclick="deleteEmployee(${employee.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Show add employee modal
 */
function showAddEmployeeModal() {
    editingEmployeeId = null;
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeStatus').value = 'ACTIVE';
    
    // Set start date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('employeeStartDate').value = today;
    // Clear birth date when adding
    document.getElementById('employeeBirthDate').value = '';
    
    // Clear photo preview
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('employeePhotoPreview').src = '';
    
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

/**
 * Show edit employee modal
 */
async function showEditEmployeeModal(id) {
    const employee = employeesData.find(e => e.id === id);
    if (!employee) {
        showError('Employee not found');
        return;
    }
    
    editingEmployeeId = id;
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = employee.employeeId;
    document.getElementById('employeeFirstName').value = employee.firstName;
    document.getElementById('employeeLastName').value = employee.lastName;
    document.getElementById('employeeEmail').value = employee.email;
    document.getElementById('employeePosition').value = employee.position;
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeStartDate').value = employee.startDate;
    document.getElementById('employeeStatus').value = employee.status;
    // Populate birth date for edit if available
    document.getElementById('employeeBirthDate').value = employee.birthDate || employee.birthdate || '';
    
    // Show photo preview if exists
    if (employee.profileImageUrl) {
        document.getElementById('photoPreviewContainer').style.display = 'block';
        document.getElementById('employeePhotoPreview').src = employee.profileImageUrl;
    } else {
        document.getElementById('photoPreviewContainer').style.display = 'none';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

/**
 * Handle photo selection
 */
function handleEmployeePhotoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file');
        event.target.value = '';
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showError('Image size must be less than 2MB');
        event.target.value = '';
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('photoPreviewContainer').style.display = 'block';
        document.getElementById('employeePhotoPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Save employee (create or update)
 */
async function saveEmployee(event) {
    event.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value.trim();
    const firstName = document.getElementById('employeeFirstName').value.trim();
    const lastName = document.getElementById('employeeLastName').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const position = document.getElementById('employeePosition').value.trim();
    const department = document.getElementById('employeeDepartment').value.trim();
    const startDate = document.getElementById('employeeStartDate').value;
    const birthDate = document.getElementById('employeeBirthDate').value;
    const status = document.getElementById('employeeStatus').value;
    const photoFile = document.getElementById('employeePhoto').files[0];
    
    // Validation
    if (!employeeId) {
        showError('Employee ID is required');
        return;
    }
    
    if (!firstName || !lastName) {
        showError('First name and last name are required');
        return;
    }
    
    if (!email) {
        showError('Email is required');
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (!position || !department) {
        showError('Position and department are required');
        return;
    }
    
    if (!startDate) {
        showError('Start date is required');
        return;
    }
    
    const employeeData = {
        employeeId,
        firstName,
        lastName,
        email,
        position,
        department,
        startDate,
        birthDate,
        status
    };
    
    try {
        let response;
        if (editingEmployeeId) {
            // Update existing employee
            response = await AdminAPI.employees.update(editingEmployeeId, employeeData);
        } else {
            // Create new employee
            response = await AdminAPI.employees.create(employeeData);
        }
        
        // API returns the employee object directly
        if (response && response.id) {
            const empId = editingEmployeeId || response.id;
            
            // Upload photo if selected
            if (photoFile) {
                try {
                    const uploadResponse = await AdminAPI.employees.uploadPhoto(empId, photoFile);
                    if (!uploadResponse || !uploadResponse.id) {
                        showError('Employee saved but photo upload failed');
                        await loadEmployees();
                        bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
                        return;
                    }
                } catch (uploadError) {
                    showError('Employee saved but photo upload failed: ' + uploadError.message);
                    await loadEmployees();
                    bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
                    return;
                }
            }
            
            showSuccess(editingEmployeeId ? 'Employee updated successfully' : 'Employee created successfully');
            bootstrap.Modal.getInstance(document.getElementById('employeeModal')).hide();
            await loadEmployees();
        } else {
            showError('Failed to save employee: Invalid response');
        }
    } catch (error) {
        console.error('Error saving employee:', error);
        showError('Error saving employee: ' + error.message);
    }
}

/**
 * Delete employee
 */
async function deleteEmployee(id) {
    const employee = employeesData.find(e => e.id === id);
    if (!employee) {
        showError('Employee not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete employee "${employee.fullName}" (${employee.employeeId})?`)) {
        return;
    }
    
    try {
        const response = await AdminAPI.employees.delete(id);
        
        // API returns {message: "..."}
        if (response && response.message) {
            showSuccess('Employee deleted successfully');
            await loadEmployees();
        } else {
            showError('Failed to delete employee');
        }
    } catch (error) {
        console.error('Error deleting employee:', error);
        showError('Error deleting employee: ' + error.message);
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
