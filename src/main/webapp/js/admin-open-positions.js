/**
 * admin-open-positions.js
 * IEEE HR Intranet Portal — Admin Open Positions Management
 */

const DEFAULT_POSITION_APPLY_URL = 'https://ieee.taleo.net/careersection/1/jobsearch.ftl';
let allPositions = [];

function getPositionApplyUrl(position) {
    const applyUrl = (position && (position.applyLink || position.applyUrl || position.applicationUrl) || '').trim();
    return applyUrl || DEFAULT_POSITION_APPLY_URL;
}

$(document).ready(function() {
    initializePage();
    setupAutoMenuHighlight();
});

function initializePage() {
    AdminAPI.init();

    // Redirect to login if there is no valid admin token
    if (!AdminAPI.isAuthenticated()) {
        window.location.href = 'admin-login.html';
        return;
    }

    // Set user info from stored admin profile
    const userName = AdminAPI.getAdminName();
    if (userName) {
        $('#userName').text(userName);
        $('#userAvatar').text(userName.charAt(0).toUpperCase());
    }

    loadPositions();
}

function loadPositions() {
    // Determine which API to use based on authentication
    const isAuthenticated = AdminAPI && AdminAPI.isAuthenticated();

    if (isAuthenticated) {
        // Try admin API first (shows ALL positions)
        console.log('Authenticated - fetching all positions from admin API');
        AdminAPI.fetch('/admin/positions', {
            method: 'GET'
        })
        .then(data => {
            allPositions = data || [];
            displayPositions();
            updateStats();
            console.log(`✅ Loaded ${allPositions.length} positions from admin API`);
        })
        .catch(error => {
            console.warn('Admin API failed, falling back to public API:', error);
            loadPositionsPublic();
        });
    } else {
        // Not authenticated, use public API
        console.log('Not authenticated - fetching positions from public API');
        loadPositionsPublic();
    }
}

function loadPositionsPublic() {
    // Fetch all positions (both OPEN and CLOSED) from public API.
    // API_BASE_URL is auto-detected from window.location by config.js —
    // no hardcoded host/IP needed here.
    const url = `${CONFIG.API_BASE_URL}/public/positions/all`;

    fetch(url, { method: 'GET' })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load positions');
        return response.json();
    })
    .then(data => {
        allPositions = data || [];
        displayPositions();
        updateStats();
        console.log(`✅ Loaded ${allPositions.length} positions (all statuses)`);
    })
    .catch(error => {
        console.error('Error loading positions:', error);
        showError('Failed to load positions: ' + error.message);
        $('#positionsTableBody').html('<tr><td colspan="6" class="text-center text-danger">Error loading positions. Please try again.</td></tr>');
    });
}

