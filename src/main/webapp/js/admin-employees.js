/**
 * Employees Management
 * CRUD operations for managing employees with photo upload
 */

let employeesData = [];
let filteredEmployeesData = [];
let editingEmployeeId = null;
let currentPage = 1;
let itemsPerPage = 25;
let searchQuery = '';
let selectedDepartment = 'ALL';
let photoValidationError = false;  // Track photo validation state
let removePhotoOnSave = false;  // Track if user wants to remove existing photo

const DEFAULT_DEPARTMENTS = [
    'Information Technology (IT)',
    'Human Resources (HR)',
    'Global Finance',
    'Marketing',
    'India Finance',
    'Philanthropy',
    'Standards Association (SA)',
    'Blended Learning Program (BLP)',
    'Publication',
    'Contact Center',
    'Computer Society',
    'India Admin',
    'Finance & Administration'
];

let departmentOptions = [...DEFAULT_DEPARTMENTS];
/**
 * Initialize employees section
 */
async function initEmployees() {
    await Promise.all([loadDepartments(), loadEmployees()]);

    // Setup search input
    const searchInput = document.getElementById('employeeSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleEmployeeSearch);
    }

    const departmentFilter = document.getElementById('departmentFilterSelect');
    if (departmentFilter) {
        departmentFilter.addEventListener('change', handleDepartmentFilterChange);
        departmentFilter.value = selectedDepartment;
    }

    // Whenever the employee modal is fully hidden (closed via X, Cancel, backdrop click,
    // or after a successful save) clear the photo file input so a stale selected file
    // can never be accidentally uploaded to the next employee that is created/edited.
    const employeeModalEl = document.getElementById('employeeModal');
    if (employeeModalEl) {
        employeeModalEl.addEventListener('hidden.bs.modal', () => {
            const photoInput = document.getElementById('employeePhoto');
            const photoFileName = document.getElementById('photoFileName');
            if (photoInput) photoInput.value = '';
            document.getElementById('photoPreviewContainer').style.display = 'none';
            document.getElementById('employeePhotoPreview').src = '';
            if (photoFileName) photoFileName.style.display = 'none';
            photoValidationError = false;  // Reset photo validation error
            removePhotoOnSave = false;  // Reset remove photo flag
            editingEmployeeId = null;
        });
    }
}

/**
 * Load department options for the employee form and filter.
 */
async function loadDepartments() {
    try {
        const departments = await AdminAPI.employees.getDepartments();
        if (Array.isArray(departments) && departments.length > 0) {
            departmentOptions = [...new Set([...DEFAULT_DEPARTMENTS, ...departments].filter(Boolean))]
                .sort((a, b) => a.localeCompare(b));
        }
    } catch (error) {
        console.warn('Could not load department list from API, using defaults:', error);
    }

    populateDepartmentDropdowns();
}

/**
 * Populate both the add/edit department dropdown and the filter dropdown.
 */
function populateDepartmentDropdowns() {
    const formSelect = document.getElementById('employeeDepartment');
    if (formSelect) {
        const currentValue = formSelect.value;
        formSelect.innerHTML = '<option value="">Select Department</option>';
        departmentOptions.forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = department;
            formSelect.appendChild(option);
        });
        if (currentValue) {
            formSelect.value = currentValue;
        }
    }

    updateDepartmentFilterOptions();
}

/**
 * Ensure a department exists in the dropdown lists.
 */
function ensureDepartmentOption(department) {
    const normalized = (department || '').trim();
    if (!normalized || departmentOptions.includes(normalized)) {
        return;
    }

    departmentOptions = [...departmentOptions, normalized].sort((a, b) => a.localeCompare(b));
    populateDepartmentDropdowns();
}

/**
 * Load all employees from API
 */
