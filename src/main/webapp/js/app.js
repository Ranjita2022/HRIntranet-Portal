/**
 * HR Intranet Portal - Main Application
 * ======================================
 * Handles data fetching from database and rendering UI components
 */

$(document).ready(function () {
    // Initialize the application
    init();
});

/**
 * Initialize the application
 */
function init() {
    // Set current year in footer
    $('#currentYear').text(new Date().getFullYear());

    debugLog('Initializing HR Portal...');

    // Load data from database
    debugLog('Loading data from database');
    loadAllDataFromDatabase();

    // Setup auto-refresh if enabled
    if (CONFIG.AUTO_REFRESH_MINUTES > 0) {
        setInterval(loadAllDataFromDatabase, CONFIG.AUTO_REFRESH_MINUTES * 60 * 1000);
        debugLog(`Auto-refresh enabled: every ${CONFIG.AUTO_REFRESH_MINUTES} minutes`);
    }
}

// DATABASE API FUNCTIONS
function loadAllDataFromDatabase() {
    console.log('🚀 === LOADING DATA FROM DATABASE ===');
    console.log('📡 API Base URL:', CONFIG.API_BASE_URL);

    debugLog('Loading data from database API...');

    // Fetch portal data from public API endpoint
    const portalDataUrl = `${CONFIG.API_BASE_URL}/public/portal-data`;
    console.log(`🔄 Fetching portal data from: ${portalDataUrl}`);

    // Build query params
    const params = new URLSearchParams({
        maxJoiners: CONFIG.MAX_JOINERS || 6,
        maxHolidays: CONFIG.MAX_HOLIDAYS || 5,
        maxAnnouncements: CONFIG.MAX_ANNOUNCEMENTS || 10,
        maxCarouselSlides: CONFIG.MAX_CAROUSEL_SLIDES || 2000
    });

    const fullUrl = `${portalDataUrl}?${params.toString()}`;

    $.ajax({
        url: fullUrl,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log(' Database API response received', response);
            debugLog('Database data loaded successfully', response);

            // Transform database response to match expected format
            const transformedData = transformDatabaseResponse(response);

            // Process and render the data
            processUpdatesData(transformedData.updates);
            processCarouselData(transformedData.carousel);

            // Process celebrations - they will be combined with joiners in renderTeamUpdates
            window.celebrationsData = transformedData.celebrations || [];

            // Render celebrations as a separate section AND combined in team updates
            if (window.celebrationsData.length > 0) {
                console.log('🎉 Celebrations data from database:', window.celebrationsData.length);
                const joiners = window.joinersData || [];
                renderTeamUpdates(joiners, window.celebrationsData);
                renderCelebrations(window.celebrationsData);
            }

            // Load random gallery images if enabled
            if (CONFIG.ENABLE_RANDOM_GALLERY) {
                loadRandomGalleryImages();
            }

            // Load quick links if needed
            if (typeof loadQuickLinks === 'function') {
                loadQuickLinks();
            }

            // Load emergency contacts if needed
            if (typeof loadEmergencyContacts === 'function') {
                loadEmergencyContacts();
            }

            // Load open positions for current month (always load data, TV mode controls visibility)
            if (typeof loadOpenPositions === 'function') {
                loadOpenPositions();
            }

            // Update last updated time
            updateLastUpdatedTime();

            console.log('🚀 === DATABASE DATA LOADING COMPLETE ===');
        },
        error: function (xhr, status, error) {
            console.error('❌ === ERROR LOADING DATABASE DATA ===');
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);

            showError('Some problem occurred. Please try again later.');
            debugLog('Database loading error', { status, error, response: xhr.responseText });
        }
    });
}

/**
 * Transform database API response to match app's expected format
 */
function transformDatabaseResponse(dbResponse) {
    const updates = [];

    // Transform joiners (recent employees)
    if (dbResponse.joiners && dbResponse.joiners.length > 0) {
        dbResponse.joiners.forEach(joiner => {
            updates.push({
                ID: joiner.ID || joiner.id,
                Type: 'joiner',
                Title: joiner.Title || `Welcome ${joiner.Name} to Our Team!`,
                Name: joiner.Name || '',
                Position: joiner.Position || '',
                Department: joiner.Department || '',
                StartDate: joiner.StartDate || '',
                Date: joiner.Date || '',
                Description: joiner.Description || `We are excited to welcome ${joiner.Name} to ${joiner.Department || 'our team'}!`,
                ImageURL: joiner.ImageURL || ''
            });
        });
    }

    // Transform holidays
    if (dbResponse.holidays && dbResponse.holidays.length > 0) {
        dbResponse.holidays.forEach(holiday => {
            updates.push({
                ID: holiday.ID || holiday.id,
                Type: 'holiday',
                Title: holiday.Title || holiday.name,
                Name: '',
                Position: '',
                Department: '',
                StartDate: '',
                Date: holiday.Date || '',
                Description: holiday.Description || '',
                ImageURL: ''
            });
        });
    }

    // Transform announcements
    if (dbResponse.announcements && dbResponse.announcements.length > 0) {
        dbResponse.announcements.forEach(announcement => {
            const type = mapAnnouncementType(announcement.Type);
            updates.push({
                ID: announcement.ID,
                Type: type,
                Title: announcement.Title,
                Name: '',
                Position: '',
                Department: '',
                StartDate: '',
                Date: announcement.Date || '',
                Description: announcement.Description || '',
                ImageURL: announcement.ImageURL || ''
            });
        });
    }

    // Transform breaking news
    if (dbResponse.breakingNews && dbResponse.breakingNews.length > 0) {
        dbResponse.breakingNews.forEach(news => {
            updates.push({
                ID: news.ID,
                Type: 'breaking',
                Title: news.Title,
                Name: '',
                Position: '',
                Department: '',
                StartDate: '',
                Date: news.Date || '',
                EndDate: news.EndDate || news.ExpiryDate || news.Expiry || news.ValidTill || '',
                Description: news.Description || '',
                ImageURL: news.ImageURL || ''
            });
        });
    }

    // Transform events
    if (dbResponse.events && dbResponse.events.length > 0) {
        dbResponse.events.forEach(event => {
            updates.push({
                ID: event.ID,
                Type: 'event',
                Title: event.Title,
                Name: '',
                Position: '',
                Department: '',
                StartDate: '',
                Date: event.Date || '',
                Description: event.Description || '',
                ImageURL: event.ImageURL || ''
            });
        });
    }

    // Transform carousel slides
    const carousel = [];
    if (dbResponse.carousel && dbResponse.carousel.length > 0) {
        dbResponse.carousel.forEach(slide => {
            carousel.push({
                ID: slide.ID || slide.id,
                Title: slide.Title || slide.title || '',
                Caption: slide.Subtitle || slide.subtitle || slide.caption || '',
                ImageURL: slide.ImageURL || slide.imageUrl || ''
            });
        });
    }

    // Transform celebrations (work anniversaries)
    const celebrations = [];
    if (dbResponse.celebrations && dbResponse.celebrations.length > 0) {
        dbResponse.celebrations.forEach(celebration => {
            const typeRaw = (celebration.Type || '').toString().toLowerCase();
            const isBirthday = typeRaw === 'birthday';
            const celebrationDate = celebration.Date || '';

            // Show birthdays only for the current month.
            if (isBirthday && !isCurrentMonthDate(celebrationDate)) {
                return;
            }

            const years = celebration.Years || 0;

            // Default messages similar to new joiner welcome text
            let descriptionText = '';
            if (isBirthday) {
                descriptionText = celebration.Description || `Happy Birthday, ${celebration.Name || 'colleague'}! Wishing you a wonderful day and year ahead.`;
            } else {
                const yearLabel = years === 1 ? 'Year' : 'Years';
                descriptionText = celebration.Description || `${celebration.Name || 'Colleague'} celebrates ${years} ${yearLabel} at IEEE — congratulations and best wishes!`;
            }

            updates.push({
                ID: celebration.ID || celebration.id,
                Type: celebration.Type || 'anniversary',
                Name: celebration.Name || '',
                Date: celebrationDate,
                Years: years,
                Department: celebration.Department || '',
                ImageURL: celebration.ImageURL || '',
                Title: '',
                Position: '',
                StartDate: '',
                Description: descriptionText
            });

            celebrations.push({
                id: celebration.ID || celebration.id,
                type: celebration.Type || 'anniversary',
                name: celebration.Name || '',
                date: celebrationDate,
                years: years,
                department: celebration.Department || '',
                imageUrl: celebration.ImageURL || '',
                description: descriptionText
            });
        });
    }

    return {
        updates: updates,
        carousel: carousel,
        celebrations: celebrations
    };
}

/**
 * Map database announcement type to app type
 */
function mapAnnouncementType(dbType) {
    const typeMap = {
        'GENERAL': 'announcement',
        'URGENT': 'announcement',
        'BREAKING': 'breaking',
        'POLICY': 'announcement',
        'EVENT': 'event',
        'WORK_ANNIVERSARY': 'anniversary'
    };
    return typeMap[dbType] || 'announcement';
}

/**
 * Load random gallery images from database
 */
function loadRandomGalleryImages() {
    const count = CONFIG.RANDOM_GALLERY_COUNT || 20;
    const url = `${CONFIG.API_BASE_URL}/public/gallery/random?limit=${count}`;

    console.log(`🔄 Fetching ${count} random gallery images...`);

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('✅ Random gallery images loaded:', response.length);
            // Process gallery images if you have a gallery section
            if (typeof displayGalleryImages === 'function') {
                displayGalleryImages(response);
            }
        },
        error: function (xhr, status, error) {
            console.log('⚠️ Could not load gallery images:', error);
        }
    });
}

