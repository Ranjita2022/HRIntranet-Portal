let shoutouts = [];

async function initShoutoutsPage() {
    await loadShoutouts();
}

async function loadShoutouts() {
    const tableBody = document.getElementById('shoutoutsTableBody');
    const recordCount = document.getElementById('recordCount');

    tableBody.innerHTML = `
        <tr>
            <td colspan="10" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Loading shoutouts...
            </td>
        </tr>
    `;

    try {
        shoutouts = await AdminAPI.shoutouts.getAll();
        renderShoutouts();
        recordCount.textContent = `${shoutouts.length} record(s)`;
    } catch (error) {
        console.error('Failed to load shoutouts:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-4 text-danger">
                    <i class="bi bi-exclamation-triangle me-1"></i>
                    Failed to load shoutouts. Please try again.
                </td>
            </tr>
        `;
        recordCount.textContent = 'Error loading data';
    }
}

function renderShoutouts() {
    const tableBody = document.getElementById('shoutoutsTableBody');

    if (!Array.isArray(shoutouts) || shoutouts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center py-5 text-muted">
                    <i class="bi bi-chat-square-heart" style="font-size: 2rem;"></i>
                    <div class="mt-2">No shoutouts found</div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = shoutouts.map((item) => {
        const approvalClass = item.isApproved ? 'text-bg-success' : 'text-bg-secondary';
        const displayClass = item.isDisplayed ? 'text-bg-primary' : 'text-bg-warning';

        return `
            <tr>
                <td>${item.id ?? ''}</td>
                <td>${escapeHtml(item.fromName)}</td>
                <td>${escapeHtml(item.toName)}</td>
                <td class="message-cell" title="${escapeHtml(item.message)}">${escapeHtml(item.message)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td><span class="badge ${approvalClass}">${item.isApproved ? 'Yes' : 'No'}</span></td>
                <td><span class="badge ${displayClass}">${item.isDisplayed ? 'Yes' : 'No'}</span></td>
                <td>${formatDateTimeValue(item.createdAt)}</td>
                <td>${formatDateTimeValue(item.approvedAt)}</td>
                <td>${escapeHtml(item.approvedBy)}</td>
            </tr>
        `;
    }).join('');
}

function formatDateTimeValue(value) {
    if (!value) {
        return '-';
    }

    try {
        return formatDateTime(value);
    } catch (_error) {
        return value;
    }
}

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.initShoutoutsPage = initShoutoutsPage;
window.loadShoutouts = loadShoutouts;
