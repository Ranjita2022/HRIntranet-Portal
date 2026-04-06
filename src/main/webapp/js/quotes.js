/**
 * Daily Quotes Loader
 * Fetches one random quote per day from the backend proxy and caches it in localStorage.
 */

(function () {
    const DAILY_QUOTE_CACHE_KEY = 'hrPortalDailyQuoteCache';

    function getApiBaseUrl() {
        if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.API_BASE_URL) {
            return CONFIG.API_BASE_URL;
        }

        return '/api';
    }

    function getDailyQuoteApiUrl() {
        return `${getApiBaseUrl()}/public/daily-quote`;
    }

    function getLocalDayKey(date) {
        const current = date || new Date();
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getMillisecondsToNextLocalDay() {
        const now = new Date();
        const next = new Date(now);
        next.setDate(now.getDate() + 1);
        next.setHours(0, 0, 0, 0);
        return next.getTime() - now.getTime();
    }

    function readCachedQuote() {
        try {
            const raw = localStorage.getItem(DAILY_QUOTE_CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.dayKey || !parsed.quote || !parsed.author) {
                return null;
            }
            return parsed;
        } catch (error) {
            return null;
        }
    }

    function saveCachedQuote(dayKey, quoteData) {
        const payload = {
            dayKey,
            quote: quoteData.quote,
            author: quoteData.author,
            authorImageUrl: quoteData.authorImageUrl || '',
            source: getDailyQuoteApiUrl(),
            fetchedAt: new Date().toISOString()
        };

        localStorage.setItem(DAILY_QUOTE_CACHE_KEY, JSON.stringify(payload));
        return payload;
    }

    function renderQuoteLoading(containerSelector) {
        const $container = $(containerSelector);
        $container.html(`
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
                <p class="mt-3 text-muted small mb-0">Loading quote of the day...</p>
            </div>
        `);
    }

    function renderQuote(containerSelector, quoteData, options) {
        const $container = $(containerSelector);
        const authorInitials = getAuthorInitials(quoteData.author);
        const hasAuthorImage = !!quoteData.authorImageUrl;
        const avatarHtml = hasAuthorImage
            ? `<img class="quote-author-avatar" src="${escapeHtml(quoteData.authorImageUrl)}" alt="${escapeHtml(quoteData.author)}" data-author-initials="${escapeHtml(authorInitials)}">`
            : `<div class="quote-author-avatar quote-author-avatar-placeholder">${escapeHtml(authorInitials)}</div>`;

        $container.html(`
            <article class="daily-quote-card">
                <div class="quote-avatar-wrap">
                    ${avatarHtml}
                </div>
                <blockquote class="quote-text">${escapeHtml(quoteData.quote)}</blockquote>
                <footer class="quote-footer">
                    <span class="quote-author">${escapeHtml(quoteData.author)}</span>
                </footer>
            </article>
        `);

        if (hasAuthorImage) {
            const $avatarImg = $container.find('.quote-author-avatar').first();
            $avatarImg.off('error.quoteAvatar').on('error.quoteAvatar', function () {
                const initials = $(this).data('author-initials') || '?';
                const $fallback = $(`<div class="quote-author-avatar quote-author-avatar-placeholder"></div>`).text(initials);
                $(this).replaceWith($fallback);
            });
        }
    }

    function renderQuoteError(containerSelector, message) {
        const $container = $(containerSelector);
        $container.html(`
            <div class="alert alert-warning mb-0">
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${escapeHtml(message)}
            </div>
        `);
    }

    function escapeHtml(text) {
        if (text === undefined || text === null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getAuthorInitials(author) {
        if (!author) return '?';
        const parts = String(author)
            .replace(/[^A-Za-z0-9\s.-]/g, ' ')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (parts.length === 0) {
            return '?';
        }

        if (parts.length === 1) {
            return parts[0].slice(0, 2).toUpperCase();
        }

        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function fetchDailyQuoteFromApi() {
        return fetch(getDailyQuoteApiUrl(), {
            method: 'GET',
            headers: { Accept: 'application/json' }
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Quote API returned ${response.status}`);
            }
            return response.json();
        }).then(data => {
            const payload = Array.isArray(data) ? (data[0] || {}) : (data.data || data || {});
            const quote = (payload.quote || payload.q || '').trim();
            const author = (payload.author || payload.a || 'Unknown').trim();
            const authorImageUrl = (payload.authorImageUrl || payload.author_image_url || '').trim();

            if (!quote) {
                throw new Error('Quote API response did not include quote text');
            }

            return { quote, author, authorImageUrl };
        });
    }

    function loadDailyQuote(containerSelector) {
        const targetSelector = containerSelector || '#dailyQuoteContainer';
        const $container = $(targetSelector);
        if ($container.length === 0) {
            return Promise.resolve(null);
        }

        const todayKey = getLocalDayKey();
        const cached = readCachedQuote();

        if (cached && cached.dayKey === todayKey && cached.authorImageUrl) {
            renderQuote(targetSelector, cached, { isFallback: false });
            return Promise.resolve(cached);
        }

        renderQuoteLoading(targetSelector);

        return fetchDailyQuoteFromApi()
            .then(freshQuote => {
                const stored = saveCachedQuote(todayKey, freshQuote);
                renderQuote(targetSelector, stored, { isFallback: false });
                return stored;
            })
            .catch(error => {
                if (cached) {
                    renderQuote(targetSelector, cached, { isFallback: true });
                    return cached;
                }

                renderQuoteError(targetSelector, 'Unable to load quote of the day. Please try again later.');
                throw error;
            });
    }

    function scheduleNextDayRefresh(containerSelector) {
        const targetSelector = containerSelector || '#dailyQuoteContainer';
        const delay = getMillisecondsToNextLocalDay();

        window.setTimeout(function () {
            loadDailyQuote(targetSelector);
            window.setInterval(function () {
                loadDailyQuote(targetSelector);
            }, 24 * 60 * 60 * 1000);
        }, delay + 200);
    }

    window.loadDailyQuote = loadDailyQuote;

    $(document).ready(function () {
        if ($('#dailyQuoteContainer').length > 0) {
            loadDailyQuote('#dailyQuoteContainer');
            scheduleNextDayRefresh('#dailyQuoteContainer');
        }

        if ($('#quotePageContainer').length > 0) {
            loadDailyQuote('#quotePageContainer');
            scheduleNextDayRefresh('#quotePageContainer');
        }
    });
})();