/**
 * Load quick links from database
 */
function loadQuickLinks() {
    const url = `${CONFIG.API_BASE_URL}/public/quick-links`;

    console.log('🔄 Fetching quick links...');

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('✅ Quick links loaded:', response.length);
            // Process quick links if you have a quick links section
            if (typeof displayQuickLinks === 'function') {
                displayQuickLinks(response);
            }
        },
        error: function (xhr, status, error) {
            console.log('⚠️ Could not load quick links:', error);
        }
    });
}

/**
 * Display quick links with show more functionality
 */
function displayQuickLinks(quickLinks) {
    const $container = $('#quickLinksContainer');

    if (!quickLinks || quickLinks.length === 0) {
        $container.html('<p class="text-muted">No quick links available</p>');
        return;
    }

    console.log('🔗 Rendering', quickLinks.length, 'quick links');

    // Clear container
    $container.empty();

    const maxInitial = 6;
    const hasMore = quickLinks.length > maxInitial;

    // Render quick links
    quickLinks.forEach((link, index) => {
        const isHidden = hasMore && index >= maxInitial;
        const hiddenClass = isHidden ? 'quick-link-hidden' : '';

        const $link = $(`
            <a href="${escapeHtml(link.URL)}" class="quick-link-item ${hiddenClass}" target="_blank" rel="noopener">
                <i class="bi ${escapeHtml(link.Icon || 'bi-link-45deg')}"></i>
                <span>${escapeHtml(link.Title)}</span>
            </a>
        `);

        $container.append($link);
    });

    // Add icon-only expand/collapse button if there are more than 6 links
    if (hasMore) {
        const $showMoreBtn = $(`
            <button class="quick-link-show-more" id="quickLinksShowMore" title="Show more quick links">
                <i class="bi bi-chevron-down"></i>
            </button>
        `);

        $container.append($showMoreBtn);

        // Handle show more/less toggle
        $showMoreBtn.on('click', function () {
            const $hiddenLinks = $container.find('.quick-link-hidden');
            const isExpanded = $hiddenLinks.first().is(':visible');

            if (isExpanded) {
                // Collapse
                $hiddenLinks.slideUp(300);
                $showMoreBtn.html(`<i class="bi bi-chevron-down"></i>`);
                $showMoreBtn.attr('title', 'Show more quick links');
            } else {
                // Expand
                $hiddenLinks.slideDown(300);
                $showMoreBtn.html(`<i class="bi bi-chevron-up"></i>`);
                $showMoreBtn.attr('title', 'Show less');
            }
        });
    }
}

/**
 * Load emergency contacts from database
 */
function loadEmergencyContacts() {
    const url = `${CONFIG.API_BASE_URL}/public/emergency-contacts?emergencyOnly=true`;

    console.log('🔄 Fetching emergency contacts...');

    $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log('✅ Emergency contacts loaded:', response.length);
            // Process emergency contacts if you have an emergency contacts section
            if (typeof displayEmergencyContacts === 'function') {
                displayEmergencyContacts(response);
            }
        },
        error: function (xhr, status, error) {
            console.log('⚠️ Could not load emergency contacts:', error);
        }
    });
}

/**
 * Display emergency contacts with show more functionality
 */
function displayEmergencyContacts(contacts) {
    const $container = $('.emergency-contacts');

    if (!contacts || contacts.length === 0) {
        $container.html('<p class="text-muted">No emergency contacts available</p>');
        return;
    }

    console.log('🚨 Rendering', contacts.length, 'emergency contacts');

    // Clear container
    $container.empty();

    const maxInitial = 3;
    const hasMore = contacts.length > maxInitial;

    // Render emergency contacts
    contacts.forEach((contact, index) => {
        const isHidden = hasMore && index >= maxInitial;
        const hiddenClass = isHidden ? 'emergency-contact-hidden' : '';

        const $contact = $(`
            <div class="emergency-contact ${hiddenClass}">
                <i class="bi bi-telephone-fill"></i>
                <div>
                    <strong>${escapeHtml(contact.ContactName || contact.Title)}</strong>
                    <span>${escapeHtml(contact.PhoneNumber)}</span>
                </div>
            </div>
        `);

        $container.append($contact);
    });

    // Add icon-only expand/collapse button if there are more than 3 contacts
    if (hasMore) {
        const $showMoreBtn = $(`
            <button class="emergency-show-more" id="emergencyShowMore" title="Show more emergency contacts">
                <i class="bi bi-chevron-down"></i>
            </button>
        `);

        $container.append($showMoreBtn);

        // Handle show more/less toggle
        $showMoreBtn.on('click', function () {
            const $hiddenContacts = $container.find('.emergency-contact-hidden');
            const isExpanded = $hiddenContacts.first().is(':visible');

            if (isExpanded) {
                // Collapse
                $hiddenContacts.slideUp(300);
                $showMoreBtn.html(`<i class="bi bi-chevron-down"></i>`);
                $showMoreBtn.attr('title', 'Show more emergency contacts');
            } else {
                // Expand
                $hiddenContacts.slideDown(300);
                $showMoreBtn.html(`<i class="bi bi-chevron-up"></i>`);
                $showMoreBtn.attr('title', 'Show less');
            }
        });
    }
}

//  Process and categorize updates data

function processUpdatesData(data) {
    const joiners = [];
    const holidays = [];
    const announcements = [];
    const breakingNews = [];
    const events = [];
    const birthdays = [];

    console.log('🔍 Processing updates data. Sample row:', data);

    data.forEach(row => {
        const type = (row.Type || '').toLowerCase().trim();

        switch (type) {
            case 'joiner':
            case 'newjoiner':
                const joinerData = {
                    id: row.ID,
                    title: row.Title,
                    name: row.Name,
                    position: row.Position,
                    department: row.Department,
                    startDate: row.StartDate || row.Date,  // Accept both StartDate and Date
                    description: row.Description,
                    imageUrl: row.ImageURL
                };
                console.log('👤 New Joiner found:', joinerData.name, 'Image URL:', joinerData.imageUrl);
                joiners.push(joinerData);
                break;

            case 'holiday':
                holidays.push({
                    id: row.ID,
                    title: row.Title,
                    date: row.Date,
                    description: row.Description,
                    imageUrl: row.ImageURL
                });
                break;

            case 'announcement':
                announcements.push({
                    id: row.ID,
                    title: row.Title,
                    description: row.Description,
                    imageUrl: row.ImageURL
                });
                break;

            case 'breaking':
                breakingNews.push({
                    id: row.ID,
                    title: row.Title,
                    description: row.Description,
                    date: row.Date,
                    endDate: row.EndDate || row.ExpiryDate || row.Expiry || row.ValidTill || ''
                });
                break;

            case 'event':
                events.push({
                    id: row.ID,
                    title: row.Title,
                    date: row.Date,
                    description: row.Description
                });
                break;

            case 'birthday':
                if (!isCurrentMonthDate(row.Date)) {
                    break;
                }
                birthdays.push({
                    id: row.ID,
                    type: 'birthday',
                    name: row.Name,
                    date: row.Date,
                    department: row.Department,
                    imageUrl: row.ImageURL
                });
                break;
        }
    });

    debugLog('Processed updates:', { joiners, holidays, announcements, breakingNews, events, birthdays });

    // Render each section
    renderHolidays(holidays);
    renderAnnouncements(announcements);
    renderBreakingNews(breakingNews);
    renderEventCountdown(events);

    // Combine joiners and birthdays for unified team updates section
    console.log('🎨 Combining joiners and birthdays for team updates');
    // Sort birthdays by date
    if (birthdays.length > 0) {
        birthdays.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });
    }
    renderTeamUpdates(joiners, birthdays);

    // Update stats
    updateStats(joiners.length, holidays.length, announcements.length, birthdays.length);
}

/**
 * Process carousel data
 */
function processCarouselData(data) {
    console.log('🎠 === CAROUSEL DEBUG ===');
    console.log('📊 Raw carousel data received:', data);
    console.log('📝 Number of rows:', data.length);

    if (data.length > 0) {
        console.log('🔍 First row structure:', data[0]);
        console.log('🔑 Available columns:', Object.keys(data[0]));
    }

    const slides = data.map((row, index) => {
        // Support both named headers (Title, Caption, Image) and column letters (A, B, C)
        const slide = {
            id: row.ID || index + 1,
            title: row.Title || row.A || '',
            caption: row.Caption || row.B || '',
            imageUrl: row.Image || row.ImageURL || row.C || ''
        };
        console.log(`🖼️  Slide ${index + 1}:`, {
            title: slide.title,
            caption: slide.caption,
            imageUrl: slide.imageUrl,
            hasImage: !!slide.imageUrl
        });
        return slide;
    }).filter(slide => {
        const hasImage = !!slide.imageUrl;
        if (!hasImage) {
            console.warn('⚠️  Filtered out slide (no image):', slide.title);
        }
        return hasImage;
    });

    console.log('✅ Total valid slides with images:', slides.length);
    console.log('🎠 === END CAROUSEL DEBUG ===');

    debugLog('Processed carousel:', slides);
    renderCarousel(slides);
}

/**
 * Render carousel slides
 */