function displayPositions() {
    const $tbody = $('#positionsTableBody');
    $tbody.empty();

    if (allPositions.length === 0) {
        $('#emptyState').show();
        $('#tableContainer').hide();
        updateStats();
        return;
    }

    $('#emptyState').hide();
    $('#tableContainer').show();

    // Record count badge
    const countEl = document.getElementById('positionsRecordCount');
    if (countEl) countEl.textContent = allPositions.length + ' record' + (allPositions.length !== 1 ? 's' : '');

    // Apply status filter
    const selectedStatus = $('#statusFilter').val();
    let filtered = allPositions;
    if (selectedStatus) {
        filtered = allPositions.filter(p => p.status === selectedStatus);
    }

    if (filtered.length === 0) {
        $tbody.html('<tr><td colspan="6" class="text-center py-3 text-muted">No positions match the selected filter</td></tr>');
        return;
    }

    // Sort by posting date — newest first
    filtered = [...filtered].sort((a, b) => new Date(b.postingDate) - new Date(a.postingDate));

    filtered.forEach((position, index) => {
        const applyUrl = getPositionApplyUrl(position);
        const statusBadge = position.status === 'OPEN'
            ? '<span class="badge bg-success">Open</span>'
            : position.status === 'ON_HOLD'
                ? '<span class="badge bg-warning text-dark">On Hold</span>'
                : '<span class="badge bg-secondary">Closed</span>';
        const row = `
            <tr>
                <td class="text-muted">${index + 1}</td>
                <td style="max-width:0">
                    <a href="${escapeHtml(applyUrl)}" class="requisition-title"
                       target="_blank" rel="noopener noreferrer"
                       title="${escapeHtml(position.requisitionTitle)}">
                        ${escapeHtml(position.requisitionTitle)}
                    </a>
                </td>
                <td>
                    <span class="location-badge" title="${escapeHtml(position.location)}">
                        ${escapeHtml(position.location)}
                    </span>
                </td>
                <td class="posting-date">${formatDate(position.postingDate)}</td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="editPosition(${position.id})" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePosition(${position.id})" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        $tbody.append(row);
    });
}

function updateStats() {
    const total = allPositions.length;
    const active = allPositions.filter(p => p.status === 'OPEN').length;

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const thisMonth = allPositions.filter(p => {
        const postDate = new Date(p.postingDate);
        return postDate >= monthStart && postDate <= monthEnd;
    }).length;

    $('#totalPositionsCount').text(total);
    $('#activePositionsCount').text(active);
    $('#newPositionsCount').text(thisMonth);
}

function showAddPositionModal() {
    document.getElementById('positionForm').reset();
    delete document.getElementById('positionForm').dataset.positionId;
    document.getElementById('postingDate').value = new Date().toISOString().split('T')[0];
    new bootstrap.Modal(document.getElementById('addPositionModal')).show();
}

function showError(message) {
    showToast(message, 'danger');
}

function savePosition() {
    const form = document.getElementById('positionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Check if user is authenticated
    if (!AdminAPI || !AdminAPI.isAuthenticated()) {
        showToast('Please login first to save changes. Redirecting to login...', 'danger');
        window.location.href = 'admin-login.html';
        return;
    }

    const positionData = {
        requisitionTitle: document.getElementById('requisitionTitle').value,
        location: document.getElementById('location').value,
        postingDate: document.getElementById('postingDate').value,
        requisitionId: document.getElementById('requisitionId').value.trim(),
        status: document.getElementById('positionStatus').value,
        isPublished: true,
        description: '',
        requirements: ''
    };

    // Check if editing or creating new
    const positionId = form.dataset.positionId;
    const method = positionId ? 'PUT' : 'POST';
    const url = positionId ? `/admin/positions/${positionId}` : '/admin/positions';

    if (!positionData.requisitionId) {
        showToast('Please enter Requisition ID.', 'danger');
        document.getElementById('requisitionId').focus();
        return;
    }

    // Client-side guard for duplicate requisition ID.
    const duplicate = allPositions.find(p =>
        (p.requisitionId || '').trim().toUpperCase() === positionData.requisitionId.toUpperCase() &&
        String(p.id) !== String(positionId || '')
    );
    if (duplicate) {
        showToast(`Requisition ID "${positionData.requisitionId}" already exists. Please enter a unique Requisition ID.`, 'danger');
        return;
    }

    AdminAPI.fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(positionData)
    })
    .then(() => {
        loadPositions();
        bootstrap.Modal.getInstance(document.getElementById('addPositionModal')).hide();
        showToast(positionId ? 'Position updated successfully!' : 'Position added successfully!', 'success');
    })
    .catch(error => {
        console.error('Error saving position:', error);
        if (error.message && error.message.includes('401')) {
            showToast('Your session has expired. Please login again.', 'danger');
            window.location.href = 'admin-login.html';
        } else {
            showToast(getFriendlyPositionSaveError(error.message || 'Failed to save position'), 'danger');
        }
    });
}

function getFriendlyPositionSaveError(rawMessage) {
    let message = (rawMessage || '').toString();

    try {
        const parsed = JSON.parse(message);
        message = parsed.message || parsed.error || message;
    } catch (e) {
        // Keep original text if not JSON.
    }

    const normalized = message.toLowerCase();
    if (normalized.includes('duplicate entry') && normalized.includes('requisition_id')) {
        return 'Requisition ID already exists. Please enter a unique Requisition ID.';
    }

    return 'Error saving position: ' + message;
}

function editPosition(id) {
    const position = allPositions.find(p => p.id === id);
    if (position) {
        document.getElementById('requisitionTitle').value = position.requisitionTitle;
        document.getElementById('location').value = position.location;
        document.getElementById('postingDate').value = position.postingDate;
        document.getElementById('requisitionId').value = position.requisitionId || '';
        document.getElementById('positionStatus').value = position.status;

        const form = document.getElementById('positionForm');
        form.dataset.positionId = id;

        new bootstrap.Modal(document.getElementById('addPositionModal')).show();
    }
}

function deletePosition(id) {
    if (!confirm('Are you sure you want to delete this position?')) return;

    // Check if user is authenticated
    if (!AdminAPI || !AdminAPI.isAuthenticated()) {
        alert('Please login first to delete positions. Redirecting to login...');
        window.location.href = 'admin-login.html';
        return;
    }

    AdminAPI.fetch(`/admin/positions/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        loadPositions();
        showToast('Position deleted successfully!', 'success');
    })
    .catch(error => {
        console.error('Error deleting position:', error);
        showToast('Error deleting position: ' + error.message, 'danger');
    });
}

function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1080';
        document.body.appendChild(toastContainer);
    }

    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' ? 'bi-check-circle-fill' :
        type === 'danger' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${icon} me-2"></i>${escapeHtml(message)}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function exportToCSV() {
    if (allPositions.length === 0) {
        alert('No data to export');
        return;
    }

    let csv = 'Requisition ID,Requisition Title,Location,Posting Date,Status\n';

    allPositions.forEach(position => {
        csv += `${position.requisitionId},"${position.requisitionTitle}","${position.location}",${position.postingDate},${position.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open-positions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        AdminAPI.logout();
        window.location.href = 'admin-login.html';
    }
}

function setupAutoMenuHighlight() {
    const currentPage = window.location.pathname.split('/').pop() || 'admin-panel.html';
    $('.sidebar-menu .menu-item').each(function() {
        const href = $(this).attr('href') || '';
        if (href.includes(currentPage)) {
            $(this).addClass('active');
        }
    });
}

