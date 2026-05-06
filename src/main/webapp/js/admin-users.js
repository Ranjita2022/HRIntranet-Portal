/**
 * Admin User Management
 * CRUD operations for managing admin users (SUPER_ADMIN only)
 * Supports creating admin users from employee list with force password change
 */

let adminUsersData = [];
let employeesListForPicker = [];
let editingAdminUserId = null;

/**
 * Initialize admin users section
 */
async function initAdminUsers() {
    // Check if current user is SUPER_ADMIN
    const currentUser = AdminAPI.getCurrentUser();
    if (currentUser.role !== 'SUPER_ADMIN') {
        showToast('Access denied. Only SUPER_ADMIN can manage admin users.', 'danger');
        window.location.href = 'admin-panel.html';
        return;
    }

    await Promise.all([loadAdminUsers(), loadEmployeesForPicker()]);
}

/**
 * Load all admin users
 */
async function loadAdminUsers() {
    try {
        const tbody = document.getElementById('adminUsersTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Loading...</td></tr>';

        adminUsersData = await AdminAPI.adminUsers.getAll();
        renderAdminUsersTable();
    } catch (error) {
        console.error('Error loading admin users:', error);
        showToast('Error loading admin users: ' + error.message, 'danger');
    }
}

/**
 * Load employees for the picker dropdown
 */
async function loadEmployeesForPicker() {
    try {
        employeesListForPicker = await AdminAPI.employees.getAll();
        // Filter to active employees only
        employeesListForPicker = employeesListForPicker.filter(e => e.status === 'ACTIVE');
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

/**
 * Render the admin users table
 */
function renderAdminUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    const emptyState = document.getElementById('adminUsersEmptyState');
    const tableCard = document.getElementById('adminUsersTableCard');
    const countEl = document.getElementById('adminUsersRecordCount');

    // Update stats
    const totalEl = document.getElementById('statTotalAdmins');
    const activeEl = document.getElementById('statActiveAdmins');
    const superEl = document.getElementById('statSuperAdmins');
    const staffEl = document.getElementById('statHrStaff');

    if (totalEl) totalEl.textContent = adminUsersData.length;
    if (activeEl) activeEl.textContent = adminUsersData.filter(u => u.isActive).length;
    if (superEl) superEl.textContent = adminUsersData.filter(u => u.role === 'SUPER_ADMIN').length;
    if (staffEl) staffEl.textContent = adminUsersData.filter(u => u.role === 'HR_STAFF').length;

    if (!adminUsersData || adminUsersData.length === 0) {
        if (tbody) tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        if (tableCard) tableCard.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableCard) tableCard.style.display = '';
    if (countEl) countEl.textContent = adminUsersData.length + ' user' + (adminUsersData.length !== 1 ? 's' : '');

    const currentUsername = AdminAPI.getCurrentUser().username;

    tbody.innerHTML = adminUsersData.map((user, index) => {
        const roleBadges = {
            'SUPER_ADMIN': '<span class="badge bg-danger">Super Admin</span>',
            'ADMIN': '<span class="badge bg-primary">Admin</span>',
            'HR_STAFF': '<span class="badge bg-info text-dark">HR Staff</span>'
        };

        const statusBadge = user.isActive
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Inactive</span>';

        const lastLogin = user.lastLogin ? formatDateTime(user.lastLogin) : '<span class="text-muted">Never</span>';
        const isSelf = user.username === currentUsername;
        const mustChangePwd = user.mustChangePassword
            ? '<span class="badge bg-warning text-dark" title="Must change password on next login"><i class="bi bi-exclamation-triangle-fill"></i> Temp</span>'
            : '';
        const linkedEmp = user.employeeId
            ? `<span class="badge bg-light text-dark border" title="Linked to employee ${escapeHtml(user.employeeId)}"><i class="bi bi-link-45deg"></i> ${escapeHtml(user.employeeId)}</span>`
            : '';

        const initial = (user.fullName || user.username || '?').charAt(0).toUpperCase();

        return `
            <tr>
                <td class="text-muted">${index + 1}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <span class="user-avatar" style="width:32px;height:32px;font-size:0.875rem;">${initial}</span>
                        <div>
                            <span class="fw-semibold">${escapeHtml(user.fullName)}</span>
                            ${isSelf ? '<span class="badge bg-light text-primary border ms-1">You</span>' : ''}
                        </div>
                    </div>
                </td>
                <td><code>${escapeHtml(user.username)}</code></td>
                <td class="text-muted small">${escapeHtml(user.email)}</td>
                <td>${roleBadges[user.role] || user.role} ${linkedEmp}</td>
                <td>${statusBadge} ${mustChangePwd}</td>
                <td class="text-muted small">${lastLogin}</td>
                <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="showEditAdminUserModal(${user.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="resetAdminPassword(${user.id})" title="Reset Password">
                            <i class="bi bi-key"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-${user.isActive ? 'secondary' : 'success'}" 
                                onclick="toggleAdminActive(${user.id})" 
                                title="${user.isActive ? 'Deactivate' : 'Activate'}">
                            <i class="bi bi-${user.isActive ? 'pause-circle' : 'play-circle'}"></i>
                        </button>
                        ${!isSelf ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteAdminUser(${user.id})" title="Delete"><i class="bi bi-trash"></i></button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Show modal to add admin user from employee
 */
function showAddAdminUserModal() {
    editingAdminUserId = null;
    document.getElementById('adminUserModalTitle').textContent = 'Grant Admin Access';
    document.getElementById('adminUserForm').reset();

    // Show employee picker section, hide manual fields
    document.getElementById('employeePickerSection').style.display = 'block';
    document.getElementById('manualFieldsSection').style.display = 'none';
    document.getElementById('adminUserRole').value = 'HR_STAFF';
    document.getElementById('adminUserTempPassword').value = 'Welcome@2026!';

    // Populate employee dropdown
    populateEmployeeDropdown();

    const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
    modal.show();
}

/**
 * Populate the employee dropdown, excluding those who already have admin accounts
 */
function populateEmployeeDropdown() {
    const select = document.getElementById('employeePicker');
    const existingEmployeeIds = adminUsersData.map(u => u.employeeId).filter(Boolean);

    const availableEmployees = employeesListForPicker.filter(
        e => !existingEmployeeIds.includes(e.employeeId)
    );

    select.innerHTML = '<option value="">-- Select an Employee --</option>';
    availableEmployees.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

    availableEmployees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.employeeId;
        opt.textContent = `${emp.fullName} (${emp.employeeId}) - ${emp.department}`;
        opt.dataset.email = emp.email;
        opt.dataset.name = emp.fullName;
        select.appendChild(opt);
    });

    if (availableEmployees.length === 0) {
        select.innerHTML = '<option value="">-- No eligible employees available --</option>';
    }
}

/**
 * When employee is selected, auto-fill username suggestion
 */
function onEmployeeSelected() {
    const select = document.getElementById('employeePicker');
    const selectedOption = select.options[select.selectedIndex];
    const usernameInput = document.getElementById('adminUserUsername');
    const infoDiv = document.getElementById('selectedEmployeeInfo');

    if (!select.value) {
        infoDiv.style.display = 'none';
        usernameInput.value = '';
        return;
    }

    const email = selectedOption.dataset.email || '';
    const name = selectedOption.dataset.name || '';

    // Auto-suggest username from email prefix
    const suggestedUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
    usernameInput.value = suggestedUsername;

    // Show info
    infoDiv.style.display = 'block';
    infoDiv.innerHTML = `
        <div class="alert alert-info py-2 mb-0">
            <small>
                <strong>Name:</strong> ${escapeHtml(name)}<br>
                <strong>Email:</strong> ${escapeHtml(email)}<br>
                <strong>Suggested Username:</strong> <code>${escapeHtml(suggestedUsername)}</code> (editable)
            </small>
        </div>
    `;
}

/**
 * Show edit admin user modal
 */
function showEditAdminUserModal(id) {
    const user = adminUsersData.find(u => u.id === id);
    if (!user) return;

    editingAdminUserId = id;
    document.getElementById('adminUserModalTitle').textContent = 'Edit Admin User';

    // Hide employee picker for edit mode
    document.getElementById('employeePickerSection').style.display = 'none';
    document.getElementById('manualFieldsSection').style.display = 'block';

    document.getElementById('editFullName').value = user.fullName;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('adminUserRole').value = user.role;
    document.getElementById('adminUserUsername').value = user.username;
    document.getElementById('adminUserUsername').readOnly = true;
    document.getElementById('adminUserTempPassword').value = '';
    document.getElementById('tempPasswordHelp').textContent = 'Leave blank to keep current password';

    document.getElementById('selectedEmployeeInfo').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('adminUserModal'));
    modal.show();
}

/**
 * Save admin user (create from employee or update)
 */
async function saveAdminUser(event) {
    event.preventDefault();

    try {
        if (editingAdminUserId) {
            // UPDATE existing admin user
            const updateData = {
                fullName: document.getElementById('editFullName').value.trim(),
                email: document.getElementById('editEmail').value.trim(),
                role: document.getElementById('adminUserRole').value
            };

            const password = document.getElementById('adminUserTempPassword').value;
            if (password) {
                updateData.password = password;
            }

            await AdminAPI.adminUsers.update(editingAdminUserId, updateData);
            showToast('Admin user updated successfully', 'success');
        } else {
            // CREATE from employee
            const employeeId = document.getElementById('employeePicker').value;
            const username = document.getElementById('adminUserUsername').value.trim();
            const tempPassword = document.getElementById('adminUserTempPassword').value;
            const role = document.getElementById('adminUserRole').value;

            if (!employeeId) {
                showToast('Please select an employee', 'danger');
                return;
            }
            if (!username) {
                showToast('Please enter a username', 'danger');
                return;
            }
            if (!tempPassword) {
                showToast('Please enter a temporary password', 'danger');
                return;
            }

            await AdminAPI.adminUsers.createFromEmployee({
                employeeId,
                username,
                tempPassword,
                role
            });
            showToast('Admin access granted successfully! User will be prompted to change password on first login.', 'success');
        }

        bootstrap.Modal.getInstance(document.getElementById('adminUserModal')).hide();
        await loadAdminUsers();
    } catch (error) {
        console.error('Error saving admin user:', error);
        showToast('Error: ' + error.message, 'danger');
    }
}

/**
 * Reset admin user password
 */
async function resetAdminPassword(id) {
    const user = adminUsersData.find(u => u.id === id);
    if (!user) return;

    const newPassword = prompt(`Reset password for "${user.username}".\n\nEnter a new temporary password:`, 'Welcome@2026!');
    if (!newPassword) return;

    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters', 'danger');
        return;
    }

    try {
        await AdminAPI.adminUsers.resetPassword(id, newPassword);
        showToast(`Password reset for "${user.username}". They will be forced to change it on next login.`, 'success');
        await loadAdminUsers();
    } catch (error) {
        showToast('Error resetting password: ' + error.message, 'danger');
    }
}

/**
 * Toggle admin user active status
 */
async function toggleAdminActive(id) {
    const user = adminUsersData.find(u => u.id === id);
    if (!user) return;

    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} "${user.username}"?`)) return;

    try {
        await AdminAPI.adminUsers.toggleActive(id);
        showToast(`User "${user.username}" ${action}d successfully`, 'success');
        await loadAdminUsers();
    } catch (error) {
        showToast('Error: ' + error.message, 'danger');
    }
}

/**
 * Delete admin user
 */
async function deleteAdminUser(id) {
    const user = adminUsersData.find(u => u.id === id);
    if (!user) return;

    if (!confirm(`Are you sure you want to DELETE admin user "${user.username}"?\n\nThis action cannot be undone.`)) return;

    try {
        await AdminAPI.adminUsers.delete(id);
        showToast(`Admin user "${user.username}" deleted successfully`, 'success');
        await loadAdminUsers();
    } catch (error) {
        showToast('Error: ' + error.message, 'danger');
    }
}

/**
 * Escape HTML utility
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