function renderCarousel(slides) {
    console.log('🖼️ === RENDER CAROUSEL ===');
    console.log('📊 Slides to render:', slides.length);

    // In TV mode, skip re-rendering to avoid resetting the carousel mid-cycle
    const hasExistingSlides = $('#carouselInner .carousel-item').length > 0;
    const hasLoadingPlaceholder = $('#carouselInner .carousel-placeholder').length > 0;
    if (tvModeEnabled && hasExistingSlides && !hasLoadingPlaceholder) {
        console.log('⏭️ TV mode active — skipping carousel re-render to preserve cycle');
        return;
    }

    const $indicators = $('#carouselIndicators');
    const $inner = $('#carouselInner');

    console.log('🎯 Target elements found:', {
        indicators: $indicators.length,
        inner: $inner.length
    });

    $indicators.empty();
    $inner.empty();

    if (slides.length === 0) {
        console.warn('⚠️ No slides to render - showing default slide');
        // Show default slide
        $inner.html(`
            <div class="carousel-item active">
                <img src="${CONFIG.DEFAULT_CAROUSEL_IMAGE}" class="d-block w-100" alt="Welcome">
                <div class="carousel-caption">
                    <h3>Welcome to HR Portal</h3>
                    <p>Your central hub for company updates, holidays, and team announcements.</p>
                </div>
            </div>
        `);
        return;
    }

    const maxSlides = Math.min(slides.length, CONFIG.MAX_CAROUSEL_SLIDES);
    console.log(`✅ Rendering ${maxSlides} slides (max: ${CONFIG.MAX_CAROUSEL_SLIDES})`);

    for (let i = 0; i < maxSlides; i++) {
        const slide = slides[i];
        const isActive = i === 0 ? 'active' : '';
        const ariaCurrent = i === 0 ? 'aria-current="true"' : '';

        console.log(`📸 Slide ${i + 1}:`, {
            title: slide.title,
            caption: slide.caption,
            imageUrl: slide.imageUrl
        });

        // Add indicator
        $indicators.append(`
            <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="${i}" 
                    class="${isActive}" ${ariaCurrent} aria-label="Slide ${i + 1}"></button>
        `);

        // Fix Drive URLs for embedding
        const fixedImageUrl = fixDriveImageUrl(slide.imageUrl);
        console.log(`🔧 Fixed URL for slide ${i + 1}:`, fixedImageUrl);

        // Extract file ID for fallback attempts
        let fileId = null;
        if (slide.imageUrl) {
            const match = slide.imageUrl.match(/[?&/]([a-zA-Z0-9_-]{20,})/);
            if (match) fileId = match[1];
        }

        // Add slide
        $inner.append(`
            <div class="carousel-item ${isActive}">
                <img src="${escapeHtml(fixedImageUrl)}" class="d-block w-100" 
                     alt="${escapeHtml(slide.title)}" data-file-id="${fileId || ''}"
                     onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { this.src='${CONFIG.DEFAULT_CAROUSEL_IMAGE}'; }">
                ${slide.title || slide.caption ? `
                <div class="carousel-caption">
                    ${slide.title ? `<h3>${escapeHtml(slide.title)}</h3>` : ''}
                    ${slide.caption ? `<p>${escapeHtml(slide.caption)}</p>` : ''}
                </div>
                ` : ''}
            </div>
        `);
    }

    console.log('✅ Carousel HTML rendered');

    // Initialize Bootstrap carousel with auto-cycle
    const carouselElement = document.getElementById('heroCarousel');
    if (carouselElement) {
        console.log('✅ Initializing Bootstrap carousel');

        // Dispose any existing instance first to avoid duplicates
        const existingInstance = bootstrap.Carousel.getInstance(carouselElement);
        if (existingInstance) {
            existingInstance.dispose();
        }

        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: CONFIG.CAROUSEL_INTERVAL,
            ride: 'carousel',
            pause: false  // Don't pause on hover/focus in TV mode
        });

        // In TV mode, check if we're in the carousel phase or content phase
        if (tvModeEnabled) {
            if ($('.carousel-section').is(':visible')) {
                // Carousel phase is active — keep cycling
                carousel.cycle();
                console.log('✅ Carousel initialized and cycling (TV carousel phase)');
            } else {
                // Content phase — keep paused
                carousel.pause();
                console.log('✅ Carousel initialized but paused (TV content phase)');
            }
        } else {
            carousel.cycle(); // Start cycling
            console.log('✅ Carousel initialized and cycling');
        }
    } else {
        console.error('❌ Carousel element #heroCarousel not found!');
    }

    console.log('🖼️ === END RENDER CAROUSEL ===');
}

/**
 * Render unified team updates section (joiners + celebrations)
 */
