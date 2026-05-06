let shoutouts = [];

// Pagination variables
let shoutoutsCurrentPage = 1;
let shoutoutsItemsPerPage = 15;

async function initShoutoutsPage() {
    await loadShoutouts();
}

async function loadShoutouts() {
    const tableBody = document.getElementById('shoutoutsTableBody');

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
        shoutoutsCurrentPage = 1; // Reset pagination when loading fresh data
        renderShoutouts();
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
        updateShoutoutsPaginationControls(0);
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
        updateShoutoutsPaginationControls(0);
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(shoutouts.length / shoutoutsItemsPerPage);
    if (shoutoutsCurrentPage > totalPages) {
        shoutoutsCurrentPage = Math.max(1, totalPages);
    }

    const startIndex = (shoutoutsCurrentPage - 1) * shoutoutsItemsPerPage;
    const pageShoutouts = shoutouts.slice(startIndex, startIndex + shoutoutsItemsPerPage);

    tableBody.innerHTML = pageShoutouts.map((item, index) => {
        const rowNumber = startIndex + index + 1;
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

    updateShoutoutsPaginationControls(totalPages);
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

/**
 * Shoutouts Pagination Functions
 */
function shoutsChangeItemsPerPage() {
    const select = document.getElementById('shoutsItemsPerPageSelect');
    shoutoutsItemsPerPage = parseInt(select.value);
    shoutoutsCurrentPage = 1;
    renderShoutouts();
}

function shoutsNextPage() {
    const totalPages = Math.ceil(shoutouts.length / shoutoutsItemsPerPage);
    if (shoutoutsCurrentPage < totalPages) {
        shoutoutsCurrentPage++;
        renderShoutouts();
    }
}

function shoutoutsPreviousPage() {
    if (shoutoutsCurrentPage > 1) {
        shoutoutsCurrentPage--;
        renderShoutouts();
    }
}

function updateShoutoutsPaginationControls(totalPages) {
    const paginationContainer = document.getElementById('shoutoutsPaginationContainer');
    const currentPageInfo = document.getElementById('shoutsCurrentPageInfo');
    const totalPagesInfo = document.getElementById('shoutsTotalPagesInfo');
    const prevPageItem = document.getElementById('shoutsPrevPageItem');
    const nextPageItem = document.getElementById('shoutsNextPageItem');

    if (shoutouts.length <= shoutoutsItemsPerPage) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';
    
    if (currentPageInfo) currentPageInfo.textContent = shoutoutsCurrentPage;
    if (totalPagesInfo) totalPagesInfo.textContent = totalPages;

    if (prevPageItem) {
        prevPageItem.classList.toggle('disabled', shoutoutsCurrentPage <= 1);
    }

    if (nextPageItem) {
        nextPageItem.classList.toggle('disabled', shoutoutsCurrentPage >= totalPages);
    }
}

window.initShoutoutsPage = initShoutoutsPage;
window.loadShoutouts = loadShoutouts;