async function loadEmployees() {
    try {
        showLoadingTable('employeesTableBody', 11);
        const response = await AdminAPI.employees.getAll();
        
        // API returns array directly
        if (Array.isArray(response)) {
            employeesData = response;
            // Reset pagination and search when loading fresh data
            currentPage = 1;
            searchQuery = '';
            selectedDepartment = 'ALL';
            const searchInput = document.getElementById('employeeSearchInput');
            if (searchInput) searchInput.value = '';
            const departmentFilter = document.getElementById('departmentFilterSelect');
            if (departmentFilter) departmentFilter.value = 'ALL';
            document.getElementById('searchClearBtn').style.display = 'none';
            filterAndRenderEmployeesTable();
        } else {
            showError('Failed to load employees: Invalid response format');
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        showError('Error loading employees: ' + error.message);
    }
}

/**
 * Handle employee search/filter
 */
function handleEmployeeSearch(event) {
    searchQuery = (event.target.value || '').toLowerCase().trim();
    
    // Show/hide clear button
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'inline-block' : 'none';
    }
    
    // Reset to first page on new search
    currentPage = 1;
    filterAndRenderEmployeesTable();
}

/**
 * Handle department filter selection.
 */
function handleDepartmentFilterChange() {
    const departmentFilter = document.getElementById('departmentFilterSelect');
    selectedDepartment = departmentFilter ? (departmentFilter.value || 'ALL') : 'ALL';
    currentPage = 1;
    filterAndRenderEmployeesTable();
}

/**
 * Clear employee search
 */
function clearEmployeeSearch() {
    searchQuery = '';
    const searchInput = document.getElementById('employeeSearchInput');
    if (searchInput) searchInput.value = '';
    document.getElementById('searchClearBtn').style.display = 'none';
    currentPage = 1;
    filterAndRenderEmployeesTable();
}

/**
 * Filter and render employees table
 */
function filterAndRenderEmployeesTable() {
    filteredEmployeesData = employeesData.filter(employee => {
        const searchStr = searchQuery;
        const matchesSearch = !searchStr || (
            (employee.fullName && employee.fullName.toLowerCase().includes(searchStr)) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchStr)) ||
            (employee.email && employee.email.toLowerCase().includes(searchStr)) ||
            (employee.position && employee.position.toLowerCase().includes(searchStr)) ||
            (employee.department && employee.department.toLowerCase().includes(searchStr))
        );

        const employeeDepartment = (employee.department || '').trim();
        const matchesDepartment = selectedDepartment === 'ALL' || employeeDepartment === selectedDepartment;

        return matchesSearch && matchesDepartment;
    });
    
    // Ensure current page is valid
    const totalPages = Math.ceil(filteredEmployeesData.length / itemsPerPage);
    if (currentPage > totalPages) {
        currentPage = Math.max(1, totalPages);
    }
    
    renderEmployeesTable();
}

/**
 * Change items per page
 */
function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPageSelect');
    itemsPerPage = parseInt(select.value);
    currentPage = 1;
    filterAndRenderEmployeesTable();
}

/**
 * Go to next page
 */
function nextPage() {
    const totalPages = Math.ceil(filteredEmployeesData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        filterAndRenderEmployeesTable();
        scrollToTable();
    }
}

/**
 * Go to previous page
 */
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        filterAndRenderEmployeesTable();
        scrollToTable();
    }
}

/**
 * Scroll to table for better UX
 */