function renderTeamUpdates(joiners, celebrations) {
    const $container = $('#teamUpdatesContainer');
    const $section = $('#teamUpdates');
    $container.empty();

    // Store joiners for potential re-rendering
    window.joinersData = joiners || [];

    console.log('🎨 Rendering team updates:', joiners.length, 'joiners +', celebrations.length, 'celebrations');

    if (joiners.length === 0 && celebrations.length === 0) {
        $section.addClass('no-data');
        return;
    }

    $section.removeClass('no-data');

    const maxJoiners = Math.min(joiners.length, CONFIG.MAX_JOINERS);

    let cardsHtml = '';

    // Add NEW JOINERS banner and cards
    if (joiners.length > 0) {
        cardsHtml += `
            <div class="team-card-wrapper section-banner-card">
                <div class="section-banner">
                    <i class="bi bi-person-plus"></i>
                    <h3>New Joiners</h3>
                </div>
            </div>
        `;

        for (let i = 0; i < maxJoiners; i++) {
            const joiner = joiners[i];
            const isNew = isRecentDate(joiner.startDate, CONFIG.NEW_JOINER_DAYS);

            console.log(`  → Joiner ${i}: ${joiner.name}, imageUrl: ${joiner.imageUrl}`);

            // Fix Drive URLs for embedding
            const fixedImageUrl = joiner.imageUrl ? fixDriveImageUrl(joiner.imageUrl) : null;

            // Extract file ID for fallback attempts
            let fileId = null;
            if (joiner.imageUrl) {
                const match = joiner.imageUrl.match(/[?&/]([a-zA-Z0-9_-]{20,})/);
                if (match) fileId = match[1];
            }

            const imageHtml = fixedImageUrl
                ? `<img src="${escapeHtml(fixedImageUrl)}" class="team-card-image" alt="${escapeHtml(joiner.name)}" data-file-id="${fileId || ''}"
                        onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { this.parentElement.innerHTML='<div class=\\'team-card-image-placeholder joiner\\'><i class=\\'bi bi-person-fill\\'></i></div>'; }">`
                : `<div class="team-card-image-placeholder joiner"><i class="bi bi-person-fill"></i></div>`;

            cardsHtml += `
                <div class="team-card-wrapper">
                    <div class="team-card joiner position-relative h-100">
                        ${isNew ? '<span class="badge-new">New Joinee</span>' : ''}
                        ${imageHtml}
                        <div class="team-card-content">
                            <h4 class="team-card-name">${escapeHtml(joiner.name) || 'New Team Member'}</h4>
                            <p class="team-card-position">${escapeHtml(joiner.position) || 'Position TBD'}</p>
                            ${joiner.department ? `<span class="team-card-department">${escapeHtml(joiner.department)}</span>` : ''}
                            ${joiner.startDate || joiner.description ? `
                            <div class="team-card-meta">
                                ${joiner.startDate ? `
                                <div class="team-card-date">
                                    <i class="bi bi-calendar3"></i>
                                    Joined: ${formatDate(joiner.startDate)}
                                </div>
                                ` : ''}
                                ${joiner.description ? `
                                <p class="team-card-description">${escapeHtml(joiner.description)}</p>
                                ` : ''}
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Add CELEBRATIONS banner and cards
    if (celebrations.length > 0) {
        cardsHtml += `
            <div class="team-card-wrapper section-banner-card">
                <div class="section-banner">
                    <i class="bi bi-cake-fill"></i>
                    <h3>Birthdays & Celebrations</h3>
                </div>
            </div>
        `;

        celebrations.forEach(celebration => {
            const isBirthday = celebration.type === 'birthday';
            const typeClass = isBirthday ? 'birthday' : 'anniversary';
            const icon = isBirthday ? 'bi-cake-fill' : 'bi-award-fill';
            const yearText = celebration.years === 1 ? 'Year' : 'Years';
            const badgeText = isBirthday ? '🎂 Birthday' : `🎉 ${celebration.years} ${yearText}`;

            // Fix Drive URLs for embedding
            const fixedImageUrl = celebration.imageUrl ? fixDriveImageUrl(celebration.imageUrl) : null;

            // Extract file ID for fallback attempts
            let fileId = null;
            if (celebration.imageUrl) {
                const match = celebration.imageUrl.match(/[?&/]([a-zA-Z0-9_-]{20,})/);
                if (match) fileId = match[1];
            }

            const imageHtml = fixedImageUrl
                ? `<img src="${escapeHtml(fixedImageUrl)}" class="team-card-image" alt="${escapeHtml(celebration.name)}" data-file-id="${fileId || ''}" data-type="${typeClass}"
                        onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { const icon = this.dataset.type === 'birthday' ? 'bi-cake-fill' : 'bi-award-fill'; this.parentElement.innerHTML = '<div class=\\'team-card-image-placeholder ' + this.dataset.type + '\\'><i class=\\'bi ' + icon + '\\'></i></div>'; }">`
                : `<div class="team-card-image-placeholder ${typeClass}"><i class="bi ${icon}"></i></div>`;

            const dateStr = formatShortDate(celebration.date);

            cardsHtml += `
                <div class="team-card-wrapper">
                    <div class="team-card ${typeClass} position-relative h-100">
                        <span class="celebration-badge-top ${typeClass}">${badgeText}</span>
                        ${imageHtml}
                        <div class="team-card-content">
                            <h4 class="team-card-name">${escapeHtml(celebration.name)}</h4>
                            ${celebration.department ? `<p class="team-card-department">${escapeHtml(celebration.department)}</p>` : ''}
                            <div class="team-card-date">
                                <i class="bi bi-calendar3"></i>
                                ${dateStr}
                            </div>
                            ${celebration.description ? `
                            <p class="team-card-description">${escapeHtml(celebration.description)}</p>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    // Duplicate content for smooth infinite scrolling
    $container.html(cardsHtml + cardsHtml);
}

function deduplicateItems(items, keyBuilder) {
    const seen = new Set();
    return items.filter(item => {
        const key = keyBuilder(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Render holidays section
 */
function renderHolidays(holidays) {
    const $container = $('#holidaysContainer');
    const $section = $('#holidays');
    $container.empty();
    const uniqueHolidays = deduplicateItems(holidays, holiday => {
        return `${holiday.id || ''}|${holiday.title || ''}|${holiday.date || ''}`;
    });

    // Keep TV mode in sync with home mode: respect SHOW_ONLY_FUTURE_HOLIDAYS only
    let filteredHolidays = uniqueHolidays;
    if (CONFIG.SHOW_ONLY_FUTURE_HOLIDAYS) {
        const today = new Date();
        today.setHours(0,0,0,0);
        filteredHolidays = uniqueHolidays.filter(h => {
            if (!h.date) return false;
            const holidayDate = new Date(h.date);
            return holidayDate >= today;
        });
    }

    // Sort by date
    filteredHolidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredHolidays.length === 0) {
        $section.addClass('no-data');
        return;
    }

    $section.removeClass('no-data');

    // Limit to max holidays configuration
    const maxHolidays = Math.min(filteredHolidays.length, CONFIG.MAX_HOLIDAYS || filteredHolidays.length);

    let cardsHtml = '';
    for (let i = 0; i < maxHolidays; i++) {
        const holiday = filteredHolidays[i];
        const dateInfo = getDateParts(holiday.date);

        cardsHtml += `
            <div class="holiday-card fade-in-up" style="animation-delay: ${i * 0.05}s">
                <div class="holiday-date-box">
                    <div class="holiday-day">${dateInfo.day}</div>
                    <div class="holiday-month">${dateInfo.month}</div>
                </div>
                <div class="holiday-content">
                    <h5 class="holiday-title">${escapeHtml(holiday.title)}</h5>
                    ${holiday.description ? `<p class="holiday-description">${escapeHtml(holiday.description)}</p>` : ''}
                </div>
                ${holiday.imageUrl ? `
                <img src="${escapeHtml(holiday.imageUrl)}" class="holiday-image" alt="${escapeHtml(holiday.title)}"
                     onerror="this.style.display='none'">
                ` : ''}
            </div>
        `;
    }

    $container.html(cardsHtml);

    // Static display: allow manual scroll if overflow; no auto-scroll/duplication
    const containerEl = $container.get(0);
    if (containerEl && containerEl.holidayScrollInterval) {
        clearInterval(containerEl.holidayScrollInterval);
        containerEl.holidayScrollInterval = null;
    }
    $container.css({ 'overflow-y': 'auto', 'max-height': tvModeEnabled ? '70vh' : 'auto' });
}

/**
 * Render announcements section
 */
function renderAnnouncements(announcements) {
    const $container = $('#announcementsContainer');
    const $section = $('#announcements');
    $container.empty();

    const uniqueAnnouncements = deduplicateItems(announcements, announcement => {
        return `${announcement.id || ''}|${announcement.title || ''}|${announcement.description || ''}`;
    });

    if (uniqueAnnouncements.length === 0) {
        $section.addClass('no-data');
        return;
    }

    $section.removeClass('no-data');

    const maxAnnouncements = Math.min(uniqueAnnouncements.length, CONFIG.MAX_ANNOUNCEMENTS);
    let cardsHtml = '';

    for (let i = 0; i < maxAnnouncements; i++) {
        const announcement = uniqueAnnouncements[i];

        // Fix Drive URLs for embedding
        const fixedImageUrl = announcement.imageUrl ? fixDriveImageUrl(announcement.imageUrl) : null;

        // Extract file ID for fallback attempts
        let fileId = null;
        if (announcement.imageUrl) {
            const match = announcement.imageUrl.match(/[?&/]([a-zA-Z0-9_-]{20,})/);
            if (match) fileId = match[1];
        }

        cardsHtml += `
            <div class="announcement-card">
                ${fixedImageUrl ? `
                <img src="${escapeHtml(fixedImageUrl)}" class="announcement-image" 
                     alt="${escapeHtml(announcement.title)}" data-file-id="${fileId || ''}"
                     onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { this.style.display='none'; }">
                ` : ''}
                <div class="announcement-header">
                    <div class="announcement-icon">
                        <i class="bi bi-megaphone-fill"></i>
                    </div>
                    <h5 class="announcement-title">${escapeHtml(announcement.title)}</h5>
                </div>
                ${announcement.description ? `
                <p class="announcement-description">${escapeHtml(announcement.description)}</p>
                ` : ''}
            </div>
        `;
    }

    $container.html(cardsHtml);

    // Static display only; no auto-scroll or duplication.
    $container.css({ 'overflow-y': 'visible', 'max-height': 'none' });
}

/**
 * Update statistics in the stats bar
 */
function updateStats(joiners, holidays, announcements, birthdays) {
    animateNumber('#joinerCount', joiners);
    animateNumber('#holidayCount', holidays);
    animateNumber('#announcementCount', announcements);
    if (birthdays !== undefined) {
        animateNumber('#birthdayCount', birthdays);
    }
}

/**
 * Process celebrations data (birthdays & anniversaries)
 */
function processCelebrationsData(data) {
    const celebrations = data
        .map(row => ({
            id: row.ID,
            type: (row.Type || '').toLowerCase(),
            name: row.Name,
            date: row.Date,
            years: row.Years,
            department: row.Department,
            imageUrl: row.ImageURL
        }))
        .filter(item => item.type !== 'birthday' || isCurrentMonthDate(item.date));

    // Sort by date
    celebrations.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });

    renderCelebrations(celebrations);

    // Update birthday count in stats
    const birthdayCount = celebrations.filter(c => c.type === 'birthday').length;
    animateNumber('#birthdayCount', birthdayCount);
}

/**
 * Render celebrations (birthdays & anniversaries)
 */
function renderCelebrations(celebrations) {
    const $container = $('#celebrationsContainer');
    const $section = $('#celebrations');
    $container.empty();

    console.log('🎨 Rendering celebrations:', celebrations.length, 'Sample:', celebrations[0]);

    if (celebrations.length === 0) {
        $section.addClass('no-data');
        return;
    }

    $section.removeClass('no-data');

    let cardsHtml = '';

    celebrations.forEach(celebration => {
        const isBirthday = celebration.type === 'birthday';
        const typeClass = isBirthday ? 'birthday' : 'anniversary';
        const icon = isBirthday ? 'bi-cake-fill' : 'bi-award-fill';
        const yearText = celebration.years === 1 ? 'Year' : 'Years';
        const badgeText = isBirthday ? 'Birthday' : `${celebration.years} ${yearText}`;

            // Debug: log image URL from data and the fixed URL used for rendering
            console.log('🎯 Celebration image source:', celebration.imageUrl);
            // Fix Drive URLs for embedding
            const fixedImageUrl = celebration.imageUrl ? fixDriveImageUrl(celebration.imageUrl) : null;
            console.log('🎯 Celebration fixedImageUrl:', fixedImageUrl);

        // Extract file ID for fallback attempts
        let fileId = null;
        if (celebration.imageUrl) {
            const match = celebration.imageUrl.match(/[?&/]([a-zA-Z0-9_-]{20,})/);
            if (match) fileId = match[1];
        }

        const imageHtml = fixedImageUrl
            ? `<img src="${escapeHtml(fixedImageUrl)}" class="cel-list-avatar" alt="${escapeHtml(celebration.name)}" data-file-id="${fileId || ''}" data-type="${typeClass}"
                    onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { const icon = this.dataset.type === 'birthday' ? 'bi-cake-fill' : 'bi-award-fill'; this.parentElement.innerHTML = '<div class=\\'cel-list-avatar-placeholder ' + this.dataset.type + '\\'><i class=\\'bi ' + icon + '\\'></i></div>'; }">`
            : `<div class="cel-list-avatar-placeholder ${typeClass}"><i class="bi ${icon}"></i></div>`;

        const dateStr = formatShortDate(celebration.date);

        cardsHtml += `
            <div class="cel-list-card ${typeClass}">
                <div class="cel-list-avatar-wrap">
                    ${imageHtml}
                </div>
                <div class="cel-list-info">
                    <h4 class="cel-list-name">${escapeHtml(celebration.name)}</h4>
                    ${celebration.department ? `<p class="cel-list-dept">${escapeHtml(celebration.department)}</p>` : ''}
                    ${celebration.description ? `<p class="cel-list-desc">${escapeHtml(celebration.description)}</p>` : ''}
                </div>
                <div class="cel-list-meta">
                    <span class="cel-list-badge ${typeClass}">${badgeText}</span>
                    <span class="cel-list-date">${dateStr}</span>
                </div>
            </div>
        `;
    });

    $container.html(cardsHtml);
}

/**
 * Render breaking news ticker
 */
function renderBreakingNews(news) {
    const $bar = $('#breakingNewsBar');
    const $content = $('#breakingTickerContent');
    const activeNews = news.filter(isBreakingNewsActiveToday);

    if (activeNews.length === 0) {
        $bar.hide();
        return;
    }

    let tickerHtml = '';
    activeNews.forEach(item => {
        tickerHtml += `<span>${escapeHtml(item.title)}</span>`;
    });
    // Duplicate content for seamless infinite ticker scroll
    tickerHtml = tickerHtml + tickerHtml;

    $content.html(tickerHtml);

    // In TV mode, only show during carousel phase
    if (tvModeEnabled) {
        if ($('.carousel-section').is(':visible')) {
            $bar.show();
        }
        // If content phase, stay hidden
    } else {
        $bar.show();
    }

    // Close button handler
    $('#closeBreakingNews').off('click').on('click', function () {
        $bar.slideUp();
    });
}

/**
 * Render event countdown timer
 */
let countdownInterval = null;

function renderEventCountdown(events) {
    const $banner = $('#countdownBanner');

    // Find next upcoming event
    const now = new Date();
    const upcomingEvents = events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate > now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcomingEvents.length === 0) {
        $('#countdownTitle').text('');
        $banner.hide().data('has-event', false);
        return;
    }

    const nextEvent = upcomingEvents[0];
    const eventDate = new Date(nextEvent.date);

    $('#countdownTitle').text(nextEvent.title);
    $banner.data('has-event', true);

    // In TV mode, only show during carousel phase (carousel section visible)
    if (tvModeEnabled) {
        if ($('.carousel-section').is(':visible')) {
            $banner.show();
        }
        // If content phase, stay hidden — switchToContentSections already hid it
    } else {
        $banner.show();
    }

    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    // Update countdown every second
    function updateCountdown() {
        const now = new Date();
        const diff = eventDate - now;

        if (diff <= 0) {
            $banner.hide().data('has-event', false);
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        $('#countdownDays').text(String(days).padStart(2, '0'));
        $('#countdownHours').text(String(hours).padStart(2, '0'));
        $('#countdownMinutes').text(String(minutes).padStart(2, '0'));
        $('#countdownSeconds').text(String(seconds).padStart(2, '0'));
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Animate number counting
 */
function animateNumber(selector, target) {
    const $element = $(selector);
    const start = parseInt($element.text()) || 0;
    const duration = 500;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * easeOutQuad(progress));
        $element.text(current);

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

/**
 * Easing function for animations
 */
function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * Update last updated timestamp
 */
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    $('#lastUpdated').text(timeString);
}

/**
 * Show error message
 */
function showError(message) {
    $('#errorMessage').text(message);
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();

    const containers = ['#joinersContainer', '#holidaysContainer', '#announcementsContainer'];

    containers.forEach(selector => {
        $(selector).html(`
            <div class="error-state">
                <div class="error-state-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <h5>Error Loading Data</h5>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="location.reload()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Retry
                </button>
            </div>
        `);
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

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
 * Fix Google Drive URLs for embedding
 * Converts various Drive URL formats to lh3.googleusercontent.com CDN
 */
function fixDriveImageUrl(url) {
    if (!url) return url;

    // Extract file ID from various Google Drive URL formats
    let fileId = null;

    // Format 1: https://drive.google.com/file/d/FILE_ID/view
    let match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
        fileId = match[1];
    }

    // Format 2: https://drive.google.com/uc?export=view&id=FILE_ID
    if (!fileId) {
        match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) {
            fileId = match[1];
        }
    }

    // Format 3: https://lh3.googleusercontent.com/d/FILE_ID (already correct)
    if (!fileId) {
        match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
            fileId = match[1];
        }
    }

    // If we found a file ID, use googleusercontent CDN (best for embedding)
    if (fileId) {
        console.log(`🔄 Converting Drive URL to googleusercontent CDN, File ID: ${fileId}`);
        return `https://lh3.googleusercontent.com/d/${fileId}`;
    }

    // Return original URL if no Drive pattern matched
    return url;
}

/**
 * Handle Drive image load errors with fallback attempts
 * Tries multiple Google Drive URL formats in sequence
 */
window.handleDriveImageError = function (img, fileId) {
    if (!img || !fileId) return;

    // Get current attempt number from data attribute
    const attempt = parseInt(img.getAttribute('data-attempt') || '0');

    // Array of different Drive URL formats to try (prioritize googleusercontent CDN)
    const formats = [
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://lh3.googleusercontent.com/d/${fileId}=w2000`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://drive.google.com/uc?export=download&id=${fileId}`
    ];

    // Try next format
    if (attempt < formats.length) {
        console.log(`🔄 Trying googleusercontent format ${attempt + 1}/${formats.length}:`, formats[attempt]);
        img.setAttribute('data-attempt', attempt + 1);
        img.src = formats[attempt];
    } else {
        // All formats failed - show placeholder
        console.error('❌ All googleusercontent/Drive URL formats failed for ID:', fileId);
        if (img.classList.contains('joiner-image')) {
            img.parentElement.innerHTML = '<div class="joiner-image-placeholder"><i class="bi bi-person-fill"></i></div>';
        } else if (img.classList.contains('celebration-avatar')) {
            const typeClass = img.parentElement.classList.contains('birthday') ? 'birthday' : 'anniversary';
            const icon = typeClass === 'birthday' ? 'bi-cake-fill' : 'bi-award-fill';
            img.parentElement.innerHTML = `<div class="celebration-avatar-placeholder ${typeClass}"><i class="bi ${icon}"></i></div>`;
        } else {
            img.style.display = 'none';
        }
    }
};

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format short date (e.g., "Feb 20")
 */
function formatShortDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get date parts for display
 */
function getDateParts(dateString) {
    if (!dateString) {
        return { day: '--', month: '---' };
    }

    const date = new Date(dateString);
    if (!date || isNaN(date.getTime())) {
        return { day: '--', month: '---' };
    }

    return {
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
    };
}

/**
 * Check if date is recent (within specified days)
 */
function isRecentDate(dateString, days) {
    if (!dateString) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const today = new Date();
    const diffTime = today - date;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= days;
}

/**
 * Check whether a date is in the current month and year.
 */
function isCurrentMonthDate(dateString) {
    if (!dateString) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

/**
 * Check whether breaking news should be visible today.
 * If only start date exists, show only on that day.
 * If end date exists, show from start date through end date (inclusive).
 */
function isBreakingNewsActiveToday(item) {
    if (!item) return false;

    const today = new Date();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const startDay = toDayDate(item.date);
    const endDay = toDayDate(item.endDate);

    if (startDay && endDay) {
        return todayDay >= startDay && todayDay <= endDay;
    }

    if (startDay) {
        return todayDay.getTime() === startDay.getTime();
    }

    if (endDay) {
        return todayDay <= endDay;
    }

    return false;
}

function toDayDate(dateString) {
    if (!dateString) return null;
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

// ===================================
// TV / KIOSK MODE FUNCTIONS
// ===================================

let tvModeEnabled = false;
let tvRefreshInterval = null;
let tvClockInterval = null;
let tvRefreshCountdown = 60; // seconds
let carouselCompletedOnce = false;
let carouselCycleCount = 0;
let totalCarouselSlides = 0;
let currentContentSection = 0; // Track which content section to show (0=announcements, 1=team updates, 2=holidays)
let contentRotationTimer = null;
let tvScrollAnimationId = null;
let tvSlideCounter = 0; // Counts slides shown in current carousel phase
let cachedTVSections = []; // Cache sections list for the current rotation cycle (fixed at start)

/**
 * Initialize TV Mode functionality
 */
function initTVMode() {
    // TV Mode button click
    $('#tvModeBtn').on('click', function (e) {
        e.preventDefault();
        enterTVMode();
    });

    // Exit TV Mode button
    $('#tvExitBtn').on('click', function () {
        exitTVMode();
    });

    // ESC key to exit TV mode
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && tvModeEnabled) {
            exitTVMode();
        }
        // F11 or 'T' key to toggle TV mode
        if ((e.key === 't' || e.key === 'T') && e.ctrlKey) {
            e.preventDefault();
            if (tvModeEnabled) {
                exitTVMode();
            } else {
                enterTVMode();
            }
        }
    });

    // Check URL parameter for TV mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tv') === '1' || urlParams.get('kiosk') === '1') {
        setTimeout(enterTVMode, 500);
    }
}

/**
 * Enter TV/Kiosk Mode
 */
function enterTVMode() {
    tvModeEnabled = true;
    $('body').addClass('tv-mode');

    // Try to enter fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
            debugLog('Fullscreen not available:', err);
        });
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }

    // Start clock update
    updateTVClock();
    tvClockInterval = setInterval(updateTVClock, 1000);

    // Start auto-refresh countdown
    tvRefreshCountdown = 60;
    updateRefreshTimer();
    tvRefreshInterval = setInterval(function () {
        tvRefreshCountdown--;
        updateRefreshTimer();

        if (tvRefreshCountdown <= 0) {
            tvRefreshCountdown = 60;
            // Reload data from database
            loadAllDataFromDatabase();
        }
    }, 1000);

    // Scroll to top
    window.scrollTo(0, 0);

    // Reset carousel tracking variables
    carouselCompletedOnce = false;
    carouselCycleCount = 0;

    // Show carousel + stats; hide all content sections
    $('.carousel-section').show();
    $('.stats-bar').show();
    $('#teamUpdates').hide();
    $('#announcements').hide();
    $('#celebrations').hide();
    $('#holidays').hide();
    $('#positions').hide();
    $('#joiners').hide();

    // Only show the countdown banner if there is actually an upcoming event.
    // renderEventCountdown() hides it when no events exist; respect that here.
    if ($('#countdownBanner').data('has-event') === true) {
        $('#countdownBanner').show();
    } else {
        $('#countdownBanner').hide();
    }

    // Ensure carousel is cycling from slide 0
    const carouselEl = document.getElementById('heroCarousel');
    if (carouselEl) {
        const bsCarousel = bootstrap.Carousel.getInstance(carouselEl) || new bootstrap.Carousel(carouselEl, {
            interval: CONFIG.CAROUSEL_INTERVAL || 10000,
            ride: 'carousel',
            pause: false
        });
        bsCarousel.to(0);
        bsCarousel.cycle();
    }

    // Use slide event counter to know when all slides have been shown once
    const totalSlides = $('#heroCarousel .carousel-item').length || 1;
    tvSlideCounter = 0;

    // Remove any previous listener, then add fresh one
    $('#heroCarousel').off('slid.bs.carousel.tvmode').on('slid.bs.carousel.tvmode', function () {
        if (!tvModeEnabled) return;
        tvSlideCounter++;
        console.log(`TV Mode: Slide ${tvSlideCounter}/${totalSlides}`);
        if (tvSlideCounter >= totalSlides) {
            // All slides shown — switch to content sections
            $('#heroCarousel').off('slid.bs.carousel.tvmode');
            console.log('TV Mode: Carousel complete — switching to content sections');
            switchToContentSections();
        }
    });

    console.log(`TV Mode: ${totalSlides} slides, waiting for slide events`);

    // After all carousel images shown once, switch to content sections
    // (handled by slid.bs.carousel.tvmode event listener — no timer needed)

    debugLog('TV Mode enabled - showing carousel with stats and upcoming event');
}

/**
 * Switch from carousel to content sections in TV mode
 */
function switchToContentSections() {
    debugLog('Starting content section rotation');
    
    // Ensure positions data is loaded before rotation starts
    console.log('📋 Current positionsData:', positionsData, 'items');
    if (positionsData.length === 0) {
        console.log('⚠️ Positions data empty - reloading from API...');
        loadOpenPositions();
    }
    currentContentSection = 0;
    // Reset rotation guard
    contentRotationStarted = false;

    // Remove slide event listener so it doesn't fire during content phase
    $('#heroCarousel').off('slid.bs.carousel.tvmode');

    // Pause the Bootstrap carousel
    const carouselEl = document.getElementById('heroCarousel');
    if (carouselEl) {
        const bsCarousel = bootstrap.Carousel.getInstance(carouselEl);
        if (bsCarousel) bsCarousel.pause();
    }

    // Hide carousel phase elements.
    // Use a counter so showNextContentSection fires exactly once after all fades complete.
    // NOTE: we cannot rely on a single element's fadeOut callback because some elements
    // (e.g. #countdownBanner) may already be hidden, causing jQuery to never fire the callback.
    let fadesPending = 0;

    function onFadeDone() {
        fadesPending--;
        if (fadesPending === 0) {
            waitForPositionsThenStart();
        }
    }

    const $carousel = $('.carousel-section');
    const $stats = $('.stats-bar');
    const $countdown = $('#countdownBanner');
    const $breakingNews = $('#breakingNewsBar');

    // Hide carousel, stats, countdown banner, and breaking news during content sections
    if ($carousel.is(':visible')) { fadesPending++; $carousel.fadeOut(400, onFadeDone); }
    if ($stats.is(':visible')) { fadesPending++; $stats.fadeOut(400, onFadeDone); }
    if ($countdown.is(':visible')) { fadesPending++; $countdown.fadeOut(400, onFadeDone); }
    if ($breakingNews.is(':visible')) { fadesPending++; $breakingNews.fadeOut(400, onFadeDone); }

    // If nothing was visible, just start immediately
    if (fadesPending === 0) {
        waitForPositionsThenStart();
    }
}


/**
 * Wait for positions to be loaded (if a load is in progress or was triggered),
 * but don't wait indefinitely — use a short timeout fallback. Ensure the
 * content rotation starts only once.
 */
function waitForPositionsThenStart() {
    if (contentRotationStarted) return;
    contentRotationStarted = true;

    // If positions already available, start immediately
    if (positionsData && positionsData.length > 0) {
        buildAndStartContentRotation();
        return;
    }

    // If a request is in progress, wait for it to complete or for a short timeout
    if (positionsLoadRequest) {
        // Start a timeout fallback in case request hangs
        const fallback = setTimeout(function () {
            console.warn('TV Mode: positions load timeout — starting rotation without waiting');
            buildAndStartContentRotation();
        }, 2500);

        positionsLoadRequest.always(function () {
            clearTimeout(fallback);
            buildAndStartContentRotation();
        });
        return;
    }

    // No request in progress and no positions data — start anyway
    buildAndStartContentRotation();
}

/**
 * Build the cached sections list and start content rotation.
 * This ensures the sections list is fixed for the entire rotation cycle.
 */
function buildAndStartContentRotation() {
    cachedTVSections = getTVContentSections();
    // De-duplicate by id just in case something pushed positions twice
    const seen = new Set();
    cachedTVSections = cachedTVSections.filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
    });
    console.log('🔐 === CACHED SECTIONS FOR THIS CYCLE ===');
    console.log('📋 Sections in order: [' + cachedTVSections.map((s, i) => `${i}: ${s.label}`).join(', ') + ']');
    console.log('Total sections to show: ' + cachedTVSections.length);
    showNextContentSection();
}

