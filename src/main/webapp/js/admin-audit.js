// Audit Logs Viewer Script
let currentPage = 0;
let totalPages = 0;
let totalElements = 0;
let detailsModal = null;

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
    detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    
    // Load statistics
    loadAuditStats();
    
    // Load audit logs
    loadAuditLogs();
});

// Load audit statistics
async function loadAuditStats() {
    try {
        const response = await AdminAPI.fetch('/admin/audit-logs/stats');
        
        if (response) {
            document.getElementById('statTotalLogs').textContent = formatNumber(response.totalLogs);
            document.getElementById('statLast24Hours').textContent = formatNumber(response.logsLast24Hours);
            document.getElementById('statLast7Days').textContent = formatNumber(response.logsLast7Days);
        }
    } catch (error) {
        console.error('Error loading audit stats:', error);
        // Don't show error toast for stats, just log it
    }
}

// Load audit logs with pagination
async function loadAuditLogs(page = 0) {
    try {
        currentPage = page;
        showLoadingTable('auditLogsTableBody', 7);
        
        const pageSize = parseInt(document.getElementById('pageSize').value);
        const filterAction = document.getElementById('filterAction').value;
        const filterTable = document.getElementById('filterTable').value;
        
        // Build query params
        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString()
        });
        
        const response = await AdminAPI.fetch(`/admin/audit-logs?${params}`);
        
        // Handle Spring Boot Page response
        if (response && response.content) {
            let logs = response.content;
            
            // Client-side filtering (since backend returns all)
            if (filterAction) {
                logs = logs.filter(log => log.action === filterAction);
            }
            if (filterTable) {
                logs = logs.filter(log => log.tableName === filterTable);
            }
            
            // Update pagination info
            totalPages = response.totalPages;
            totalElements = response.totalElements;
            
            renderAuditLogsTable(logs);
            renderPaginationControls();
            updatePaginationInfo(response);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error loading audit logs:', error);
        showError('Failed to load audit logs: ' + error.message);
        document.getElementById('auditLogsTableBody').innerHTML = 
            '<tr><td colspan="7" class="text-center text-danger">Failed to load audit logs</td></tr>';
    }
}

// Render audit logs table
function renderAuditLogsTable(logs) {
    const tbody = document.getElementById('auditLogsTableBody');
    
    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No audit logs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = logs.map(log => {
        const actionBadge = getActionBadge(log.action);
        const tableName = formatTableName(log.tableName);
        const timestamp = formatDateTime(log.createdAt);
        const userName = getUserName(log);
        
        return `
            <tr>
                <td>${log.id}</td>
                <td><small>${timestamp}</small></td>
                <td>${actionBadge}</td>
                <td><span class="badge bg-secondary">${tableName}</span></td>
                <td>${log.recordId || '-'}</td>
                <td>${escapeHtml(userName)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="showDetails(${log.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get action badge HTML
function getActionBadge(action) {
    const badges = {
        'CREATE': '<span class="badge bg-success action-badge">CREATE</span>',
        'UPDATE': '<span class="badge bg-warning text-dark action-badge">UPDATE</span>',
        'DELETE': '<span class="badge bg-danger action-badge">DELETE</span>'
    };
    return badges[action] || `<span class="badge bg-secondary action-badge">${action}</span>`;
}

// Format table name for display
function formatTableName(tableName) {
    const names = {
        'employees': 'Employees',
        'announcements': 'Announcements',
        'holidays': 'Holidays',
        'carousel_slides': 'Carousel',
        'quick_links': 'Quick Links',
        'emergency_contacts': 'Emergency Contacts',
        'gallery_images': 'Gallery'
    };
    return names[tableName] || tableName;
}

// Get user name from log
function getUserName(log) {
    if (log.user && log.user.username) {
        return log.user.fullName || log.user.username;
    }
    return 'System';
}

// Format date/time
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
}

// Render pagination controls
function renderPaginationControls() {
    const container = document.getElementById('paginationControls');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${currentPage === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAuditLogs(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    // Page numbers (show max 5 pages)
    const startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(totalPages - 1, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadAuditLogs(${i}); return false;">
                    ${i + 1}
                </a>
            </li>
        `;
    }
    
    // Next button
    html += `
        <li class="page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="loadAuditLogs(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    container.innerHTML = html;
}

// Update pagination info text
function updatePaginationInfo(pageData) {
    const pageSize = parseInt(document.getElementById('pageSize').value);
    const start = (currentPage * pageSize) + 1;
    const end = Math.min((currentPage + 1) * pageSize, totalElements);
    
    document.getElementById('paginationInfo').textContent = 
        `Showing ${start}-${end} of ${totalElements} logs`;
}

// Show details modal
async function showDetails(logId) {
    try {
        const response = await AdminAPI.fetch(`/admin/audit-logs?page=0&size=1000`);
        
        if (response && response.content) {
            const log = response.content.find(l => l.id === logId);
            
            if (!log) {
                showError('Audit log not found');
                return;
            }
            
            // Populate modal
            document.getElementById('detailAction').innerHTML = getActionBadge(log.action);
            document.getElementById('detailTable').textContent = formatTableName(log.tableName);
            document.getElementById('detailRecordId').textContent = log.recordId || '-';
            document.getElementById('detailTimestamp').textContent = formatDateTime(log.createdAt);
            
            // Format JSON data
            const oldDataEl = document.getElementById('detailOldData');
            const newDataEl = document.getElementById('detailNewData');
            
            if (log.oldData) {
                try {
                    const oldJson = JSON.parse(log.oldData);
                    oldDataEl.textContent = JSON.stringify(oldJson, null, 2);
                } catch (e) {
                    oldDataEl.textContent = log.oldData;
                }
            } else {
                oldDataEl.textContent = '-';
            }
            
            if (log.newData) {
                try {
                    const newJson = JSON.parse(log.newData);
                    newDataEl.textContent = JSON.stringify(newJson, null, 2);
                } catch (e) {
                    newDataEl.textContent = log.newData;
                }
            } else {
                newDataEl.textContent = '-';
            }
            
            detailsModal.show();
        }
    } catch (error) {
        console.error('Error loading audit log details:', error);
        showError('Failed to load audit log details: ' + error.message);
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('filterAction').value = '';
    document.getElementById('filterTable').value = '';
    document.getElementById('pageSize').value = '50';
    currentPage = 0;
    loadAuditLogs();
}

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
                    <span class="ms-2">Loading audit logs...</span>
                </td>
            </tr>
        `;
    }
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