function scrollToTable() {
    const tableCard = document.getElementById('tableCard');
    if (tableCard) {
        tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Render employees table with pagination
 */
function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    const emptyState = document.getElementById('employeesEmptyState');
    const tableCard = document.getElementById('tableCard');

    if (!tbody) {
        return;
    }

    if (!employeesData || employeesData.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (tableCard) tableCard.style.display = 'none';
        updateEmployeeStats([], [], []);
        updateDepartmentFilterOptions();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableCard) tableCard.style.display = '';

    const active = employeesData.filter(employee => employee.status === 'ACTIVE');
    const inactive = employeesData.filter(employee => employee.status === 'INACTIVE' || employee.status === 'TERMINATED');
    const newJoiners = employeesData.filter(employee => {
        const days = Math.floor((new Date() - new Date(employee.startDate)) / 86400000);
        return days >= 0 && days <= 30;
    });
    updateEmployeeStats(active, inactive, newJoiners);
    updateDepartmentFilterOptions();

    const countEl = document.getElementById('recordCount');
    if (countEl) countEl.textContent = employeesData.length + ' record' + (employeesData.length !== 1 ? 's' : '');

    // Sort by name alphabetically
    const sorted = [...employeesData].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

    tbody.innerHTML = pageEmployees.map((employee, index) => {
        const birthDate = employee.birthDate || employee.birthdate;
        const birthDateText = birthDate ? formatDate(birthDate) : '-';
        const startDate = formatDate(employee.startDate);
        const endDate = employee.endDate ? formatDate(employee.endDate) : '-';
        const days = Math.floor((new Date() - new Date(employee.startDate)) / 86400000);
        const isNewJoiner = days >= 0 && days <= 30;

        const firstInitial = (employee.firstName || '').trim().charAt(0).toUpperCase() || '?';
        const lastInitial = (employee.lastName || '').trim().charAt(0).toUpperCase();
        const avatarInitials = `${firstInitial}${lastInitial}`;

        const profileImage = employee.profileImageUrl
            ? `<img src="${employee.profileImageUrl}" alt="${escapeHtml(employee.fullName)}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
            : `<span class="user-avatar" style="width:32px;height:32px;font-size:0.875rem;">${avatarInitials}</span>`;

        const statusBadges = {
            'ACTIVE': '<span class="badge bg-success">Active</span>',
            'INACTIVE': '<span class="badge bg-warning text-dark">Inactive</span>',
            'TERMINATED': '<span class="badge bg-danger">Terminated</span>'
        };

        const rowNumber = startIndex + index + 1;

        return `
            <tr>
                <td class="text-muted">${index + 1}</td>
                <td class="fw-500 d-none">${escapeHtml(employee.employeeId)}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${profileImage}
                        <div>
                            <span class="fw-semibold">${escapeHtml(employee.fullName)}</span>
                            ${isNewJoiner ? '<span class="badge bg-info text-white ms-1">New</span>' : ''}
                        </div>
                    </div>
                </td>
                <td class="text-muted small">${escapeHtml(employee.email)}</td>
                <td>${escapeHtml(employee.position)}</td>
                <td>${escapeHtml(employee.department)}</td>
                <td class="text-muted small">${birthDateText}</td>
                <td class="text-muted small">${startDate}</td>
                <td class="text-muted small">${employee.status === 'TERMINATED' ? endDate : '-'}</td>
                <td>${statusBadges[employee.status] || employee.status}</td>
                <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="showEditEmployeeModal(${employee.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updatePaginationControls(totalPages);
}

/**
 * Update pagination controls UI
 */
function updatePaginationControls(totalPages) {
    const paginationContainer = document.getElementById('paginationContainer');
    const currentPageInfo = document.getElementById('currentPageInfo');
    const totalPagesInfo = document.getElementById('totalPagesInfo');
    const prevPageItem = document.getElementById('prevPageItem');
    const nextPageItem = document.getElementById('nextPageItem');

    if (filteredEmployeesData.length <= itemsPerPage) {
        // Hide pagination if all items fit on one page
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    
    if (currentPageInfo) currentPageInfo.textContent = currentPage;
    if (totalPagesInfo) totalPagesInfo.textContent = totalPages;

    // Disable/enable previous button
    if (prevPageItem) {
        prevPageItem.classList.toggle('disabled', currentPage <= 1);
    }

    // Disable/enable next button
    if (nextPageItem) {
        nextPageItem.classList.toggle('disabled', currentPage >= totalPages);
    }
}

/**
 * Update the department filter dropdown with counts.
 */
function updateDepartmentFilterOptions() {
    const departmentFilter = document.getElementById('departmentFilterSelect');
    if (!departmentFilter) {
        return;
    }

    const currentValue = selectedDepartment || 'ALL';
    const departmentCounts = new Map();
    employeesData.forEach(employee => {
        const department = (employee.department || 'Unassigned').trim() || 'Unassigned';
        departmentCounts.set(department, (departmentCounts.get(department) || 0) + 1);
    });

    departmentFilter.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = `All Departments (${employeesData.length})`;
    departmentFilter.appendChild(allOption);

    departmentOptions.forEach(department => {
        const count = departmentCounts.get(department) || 0;
        const option = document.createElement('option');
        option.value = department;
        option.textContent = `${department} (${count})`;
        departmentFilter.appendChild(option);
    });

    departmentCounts.forEach((count, department) => {
        if (!departmentOptions.includes(department)) {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = `${department} (${count})`;
            departmentFilter.appendChild(option);
        }
    });

    departmentFilter.value = currentValue;
}

function updateEmployeeStats(active, inactive, newJoiners) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('statTotal',      employeesData.length);
    set('statActive',     active.length);
    set('statNewJoiners', newJoiners.length);
    set('statInactive',   inactive.length);
}

/**
 * Show add employee modal
 */
function showAddEmployeeModal() {
    editingEmployeeId = null;
    photoValidationError = false;  // Reset photo validation error
    document.getElementById('employeeModalTitle').textContent = 'Add Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeStatus').value = 'ACTIVE';
    
    // Set start date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('employeeStartDate').value = today;
    // Clear birth date when adding
    document.getElementById('employeeBirthDate').value = '';
    
    // Clear photo preview and filename
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('employeePhotoPreview').src = '';
    const photoFileName = document.getElementById('photoFileName');
    if (photoFileName) photoFileName.style.display = 'none';
    
    // Also explicitly clear file input in case form.reset() didn't fully clear it
    const photoInput = document.getElementById('employeePhoto');
    populateDepartmentDropdowns();
    document.getElementById('employeeDepartment').value = '';
    if (photoInput) photoInput.value = '';
    
    // Setup name auto-capitalization
    setupNameCapitalization();
    
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
    photoValidationError = false;  // Reset photo validation error
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = employee.employeeId;
    document.getElementById('employeeFirstName').value = employee.firstName;
    document.getElementById('employeeLastName').value = employee.lastName || '';
    document.getElementById('employeeEmail').value = employee.email;
    document.getElementById('employeePosition').value = employee.position;
    ensureDepartmentOption(employee.department);
    document.getElementById('employeeDepartment').value = employee.department;
    document.getElementById('employeeStartDate').value = employee.startDate;
    document.getElementById('employeeEndDate').value = employee.endDate || '';
    document.getElementById('employeeStatus').value = employee.status;
    // Populate birth date for edit if available
    document.getElementById('employeeBirthDate').value = employee.birthDate || employee.birthdate || '';

    // Always clear the file input to prevent a previously selected photo
    // (from a prior add/edit session) from being accidentally uploaded
    const photoInput = document.getElementById('employeePhoto');
    const photoFileName = document.getElementById('photoFileName');
    if (photoInput) photoInput.value = '';
    if (photoFileName) photoFileName.style.display = 'none';

    // Show photo preview if exists
    if (employee.profileImageUrl) {
        document.getElementById('photoPreviewContainer').style.display = 'block';
        document.getElementById('employeePhotoPreview').src = employee.profileImageUrl;
    } else {
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('employeePhotoPreview').src = '';
    }
    
    // Setup name auto-capitalization
    setupNameCapitalization();
    
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
}

/**
 * Handle photo selection
 */
function handleEmployeePhotoSelect(event) {
    const file = event.target.files[0];
    const photoFileName = document.getElementById('photoFileName');
    const photoFileNameText = document.getElementById('photoFileNameText');
    
    // If no file selected, reset error flag and hide preview/filename
    if (!file) {
        photoValidationError = false;
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('employeePhotoPreview').src = '';
        if (photoFileName) photoFileName.style.display = 'none';
        return;
    }
    
    // Show filename
    if (photoFileNameText) {
        photoFileNameText.textContent = file.name;
    }
    if (photoFileName) {
        photoFileName.style.display = 'block';
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Invalid image type. Please use JPG, PNG, GIF, or WebP images only');
        event.target.value = '';
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('employeePhotoPreview').src = '';
        if (photoFileName) photoFileName.style.display = 'none';
        photoValidationError = true;
        return;
    }
    
    // Validate file size (max 2MB)
    const maxSizeMB = 2;
    if (file.size > maxSizeMB * 1024 * 1024) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showError(`Image size is ${fileSizeMB}MB. Maximum allowed is ${maxSizeMB}MB`);
        event.target.value = '';
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('employeePhotoPreview').src = '';
        if (photoFileName) photoFileName.style.display = 'none';
        photoValidationError = true;
        return;
    }
    
    // Validate image dimensions
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const minDimension = 100;
            const maxDimension = 4000;  // Match backend limit
            
            // Check minimum dimensions
            if (img.width < minDimension || img.height < minDimension) {
                showError(`Image dimensions are ${img.width}×${img.height}px. Minimum size is ${minDimension}×${minDimension}px`);
                event.target.value = '';
                document.getElementById('photoPreviewContainer').style.display = 'none';
                document.getElementById('employeePhotoPreview').src = '';
                if (photoFileName) photoFileName.style.display = 'none';
                photoValidationError = true;
                return;
            }
            
            // Check maximum dimensions
            if (img.width > maxDimension || img.height > maxDimension) {
                showError(`Image dimensions are ${img.width}×${img.height}px. Maximum allowed is ${maxDimension}×${maxDimension}px`);
                event.target.value = '';
                document.getElementById('photoPreviewContainer').style.display = 'none';
                document.getElementById('employeePhotoPreview').src = '';
                if (photoFileName) photoFileName.style.display = 'none';
                photoValidationError = true;
                return;
            }
            
            // All validations passed, show preview
            photoValidationError = false;
            document.getElementById('photoPreviewContainer').style.display = 'block';
            document.getElementById('employeePhotoPreview').src = e.target.result;
        };
        
        img.onerror = () => {
            showError('Unable to read image file. Please ensure it is a valid image');
            event.target.value = '';
            document.getElementById('photoPreviewContainer').style.display = 'none';
            document.getElementById('employeePhotoPreview').src = '';
            if (photoFileName) photoFileName.style.display = 'none';
            photoValidationError = true;
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = () => {
        showError('Unable to load image file');
        event.target.value = '';
        document.getElementById('photoPreviewContainer').style.display = 'none';
        document.getElementById('employeePhotoPreview').src = '';
        if (photoFileName) photoFileName.style.display = 'none';
        photoValidationError = true;
    };
    
    reader.readAsDataURL(file);
}

/**
 * Remove employee photo
 */
function removeEmployeePhoto() {
    // Mark for removal
    removePhotoOnSave = true;
    
    // Clear preview
    document.getElementById('photoPreviewContainer').style.display = 'none';
    document.getElementById('employeePhotoPreview').src = '';
    
    // Clear file input
    const photoInput = document.getElementById('employeePhoto');
    if (photoInput) photoInput.value = '';
    
    // Clear filename display if exists
    const photoFileName = document.getElementById('photoFileName');
    if (photoFileName) photoFileName.style.display = 'none';
    
    showToast('Photo will be removed when you save', 'success');
}

/**
 * Capitalize first letter of a word
 */
function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Setup name auto-capitalization
 */
function setupNameCapitalization() {
    const firstNameInput = document.getElementById('employeeFirstName');
    const lastNameInput = document.getElementById('employeeLastName');
    
    if (firstNameInput) {
        firstNameInput.addEventListener('blur', (e) => {
            if (e.target.value.trim()) {
                e.target.value = capitalizeFirstLetter(e.target.value.trim());
            }
        });
    }
    
    if (lastNameInput) {
        lastNameInput.addEventListener('blur', (e) => {
            if (e.target.value.trim()) {
                e.target.value = capitalizeFirstLetter(e.target.value.trim());
            }
        });
    }
}

/**
 * Save employee (create or update)
 */
async function saveEmployee(event) {
    event.preventDefault();
    
    // Check if photo validation has errors (only if user tried to upload an image)
    const photoFile = document.getElementById('employeePhoto').files[0];
    if (photoValidationError && photoFile) {
        showError('Please fix the image issues before saving');
        return;
    }
    
    const employeeId = document.getElementById('employeeId').value.trim();
    const firstName = document.getElementById('employeeFirstName').value.trim();
    const lastName = document.getElementById('employeeLastName').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const position = document.getElementById('employeePosition').value.trim();
    const department = document.getElementById('employeeDepartment').value.trim();
    const startDate = document.getElementById('employeeStartDate').value;
    const endDate = document.getElementById('employeeEndDate').value;
    const birthDate = document.getElementById('employeeBirthDate').value;
    const status = document.getElementById('employeeStatus').value;
    
    // Validation with user-friendly messages
    if (!employeeId) {
        showError('Please enter an Employee ID');
        return;
    }
    
    if (!firstName) {
        showError('Please enter the Employee\'s First Name');
        return;
    }
    
    if (firstName.length < 2) {
        showError('First Name must be at least 2 characters long');
        return;
    }
    
    if (!email) {
        showError('Please enter an Email address');
        return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address (e.g., user@company.com)');
        return;
    }
    
    if (!position) {
        showError('Please enter the Employee\'s Position');
        return;
    }
    
    if (!department || department === '') {
        showError('Please select a Department');
        return;
    }
    
    if (!startDate) {
        showError('Please select a Start Date');
        return;
    }
    
    if (!birthDate) {
        showError('Please enter a Birth Date');
        return;
    }
    
    if (status === 'TERMINATED' && !endDate) {
        showError('Please enter an End Date for terminated employees');
        return;
    }
    
    // Auto-capitalize first and last names
    const capitalizedFirstName = capitalizeFirstLetter(firstName);
    const capitalizedLastName = lastName ? capitalizeFirstLetter(lastName) : '';
    
    const employeeData = {
        employeeId,
        firstName: capitalizedFirstName,
        lastName: capitalizedLastName,
        email,
        position,
        department,
        startDate,
        endDate: status === 'TERMINATED' ? endDate : '',
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
            
            // Delete photo if user requested removal
            if (removePhotoOnSave && editingEmployeeId) {
                try {
                    const deleteResponse = await AdminAPI.employees.deletePhoto(empId);
                    if (!deleteResponse || deleteResponse.error) {
                        const errMsg = (deleteResponse && deleteResponse.error) ? deleteResponse.error : 'Unknown error';
                        showError('Employee saved but photo deletion failed: ' + errMsg);
                        return;
                    }
                } catch (deleteError) {
                    showError('Employee saved but photo deletion failed: ' + deleteError.message);
                    return;
                }
                removePhotoOnSave = false;  // Reset the flag
            }
            
            // Upload photo if selected
            if (photoFile) {
                try {
                    const uploadResponse = await AdminAPI.employees.uploadPhoto(empId, photoFile);
                    // Backend returns { message: "Photo uploaded successfully", image: {...} }
                    // NOT { id: ... } — so check for message or image, not .id
                    if (!uploadResponse || uploadResponse.error || (!uploadResponse.message && !uploadResponse.image)) {
                        const errMsg = (uploadResponse && uploadResponse.error) ? uploadResponse.error : 'Unknown error';
                        showError('Employee saved but photo upload failed: ' + errMsg);
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
    
    if (!(await confirmAction(`Are you sure you want to delete employee "${employee.fullName}" (${employee.employeeId})?`, { title: 'Delete Employee' }))) {
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