/**
 * Build list of content sections that actually have data.
 * Order: Announcements → Holidays → Team Updates → Open Positions (last)
 */
function getTVContentSections() {
    console.log('🎯 getTVContentSections() called, positionsData.length:', positionsData.length);
    
    const candidates = [
        { id: '#announcements', label: 'Announcements' },
        { id: '#holidays', label: 'Holidays' },
        { id: '#teamUpdates', label: 'Team Updates' }
    ];
    console.log("Candidates before adding positions:", candidates);
    // Add positions LAST in rotation if data is available
    if (positionsData && positionsData.length > 0) {
        candidates.push({ id: '#positions', label: 'Open Positions' });
        console.log('✅ Positions ADDED to rotation (LAST) with', positionsData.length, 'items');
    } else {
        console.log('❌ Positions NOT added - positionsData:', positionsData);
    }
    
    console.log('📊 Total candidates before filter:', candidates.length);
    
    // Only filter out sections that have no-data class AND exist in DOM
    const result = candidates.filter(s => {
        const $el = $(s.id);
        const exists = $el.length > 0;
        console.log("Candidates el:", $el);
        const hasNoData = exists && $el.hasClass('no-data');
        console.log(`  - ${s.label}: exists=${exists}, hasNoData=${hasNoData}, include=${!hasNoData}`);
        return !hasNoData;
    });
    
    console.log('📊 Final sections for rotation: [' + result.map(s => s.label).join(' → ') + ']');
    return result;
}



