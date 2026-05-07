/**
 * Admin Suggestions Management
 * View, update status, add notes, and delete employee suggestions
 */

let suggestionsData = [];
let currentFilter = 'ALL';
let currentSuggestion = null;

const STATUS_BADGES = {
    NEW:         '<span class="badge bg-primary">New</span>',
    REVIEWED:    '<span class="badge bg-warning text-dark">Reviewed</span>',
    IMPLEMENTED: '<span class="badge bg-success">Implemented</span>',
    DISMISSED:   '<span class="badge bg-secondary">Dismissed</span>'
};

const CATEGORY_LABELS = {
    WORKPLACE:  '🏢 Workplace',
    BENEFITS:   '🎁 Benefits',
    CULTURE:    '🌟 Culture',
    PROCESS:    '⚙️ Process',
    TECHNOLOGY: '💻 Technology',
    OTHER:      '💡 Other'
};

async function initSuggestions() {
    await loadSuggestions();
}

async function loadSuggestions(statusFilter) {
    try {
        showLoadingTable('suggestionsTableBody', 7);
        const filter = statusFilter || currentFilter;
        currentFilter = filter;

        let url = '/admin/suggestions';
        if (filter && filter !== 'ALL') url += `?status=${filter}`;

        const data = await AdminAPI.fetch(url);
        suggestionsData = data.suggestions || [];

        // Stats
        const s = data.stats || {};
        setEl('statTotal',       s.total       || 0);
        setEl('statNew',         s.newCount    || 0);
        setEl('statReviewed',    s.reviewed    || 0);
        setEl('statImplemented', s.implemented || 0);
        setEl('statDismissed',   s.dismissed   || 0);

        // Active filter tab
        document.querySelectorAll('.suggestion-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        renderTable();
    } catch (err) {
        console.error('Error loading suggestions:', err);
        showAdminError('Failed to load suggestions: ' + err.message);
    }
}

function renderTable() {
    const tbody = document.getElementById('suggestionsTableBody');
    const countEl = document.getElementById('recordCount');

    if (!suggestionsData || suggestionsData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>No suggestions found.</td></tr>`;
        if (countEl) countEl.textContent = '0 records';
        return;
    }

    if (countEl) countEl.textContent = suggestionsData.length + ' record' + (suggestionsData.length !== 1 ? 's' : '');

    tbody.innerHTML = suggestionsData.map((s, i) => {
        const submitter = s.isAnonymous ? '<em class="text-muted">Anonymous</em>' : escHtml(s.submitterName || '—');
        const preview = (s.suggestionText || '').length > 80
            ? escHtml(s.suggestionText.substring(0, 80)) + '…'
            : escHtml(s.suggestionText || '');
        const ref = s.refNumber || '—';
        return `
        <tr>
            <td class="text-muted small fw-semibold" style="white-space:nowrap;">${ref}</td>
            <td>${submitter}</td>
            <td><span class="badge bg-light text-dark border">${CATEGORY_LABELS[s.category] || s.category}</span></td>
            <td class="small" style="max-width:260px;word-break:break-word;">${preview}</td>
            <td>${STATUS_BADGES[s.status] || s.status}</td>
            <td class="text-muted small">${formatDateTime(s.submittedAt)}</td>
            <td class="text-center">
                <div class="d-flex gap-1 justify-content-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="openViewModal(${s.id})" title="View & Update">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSuggestion(${s.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function openViewModal(id) {
    currentSuggestion = suggestionsData.find(s => s.id === id);
    if (!currentSuggestion) return;

    const s = currentSuggestion;
    setEl('modalRefNumber',  s.refNumber || '—');
    setEl('modalSubmitter',  s.isAnonymous ? 'Anonymous' : (s.submitterName || '—'));
    setEl('modalCategory',   CATEGORY_LABELS[s.category] || s.category);
    setEl('modalSubmittedAt', formatDateTime(s.submittedAt));
    setEl('modalSuggestionText', s.suggestionText || '');
    setEl('modalReviewedBy', s.reviewedBy ? `${s.reviewedBy} on ${formatDateTime(s.reviewedAt)}` : '—');

    document.getElementById('modalStatus').value     = s.status;
    document.getElementById('modalAdminNotes').value = s.adminNotes || '';
    document.getElementById('modalPublicNote').value = s.publicNote || '';

    const modal = new bootstrap.Modal(document.getElementById('viewModal'));
    modal.show();
}

async function saveModalChanges() {
    if (!currentSuggestion) return;

    const status     = document.getElementById('modalStatus').value;
    const adminNotes = document.getElementById('modalAdminNotes').value.trim();
    const publicNote = document.getElementById('modalPublicNote').value.trim();

    try {
        document.getElementById('saveModalBtn').disabled = true;
        await AdminAPI.fetch(`/admin/suggestions/${currentSuggestion.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status, adminNotes, publicNote })
        });
        showAdminSuccess('Suggestion updated successfully');
        bootstrap.Modal.getInstance(document.getElementById('viewModal')).hide();
        await loadSuggestions();
    } catch (err) {
        showAdminError('Failed to update: ' + err.message);
    } finally {
        document.getElementById('saveModalBtn').disabled = false;
    }
}

async function deleteSuggestion(id) {
    const s = suggestionsData.find(x => x.id === id);
    if (!s) return;
    const name = s.isAnonymous ? 'Anonymous' : (s.submitterName || 'Unknown');
    if (!confirm(`Delete suggestion from "${name}"?\n\nThis cannot be undone.`)) return;

    try {
        await AdminAPI.fetch(`/admin/suggestions/${id}`, { method: 'DELETE' });
        showAdminSuccess('Suggestion deleted');
        await loadSuggestions();
    } catch (err) {
        showAdminError('Failed to delete: ' + err.message);
    }
}

// ─── Helpers ──────────────────────────────────────────────────
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function escHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDateTime(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function showLoadingTable(id, cols) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<tr><td colspan="${cols}" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div>Loading...</td></tr>`;
}

function showAdminSuccess(msg) { showToast(msg, 'success'); }
function showAdminError(msg)   { showToast(msg, 'danger'); }