/**
 * Show next content section in TV mode rotation.
 * Uses CACHED sections list so rotation doesn't change mid-cycle.
 * When all sections are done, restarts the carousel cycle.
 */
function showNextContentSection() {
    if (!tvModeEnabled) return;

    if (contentRotationTimer) {
        clearTimeout(contentRotationTimer);
        contentRotationTimer = null;
    }
    stopTVAutoScroll();

    // Use CACHED sections list (fixed at start of rotation, not recalculated)
    const sections = cachedTVSections;
    console.log(`🔄 showNextContentSection() - currentContentSection=${currentContentSection}, cachedSections=${sections.length}, list=[${sections.map(s => s.label).join(', ')}]`);

    // If nothing has data, or we've gone through all sections — back to carousel
    if (sections.length === 0 || currentContentSection >= sections.length) {
        console.log('✅ TV Mode: All content sections shown (reached end of cached list) — restarting carousel');
        restartCarouselCycle();
        return;
    }

    const section = sections[currentContentSection];
    console.log(`📺 TV Mode: NOW DISPLAYING "${section.label}" (section ${currentContentSection + 1}/${sections.length})`);

    // Hide every content section completely (including positions with its heading)
    const $allSections = $('#announcements, #celebrations, #teamUpdates, #holidays, #positions, #joiners');
    $allSections.hide().addClass('tv-hidden-section');
    $('#positions').removeClass('tv-position-visible');
    // Remove any previous scroll wrappers
    $('.tv-scroll-viewport').remove();

    let $section = $(section.id);
    
    // For positions section, verify it's already rendered and has content
    if (section.id === '#positions') {
        console.log('🎬 About to display positions section (already rendered)');
        console.log('✅ Positions section selected:', $section.length > 0);
        // If somehow no cards exist, skip this slot to avoid blank screen
        if ($section.find('.position-card-wrapper').length === 0) {
            console.warn('⚠️ Positions section has no cards — skipping');
            currentContentSection++;
            showNextContentSection();
            return;
        }
    }
    
    if (section.id === '#positions') {
        $section.removeClass('tv-hidden-section').addClass('tv-position-visible').show();
    } else {
        $section.removeClass('tv-hidden-section').show();
    }
    
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Standardized timing for ALL sections (18 seconds minimum for all content types)
    let sectionDuration = 10000; // 18 seconds default for consistent display

    // For horizontal scrolling sections (team updates, open positions), add time based on content
    if (section.id === '#teamUpdates' || section.id === '#positions') {
        const trackSelector = section.id === '#teamUpdates' ? '.team-updates-scroll-track' : '.positions-scroll-track';
        const $track = $section.find(trackSelector);
        if ($track.length) {
            const trackWidth = $track[0].scrollWidth;
            const originalWidth = trackWidth / 2; // Content is duplicated
            const pixelsPerSecond = section.id === '#teamUpdates' ? 100 : 100;
            const animDurationSecs = originalWidth / pixelsPerSecond;
            $track.css('animation-duration', animDurationSecs + 's');
            
            // Use animation duration but ensure minimum 18 seconds for viewing
            const extraTime = Math.max(2, animDurationSecs) * 1000;
            sectionDuration = Math.max(18000, extraTime);

            const sectionName = section.id === '#teamUpdates' ? 'Team updates' : 'Open positions';
            console.log(`TV Mode: ${sectionName} - width: ${originalWidth}px, speed: ${pixelsPerSecond}px/s, anim: ${animDurationSecs.toFixed(1)}s, display: ${(sectionDuration/1000).toFixed(1)}s`);
        }
    }

    console.log(`⏱️ Section display time: ${(sectionDuration/1000).toFixed(1)} seconds`);

    // After a brief paint delay, set up horizontal scroll where needed.
    setTimeout(function () {
        if (section.id === '#teamUpdates' || section.id === '#positions') {
            startTVHorizontalScroll(section.id, sectionDuration - 1000);
        } else {
            startTVInfiniteScroll(section.id, sectionDuration - 1000);
        }
    }, 200);

    contentRotationTimer = setTimeout(function () {
        console.log(`⏰ Section "${section.label}" display time (${(sectionDuration/1000).toFixed(1)}s) complete. Moving to next...`);
        stopTVAutoScroll();
        currentContentSection++;
        showNextContentSection();
    }, sectionDuration);
}

/**
 * Start horizontal scroll for sections with CSS animations (team updates, open positions)
 */
function startTVHorizontalScroll(sectionId, duration) {
    const $section = $(sectionId);
    if (!$section.length) return;

    // These sections handle their own CSS-based horizontal scroll
    // Just ensure the scroll track has animation running
    const trackSelector = sectionId === '#teamUpdates' ? '.team-updates-scroll-track' : '.positions-scroll-track';
    const $track = $section.find(trackSelector);
    
    if ($track.length) {
        // Start animation
        $track.css('animation-play-state', 'running');
        console.log(`TV Mode: Started horizontal scroll for ${sectionId}`);
    }
}

/**
 * Create an infinite upward-scrolling effect for a section's content.
 * Duplicates the content, wraps it in a scrolling container, and uses
 * CSS transform animation to scroll up continuously.
 */
function  startTVInfiniteScroll(sectionId, duration) {
    const $section = $(sectionId);
    if (!$section.length) return;

    // Team updates/positions have their own CSS scroll; announcements and holidays are intentionally static.
    if (sectionId === '#teamUpdates' || sectionId === '#positions' || sectionId === '#announcements' || sectionId === '#holidays') return;

    // Find the inner content container
    const $inner = $section.find('[id$="Container"]').first();
    if (!$inner.length) return;

    const contentHeight = $inner[0].scrollHeight;
    const viewportHeight = window.innerHeight;

    // If content fits in viewport, no need to scroll
    if (contentHeight <= viewportHeight * 0.6) return;

    // Save originals before modifying
    const $wrapper = $inner.parent();
    const $scrollArea = $wrapper.is('section') ? $inner : $wrapper;

    $section.data('tv-original-section-style', $section.attr('style') || '');
    $scrollArea.data('tv-original-wrapper-style', $scrollArea.attr('style') || '');

    // Make section a flex column so heading stays fixed at top
    $section.css({
        'display': 'flex',
        'flex-direction': 'column',
        'height': (viewportHeight - 80) + 'px',
        'overflow': 'hidden'
    });
    $section.addClass('tv-section-scroll-active');

    // Wrapper fills remaining space and clips the scrolling content
    $scrollArea.css({
        'flex': '1',
        'overflow': 'hidden',
        'min-height': '0'
    });

    // Save original HTML for restoration later
    const originalHtml = $inner.html();
    $inner.data('tv-original-html', originalHtml);

    // Defer creation and measurement to next frame to ensure layout is stable
    window.requestAnimationFrame(function () {
        // Create a scrolling track inside the container so the container
        // stays fixed (with overflow: hidden) and only the track moves.
        const $track = $('<div class="tv-scroll-track"></div>');
        $track.html(originalHtml + originalHtml); // duplicate for seamless loop
        $inner.empty().append($track);

        // Recompute height after DOM update
        const measuredHeight = $track[0].scrollHeight / 2; // one copy height

        // Calculate scroll speed: make it content-size aware so long lists
        // scroll more slowly and are fully visible. Use pixels/sec heuristic.
        const originalHeight = measuredHeight;
        const pixelsPerSecond = 30; // slower readable vertical speed
        // duration param is a baseline (in ms). Compute seconds required by content.
        const baselineSecs = Math.max(1, duration / 1000);
        const neededSecs = Math.max(3, originalHeight / pixelsPerSecond);
        const scrollDurationSecs = Math.max(baselineSecs, Math.min(neededSecs, 240));

        // Debug logging to help diagnose second-cycle issues
        console.log(`TV Mode: startTVInfiniteScroll(${sectionId}) contentHeight=${originalHeight}px, baseline=${baselineSecs}s, needed=${neededSecs}s, applied=${scrollDurationSecs}s`);

        // Apply CSS animation to the inner track only
        $track.css({
            'animation': `tvInfiniteScrollUp ${scrollDurationSecs}s linear infinite`,
            'will-change': 'transform'
        });

        $inner.addClass('tv-infinite-scrolling');
    });
}

/**
 * Stop any running TV auto-scroll animation and restore content
 */
function stopTVAutoScroll() {
    if (tvScrollAnimationId) {
        cancelAnimationFrame(tvScrollAnimationId);
        tvScrollAnimationId = null;
    }

    // Restore any infinite-scrolling containers
    $('.tv-infinite-scrolling').each(function () {
        const $el = $(this);
        const original = $el.data('tv-original-html');
        if (original) {
            // Remove the track wrapper and restore original content
            $el.find('.tv-scroll-track').remove();
            $el.html(original);
        }
        $el.removeClass('tv-infinite-scrolling');

        // Restore wrapper overflow/height
        const $wrapper = $el.parent();
        const $scrollArea = $wrapper.is('section') ? $el : $wrapper;
        const origStyle = $scrollArea.data('tv-original-wrapper-style');
        if (origStyle !== undefined) {
            if (origStyle) {
                $scrollArea.attr('style', origStyle);
            } else {
                $scrollArea.removeAttr('style');
            }
            $scrollArea.removeData('tv-original-wrapper-style');
        }
    });

    // Restore sections that were turned into flex columns
    $('.tv-section-scroll-active').each(function () {
        const $sec = $(this);
        const origStyle = $sec.data('tv-original-section-style');
        if (origStyle !== undefined) {
            if (origStyle) {
                $sec.attr('style', origStyle);
            } else {
                $sec.removeAttr('style');
            }
            $sec.removeData('tv-original-section-style');
        }
        $sec.removeClass('tv-section-scroll-active');
    });

    // Remove any scroll viewports
    $('.tv-scroll-viewport').remove();
}




/**
 * Restart the carousel cycle in TV mode
 */
function restartCarouselCycle() {
    console.log('🔁 === RESTARTING CAROUSEL CYCLE ===');
    console.log('State before reset: currentContentSection=' + currentContentSection + ', tvModeEnabled=' + tvModeEnabled);
    debugLog('Restarting carousel cycle');

    if (contentRotationTimer) {
        clearTimeout(contentRotationTimer);
        contentRotationTimer = null;
    }
    stopTVAutoScroll();

    // Instantly hide content sections (no fadeOut race condition) and force-hide positions even with tv-mode CSS
    $('#announcements, #celebrations, #teamUpdates, #holidays, #positions, #joiners')
        .hide()
        .addClass('tv-hidden-section');
    currentContentSection = 0;
    contentRotationStarted = false;
    cachedTVSections = []; // Clear cache for next cycle
    console.log('State after reset: currentContentSection=' + currentContentSection + ', contentRotationStarted=' + contentRotationStarted + ', cachedTVSections=[]');

    // Show carousel + stats bar
    $('.carousel-section').fadeIn(500);
    $('.stats-bar').fadeIn(500);

    // Only restore countdown banner and breaking news if there is an actual upcoming event
    if ($('#countdownBanner').data('has-event') === true) {
        $('#countdownBanner').data('tv-hidden', false).removeClass('tv-mode-hidden').fadeIn(500);
    }
    if ($('#breakingTickerContent').text().trim() !== '') {
        $('#breakingNewsBar').data('tv-hidden', false).removeClass('tv-mode-hidden').fadeIn(500);
    }

    // Restart Bootstrap carousel from slide 0 and resume cycling
    const carouselElement = document.getElementById('heroCarousel');
    if (carouselElement) {
        // Dispose any old instance to get a clean start
        const oldInstance = bootstrap.Carousel.getInstance(carouselElement);
        if (oldInstance) {
            oldInstance.pause();
            oldInstance.dispose();
        }

        // Set the first slide as active manually before creating new instance
        $(carouselElement).find('.carousel-item').removeClass('active');
        $(carouselElement).find('.carousel-item').first().addClass('active');
        $(carouselElement).find('.carousel-indicators button').removeClass('active');
        $(carouselElement).find('.carousel-indicators button').first().addClass('active');

        // Create a fresh carousel instance and start cycling
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: CONFIG.CAROUSEL_INTERVAL || 10000,
            ride: 'carousel',
            pause: false
        });
        carousel.cycle();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Use slide event counter to switch after all slides shown once
    const totalSlides = $('#heroCarousel .carousel-item').length || 1;
    tvSlideCounter = 0;

    $('#heroCarousel').off('slid.bs.carousel.tvmode').on('slid.bs.carousel.tvmode', function () {
        if (!tvModeEnabled) return;
        tvSlideCounter++;
        console.log(`TV Mode: Slide ${tvSlideCounter}/${totalSlides}`);
        if (tvSlideCounter >= totalSlides) {
            $('#heroCarousel').off('slid.bs.carousel.tvmode');
            console.log('TV Mode: Carousel cycle complete — switching to content sections');
            switchToContentSections();
        }
    });

    console.log(`TV Mode: Carousel restarted — ${totalSlides} slides, waiting for slide events`);
}

/**
 * Exit TV/Kiosk Mode
 */
function exitTVMode() {
    tvModeEnabled = false;
    $('body').removeClass('tv-mode');

    // Exit fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
            debugLog('Exit fullscreen error:', err);
        });
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }

    // Clear intervals and timers
    if (tvClockInterval) {
        clearInterval(tvClockInterval);
        tvClockInterval = null;
    }
    if (tvRefreshInterval) {
        clearInterval(tvRefreshInterval);
        tvRefreshInterval = null;
    }
    if (contentRotationTimer) {
        clearTimeout(contentRotationTimer);
        contentRotationTimer = null;
    }
    // Remove slide event listener
    $('#heroCarousel').off('slid.bs.carousel.tvmode');
    stopTVAutoScroll();

    // Show all primary sections; keep positions visible in home mode
    $('#teamUpdates, #announcements, #holidays, #positions, #joiners').removeClass('tv-hidden-section tv-position-visible');
    $('.carousel-section').css('display', '').show();
    $('#teamUpdates').css('display', '').show();
    $('#announcements').css('display', '').show();
    $('#holidays').css('display', '').show();
    $('#positions').css('display', '').show();
    $('#joiners').css('display', '').show();
    $('.stats-bar').css('display', '').show();

    // Restore countdown under stats in home mode only when a real upcoming event exists.
    if ($('#countdownBanner').data('has-event') === true) {
        $('#countdownBanner').css('display', '').show();
    } else {
        $('#countdownBanner').hide();
    }

    // Resume carousel cycling
    const carouselElement = document.getElementById('heroCarousel');
    if (carouselElement) {
        const carousel = bootstrap.Carousel.getInstance(carouselElement);
        if (carousel) carousel.cycle();
    }
    // Countdown banner visibility is controlled by its own logic
    contentRotationStarted = false;
    cachedTVSections = []; // Clear cache
    debugLog('TV Mode disabled');
}

/**
 * Update TV mode clock display
 */
function updateTVClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    $('#tvClock').text(timeStr);
}

/**
 * Update refresh countdown timer
 */
function updateRefreshTimer() {
    $('#tvRefreshTimer').text(tvRefreshCountdown);
}

// Listen for fullscreen change to sync TV mode state
document.addEventListener('fullscreenchange', function () {
    if (!document.fullscreenElement && tvModeEnabled) {
        // User exited fullscreen via browser controls
        exitTVMode();
    }
});

// Initialize TV mode when DOM is ready
$(document).ready(function () {
    initTVMode();
    initScrollToggles();
    initDarkMode();
});

/**
 * Initialize Dark Mode functionality
 */
function initDarkMode() {
    // Check for saved preference
    const savedMode = localStorage.getItem('hrPortalDarkMode');
    if (savedMode === 'true') {
        $('body').addClass('dark-mode');
        updateDarkModeIcon(true);
    }

    // Toggle dark mode on button click
    $('#darkModeBtn').on('click', function (e) {
        e.preventDefault();
        const isDark = $('body').toggleClass('dark-mode').hasClass('dark-mode');
        localStorage.setItem('hrPortalDarkMode', isDark);
        updateDarkModeIcon(isDark);
    });
}

/**
 * Update dark mode button icon
 */
function updateDarkModeIcon(isDark) {
    const $icon = $('#darkModeBtn i');
    if (isDark) {
        $icon.removeClass('bi-moon-fill').addClass('bi-sun-fill');
    } else {
        $icon.removeClass('bi-sun-fill').addClass('bi-moon-fill');
    }
}

/**
 * Global positions data storage
 */
let positionsData = [];
// Promise/jqXHR for positions load in progress
let positionsLoadRequest = null;
// Guard to ensure content rotation starts only once per switch
let contentRotationStarted = false;

/**
 * Load open positions - show all OPEN positions regardless of month
 * Data is stored globally and rendered for both Home and TV modes
 */
function loadOpenPositions() {
    // Fetch open positions (server already scopes to open)
    const url = `${CONFIG.API_BASE_URL}/public/positions`;

    console.log(`🔄 Fetching all open positions from ${url}...`);
    // Save jqXHR so callers can wait for completion
    positionsLoadRequest = $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    }).done(function (response) {
        const list = Array.isArray(response) ? response : (response.positions || response.data || []);
        console.log('✅ Raw positions from API:', list.length, 'total');

        // Keep only OPEN positions (case-insensitive)
        positionsData = list.filter(pos => {
            const status = (pos.status || '').toString().toUpperCase().trim();
            const isOpen = status === 'OPEN';
            const title = pos.requisitionTitle || pos.requisition_title;
            console.log(`  - "${title}" - status: ${pos.status}, included: ${isOpen}`);
            return isOpen;
        });

        console.log('📋 After filtering for OPEN status:', positionsData.length, 'positions ready for display');

        // Update home view immediately
        renderPositions(positionsData);

        // Update stats tile for open positions
        animateNumber('#positionCount', positionsData.length);
    }).fail(function (xhr, status, error) {
        console.error('❌ ERROR loading open positions:', error);
        console.error('HTTP Status:', xhr.status);
        console.error('Response:', xhr.responseText);
        positionsData = [];
        renderPositions([]);
        animateNumber('#positionCount', 0);
    }).always(function () {
        // Clear the stored request when complete
        positionsLoadRequest = null;

        // If TV mode is running and positions are available, ensure the positions
        // section is part of the cached rotation list so it can render.
        if (tvModeEnabled && positionsData && positionsData.length > 0) {
            const hasPositions = cachedTVSections.some(s => s.id === '#positions');
            if (!hasPositions) {
                cachedTVSections.push({ id: '#positions', label: 'Open Positions' });
                // Dedupe safety
                const seen = new Set();
                cachedTVSections = cachedTVSections.filter(s => {
                    if (seen.has(s.id)) return false;
                    seen.add(s.id);
                    return true;
                });
                console.log('✅ Added Open Positions to TV rotation (post-load). Total sections:', cachedTVSections.length);
            }
        }
    });

    return positionsLoadRequest;
}

/**
 * Render open positions section
 */
function renderPositions(positions) {
    const $container = $('#positionsContainer');
    const $section = $('#positions');
    $container.empty();

    if (!positions || positions.length === 0) {
        $section.addClass('no-data');
        return;
    }

    $section.removeClass('no-data');

    let cardsHtml = '';
    positions.forEach(position => {
        const postingDate = formatDate(position.postingDate);
        const statusClass = position.status === 'OPEN' ? 'open' : 
                           position.status === 'CLOSED' ? 'closed' : 'on-hold';
        const statusText = position.status === 'OPEN' ? 'Open' : 
                          position.status === 'CLOSED' ? 'Closed' : 'On Hold';

        cardsHtml += `
            <div class="position-card-wrapper">
                <div class="position-card-tv">
                    <div class="position-card-header-tv">
                        <h5 class="position-title-tv">${escapeHtml(position.requisitionTitle)}</h5>
                        ${position.requisitionId ? `<p class="requisition-id-tv"><strong>ID:</strong> ${escapeHtml(position.requisitionId)}</p>` : ''}
                    </div>
                    <div class="position-card-body-tv">
                        <div class="position-field-tv">
                            <span class="position-field-label-tv"><i class="bi bi-geo-alt"></i> Location</span>
                            <span class="location-badge-tv">${escapeHtml(position.location)}</span>
                        </div>
                        <div class="position-field-tv">
                            <span class="position-field-label-tv"><i class="bi bi-calendar-event"></i> Posted Date</span>
                            <span class="posting-date-tv">${postingDate}</span>
                        </div>
                        <div class="position-field-tv">
                            <span class="position-field-label-tv"><i class="bi bi-tag"></i> Status</span>
                            <span class="status-badge-tv ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <a class="learn-more-btn" href="https://ieee.taleo.net/careersection/1/jobsearch.ftl" target="_blank" rel="noopener">
                            Learn More
                        </a>
                        <button class="apply-button-tv" onclick="window.open('https://ieee.taleo.net/careersection/1/jobsearch.ftl', '_blank')">
                            <i class="bi bi-arrow-right"></i> Apply
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    // Duplicate for seamless horizontal scroll
    $container.html(cardsHtml + cardsHtml);
}

/**
 * Initialize scroll toggle buttons
 */
function initScrollToggles() {
    // Toggle team updates scroll
    $('#toggleTeamScroll').on('click', function () {
        const $track = $('.team-updates-scroll-track');
        const $icon = $(this).find('i');

        if ($track.css('animation-play-state') === 'paused') {
            $track.css('animation-play-state', 'running');
            $icon.removeClass('bi-play-fill').addClass('bi-pause-fill');
        } else {
            $track.css('animation-play-state', 'paused');
            $icon.removeClass('bi-pause-fill').addClass('bi-play-fill');
        }
    });

    // Toggle positions scroll
    $('#togglePositionsScroll').on('click', function () {
        const $track = $('.positions-scroll-track');
        const $icon = $(this).find('i');

        if ($track.css('animation-play-state') === 'paused') {
            $track.css('animation-play-state', 'running');
            $icon.removeClass('bi-play-fill').addClass('bi-pause-fill');
        } else {
            $track.css('animation-play-state', 'paused');
            $icon.removeClass('bi-pause-fill').addClass('bi-play-fill');
        }
    });
}