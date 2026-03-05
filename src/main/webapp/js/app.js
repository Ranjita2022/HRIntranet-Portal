/**
 * HR Intranet Portal - Main Application
 * ======================================
 * Handles data fetching from database and rendering UI components
 */

$(document).ready(function() {
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

// ===================================
// DATABASE API FUNCTIONS
// ===================================

/**
 * Load all data from Database API
 */
function loadAllDataFromDatabase() {
    debugLog('Loading dummy data...');
    
    // Dummy Updates Data
    const dummyUpdates = [
        {
            ID: 1,
            Type: 'joiner',
            Title: 'Welcome Sarah Johnson to Our Team!',
            Name: 'Sarah Johnson',
            Position: 'Senior HR Manager',
            Department: 'Human Resources',
            StartDate: '2026-02-15',
            Date: '',
            Description: 'We are thrilled to welcome Sarah as our new Senior HR Manager. With over 10 years of experience in talent management, she brings valuable expertise to our team.',
            ImageURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
        },
        {
            ID: 2,
            Type: 'joiner',
            Title: 'Welcome Michael Chen!',
            Name: 'Michael Chen',
            Position: 'Software Engineer',
            Department: 'Engineering',
            StartDate: '2026-02-10',
            Date: '',
            Description: 'Michael joins our engineering team from Tech Corp. He specializes in full-stack development and cloud architecture.',
            ImageURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        },
        {
            ID: 3,
            Type: 'joiner',
            Title: 'Welcome Emily Rodriguez!',
            Name: 'Emily Rodriguez',
            Position: 'Marketing Specialist',
            Department: 'Marketing',
            StartDate: '2026-02-01',
            Date: '',
            Description: 'Emily brings creative energy to our marketing team with expertise in digital campaigns and brand strategy.',
            ImageURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
        },
        {
            ID: 4,
            Type: 'joiner',
            Title: 'Welcome David Park!',
            Name: 'David Park',
            Position: 'Financial Analyst',
            Department: 'Finance',
            StartDate: '2026-01-20',
            Date: '',
            Description: 'David joins our finance team with a strong background in financial modeling and business analytics.',
            ImageURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        },
        {
            ID: 5,
            Type: 'holiday',
            Title: 'Presidents Day',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '2026-02-16',
            Description: 'Office closed in observance of Presidents Day. Regular operations resume on Tuesday.',
            ImageURL: ''
        },
        {
            ID: 6,
            Type: 'holiday',
            Title: 'Spring Break - Office Closed',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '2026-03-20',
            Description: 'The office will be closed for spring break. Enjoy the time with your family!',
            ImageURL: ''
        },
        {
            ID: 7,
            Type: 'holiday',
            Title: 'Memorial Day',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '2026-05-25',
            Description: 'Office closed in observance of Memorial Day. We honor those who served.',
            ImageURL: ''
        },
        {
            ID: 8,
            Type: 'holiday',
            Title: 'Independence Day',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '2026-07-03',
            Description: 'Office closed for Independence Day celebration. Happy 4th of July!',
            ImageURL: ''
        },
        {
            ID: 9,
            Type: 'announcement',
            Title: 'Q1 Town Hall Meeting - This Friday!',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: 'Join us this Friday at 2:00 PM in the main conference room for our Q1 Town Hall. CEO will share company updates and answer questions.',
            ImageURL: ''
        },
        {
            ID: 10,
            Type: 'announcement',
            Title: 'New Health Benefits Package',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: 'We are excited to announce enhanced health benefits starting next month. Check your email for details on the new coverage options.',
            ImageURL: ''
        },
        {
            ID: 11,
            Type: 'announcement',
            Title: 'Office Renovation Update',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: 'The 3rd floor renovation is now complete! New collaboration spaces and meeting rooms are available for booking.',
            ImageURL: ''
        },
        {
            ID: 12,
            Type: 'announcement',
            Title: 'Employee Recognition Program Launch',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: 'Introducing our new peer recognition program. Nominate colleagues who go above and beyond!',
            ImageURL: ''
        },
        {
            ID: 13,
            Type: 'announcement',
            Title: 'IT System Maintenance - Saturday',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: 'Scheduled maintenance this Saturday 10 PM - 2 AM. Email and internal systems will be briefly unavailable.',
            ImageURL: ''
        },
        {
            ID: 14,
            Type: 'breaking',
            Title: 'Fire Drill scheduled for today at 3:00 PM - Please follow evacuation procedures',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '',
            Description: '',
            ImageURL: ''
        },
        {
            ID: 15,
            Type: 'event',
            Title: 'Annual Company Picnic',
            Name: '',
            Position: '',
            Department: '',
            StartDate: '',
            Date: '2026-03-15',
            Description: 'Join us for food, games, and fun at the annual company picnic!',
            ImageURL: ''
        }
    ];
    
    // Dummy Celebrations Data (Birthdays & Anniversaries)
    const dummyCelebrations = [
        {
            ID: 1,
            Type: 'birthday',
            Name: 'Jessica Williams',
            Date: '2026-02-20',
            Department: 'Marketing',
            ImageURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop'
        },
        {
            ID: 2,
            Type: 'birthday',
            Name: 'Robert Taylor',
            Date: '2026-02-22',
            Department: 'Sales',
            ImageURL: ''
        },
        {
            ID: 3,
            Type: 'anniversary',
            Name: 'Amanda Brown',
            Date: '2026-02-19',
            Years: 5,
            Department: 'Engineering',
            ImageURL: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop'
        },
        {
            ID: 4,
            Type: 'birthday',
            Name: 'Christopher Lee',
            Date: '2026-02-25',
            Department: 'Finance',
            ImageURL: ''
        },
        {
            ID: 5,
            Type: 'anniversary',
            Name: 'Michelle Garcia',
            Date: '2026-02-21',
            Years: 10,
            Department: 'HR',
            ImageURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
        }
    ];
    
    // Dummy Carousel Data
    const dummyCarousel = [
        {
            ID: 1,
            Title: 'Welcome to 2026!',
            Caption: 'Celebrating another amazing year together as a team',
            ImageURL: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=400&fit=crop'
        },
        {
            ID: 2,
            Title: 'Annual Company Retreat',
            Caption: 'Thank you to everyone who joined our mountain retreat last month!',
            ImageURL: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&h=400&fit=crop'
        },
        {
            ID: 3,
            Title: 'Innovation Award 2026',
            Caption: 'Congratulations to our R&D team for winning the Innovation Excellence Award',
            ImageURL: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop'
        },
        {
            ID: 4,
            Title: 'Community Service Day',
            Caption: 'Our team volunteered 500+ hours this quarter. Making a difference together!',
            ImageURL: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop'
        }
    ];
    
    // Process the dummy data
    processUpdatesData(dummyUpdates);
    processCarouselData(dummyCarousel);
    // Note: dummyCelebrations are now included in dummyUpdates as birthdays
    // No need for separate processCelebrationsData call
    
    // Update last updated time
    updateLastUpdatedTime();
}

/**
 * Load all data from Database API
 */
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
        success: function(response) {
            console.log('✅ Database API response received', response);
            debugLog('Database data loaded successfully', response);
            
            // Transform database response to match expected format
            const transformedData = transformDatabaseResponse(response);
            
            // Process and render the data
            processUpdatesData(transformedData.updates);
            processCarouselData(transformedData.carousel);
            
            // Process celebrations - they will be combined with joiners in renderTeamUpdates
            window.celebrationsData = transformedData.celebrations || [];
            
            // Trigger combined rendering if we have celebrations from database
            if (window.celebrationsData.length > 0) {
                console.log('🎉 Celebrations data from database:', window.celebrationsData.length);
                // Re-render team updates with celebrations included
                const joiners = window.joinersData || [];
                renderTeamUpdates(joiners, window.celebrationsData);
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
            
            // Update last updated time
            updateLastUpdatedTime();
            
            console.log('🚀 === DATABASE DATA LOADING COMPLETE ===');
        },
        error: function(xhr, status, error) {
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
            updates.push({
                ID: celebration.ID || celebration.id,
                Type: celebration.Type || 'anniversary',
                Name: celebration.Name || '',
                Date: celebration.Date || '',
                Years: celebration.Years || 0,
                Department: celebration.Department || '',
                ImageURL: celebration.ImageURL || '',
                Title: '',
                Position: '',
                StartDate: '',
                Description: ''
            });
            celebrations.push({
                id: celebration.ID || celebration.id,
                type: celebration.Type || 'anniversary',
                name: celebration.Name || '',
                date: celebration.Date || '',
                years: celebration.Years || 0,
                department: celebration.Department || '',
                imageUrl: celebration.ImageURL || ''
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
        success: function(response) {
            console.log('✅ Random gallery images loaded:', response.length);
            // Process gallery images if you have a gallery section
            if (typeof displayGalleryImages === 'function') {
                displayGalleryImages(response);
            }
        },
        error: function(xhr, status, error) {
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
        success: function(response) {
            console.log('✅ Quick links loaded:', response.length);
            // Process quick links if you have a quick links section
            if (typeof displayQuickLinks === 'function') {
                displayQuickLinks(response);
            }
        },
        error: function(xhr, status, error) {
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
        $showMoreBtn.on('click', function() {
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
        success: function(response) {
            console.log('✅ Emergency contacts loaded:', response.length);
            // Process emergency contacts if you have an emergency contacts section
            if (typeof displayEmergencyContacts === 'function') {
                displayEmergencyContacts(response);
            }
        },
        error: function(xhr, status, error) {
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
        $showMoreBtn.on('click', function() {
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

// ===================================
// DATA PROCESSING FUNCTIONS
// ===================================

/**
 * Process and categorize updates data
 */
function processUpdatesData(data) {
    const joiners = [];
    const holidays = [];
    const announcements = [];
    const breakingNews = [];
    const events = [];
    const birthdays = [];
    
    console.log('🔍 Processing updates data. Sample row:', data[0]);
    
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
                    description: row.Description
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
        const carousel = new bootstrap.Carousel(carouselElement, {
            interval: CONFIG.CAROUSEL_INTERVAL,
            ride: 'carousel',
            pause: false  // Don't pause on hover/focus in TV mode
        });
        carousel.cycle(); // Start cycling
        console.log('✅ Carousel initialized and cycling');
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
                        ${isNew ? '<span class="badge-new">NEW</span>' : ''}
                        ${imageHtml}
                        <div class="team-card-content">
                            <h4 class="team-card-name">${escapeHtml(joiner.name) || 'New Team Member'}</h4>
                            <p class="team-card-position">${escapeHtml(joiner.position) || 'Position TBD'}</p>
                            ${joiner.department ? `<span class="team-card-department">${escapeHtml(joiner.department)}</span>` : ''}
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
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    // Duplicate content for smooth infinite scrolling
    $container.html(cardsHtml + cardsHtml);
}

/**
 * Render holidays section
 */
function renderHolidays(holidays) {
    const $container = $('#holidaysContainer');
    const $section = $('#holidays');
    $container.empty();
    
    // Filter and sort holidays
    let filteredHolidays = holidays;
    
    if (CONFIG.SHOW_ONLY_FUTURE_HOLIDAYS) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        filteredHolidays = holidays.filter(h => {
            if (!h.date) return false;
            const holidayDate = new Date(h.date);
            return holidayDate >= today;
        });
    }
    
    // Sort by date
    filteredHolidays.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
    
    if (filteredHolidays.length === 0) {
        $section.addClass('no-data');
        return;
    }
    
    $section.removeClass('no-data');
    
    const maxHolidays = Math.min(filteredHolidays.length, CONFIG.MAX_HOLIDAYS);
    
    let cardsHtml = '';
    for (let i = 0; i < maxHolidays; i++) {
        const holiday = filteredHolidays[i];
        const dateInfo = getDateParts(holiday.date);
        
        cardsHtml += `
            <div class="holiday-card fade-in-up" style="animation-delay: ${i * 0.1}s">
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
}

/**
 * Render announcements section (vertical auto-scroll)
 */
function renderAnnouncements(announcements) {
    const $container = $('#announcementsContainer');
    const $section = $('#announcements');
    $container.empty();
    
    if (announcements.length === 0) {
        $section.addClass('no-data');
        return;
    }
    
    $section.removeClass('no-data');
    
    const maxAnnouncements = Math.min(announcements.length, CONFIG.MAX_ANNOUNCEMENTS);
    let cardsHtml = '';
    
    for (let i = 0; i < maxAnnouncements; i++) {
        const announcement = announcements[i];
        
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
    const celebrations = data.map(row => ({
        id: row.ID,
        type: (row.Type || '').toLowerCase(),
        name: row.Name,
        date: row.Date,
        years: row.Years,
        department: row.Department,
        imageUrl: row.ImageURL
    }));
    
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
    
    // Add section banner card
    let cardsHtml = `
        <div class="celebration-card-wrapper section-banner-card">
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
            ? `<img src="${escapeHtml(fixedImageUrl)}" class="celebration-image ${typeClass}" alt="${escapeHtml(celebration.name)}" data-file-id="${fileId || ''}" data-type="${typeClass}"
                    onerror="if(this.dataset.fileId) { handleDriveImageError(this, this.dataset.fileId); } else { const icon = this.dataset.type === 'birthday' ? 'bi-cake-fill' : 'bi-award-fill'; this.parentElement.innerHTML = '<div class=\\'celebration-image-placeholder ' + this.dataset.type + '\\'><i class=\\'bi ' + icon + '\\'></i></div>'; }">`
            : `<div class="celebration-image-placeholder ${typeClass}"><i class="bi ${icon}"></i></div>`;
        
        const dateStr = formatShortDate(celebration.date);
        
        cardsHtml += `
            <div class="celebration-card-wrapper">
                <div class="celebration-card ${typeClass} position-relative h-100">
                    <span class="celebration-badge-top ${typeClass}">${badgeText}</span>
                    ${imageHtml}
                    <div class="celebration-content">
                        <h4 class="celebration-name">${escapeHtml(celebration.name)}</h4>
                        ${celebration.department ? `<p class="celebration-department">${escapeHtml(celebration.department)}</p>` : ''}
                        <div class="celebration-date">
                            <i class="bi bi-calendar3"></i>
                            ${dateStr}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Duplicate content for smooth infinite scrolling
    $container.html(cardsHtml + cardsHtml);
}

/**
 * Render breaking news ticker
 */
function renderBreakingNews(news) {
    const $bar = $('#breakingNewsBar');
    const $content = $('#breakingTickerContent');
    
    if (news.length === 0) {
        $bar.hide();
        return;
    }
    
    let tickerHtml = '';
    news.forEach(item => {
        tickerHtml += `<span>${escapeHtml(item.title)}</span>`;
    });
    
    $content.html(tickerHtml);
    $bar.show();
    
    // Close button handler
    $('#closeBreakingNews').off('click').on('click', function() {
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
        $banner.hide();
        return;
    }
    
    const nextEvent = upcomingEvents[0];
    const eventDate = new Date(nextEvent.date);
    
    $('#countdownTitle').text(nextEvent.title);
    $banner.show();
    
    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // Update countdown every second
    function updateCountdown() {
        const now = new Date();
        const diff = eventDate - now;
        
        if (diff <= 0) {
            $banner.hide();
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
window.handleDriveImageError = function(img, fileId) {
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
 * Check if date is in the future
 */
function isFutureDate(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date >= today;
}

// ===================================
// TV / KIOSK MODE FUNCTIONS
// ===================================

let tvModeEnabled = false;
let tvRefreshInterval = null;
let tvClockInterval = null;
let tvRefreshCountdown = 60; // seconds
let tvSectionRotateInterval = null;
let currentTVSection = 0;

/**
 * Initialize TV Mode functionality
 */
function initTVMode() {
    // TV Mode button click
    $('#tvModeBtn').on('click', function(e) {
        e.preventDefault();
        enterTVMode();
    });
    
    // Exit TV Mode button
    $('#tvExitBtn').on('click', function() {
        exitTVMode();
    });
    
    // ESC key to exit TV mode
    $(document).on('keydown', function(e) {
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
    tvRefreshInterval = setInterval(function() {
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
    
    // Start section rotation
    startTVSectionRotation();
    
    debugLog('TV Mode enabled');
}

/**
 * Start rotating sections in TV mode
 */
function startTVSectionRotation() {
    // Get only visible sections (that have data)
    const allSections = ['#joiners', '#holidays', '#celebrations', '#announcements'];
    const visibleSections = allSections.filter(section => !$(section).hasClass('no-data'));
    
    if (visibleSections.length === 0) {
        debugLog('TV Mode: No sections with data to display');
        return;
    }
    
    currentTVSection = 0;
    
    // Show first visible section
    showTVSection(visibleSections[currentTVSection]);
    
    // Only rotate if there's more than one section
    if (visibleSections.length > 1) {
        // Rotate every 10 seconds
        tvSectionRotateInterval = setInterval(function() {
            // Re-check visible sections in case data changes
            const currentVisible = allSections.filter(section => !$(section).hasClass('no-data'));
            if (currentVisible.length === 0) return;
            
            currentTVSection = (currentTVSection + 1) % currentVisible.length;
            showTVSection(currentVisible[currentTVSection]);
        }, 10000);
    }
}

/**
 * Show specific section in TV mode
 */
function showTVSection(sectionId) {
    // Hide all rotating sections
    $('#joiners, #holidays, #celebrations, #announcements').removeClass('tv-active').addClass('tv-hidden');
    
    // Show current section with animation (only if it has data)
    const $section = $(sectionId);
    if (!$section.hasClass('no-data')) {
        $section.removeClass('tv-hidden').addClass('tv-active');
        debugLog('TV Mode showing:', sectionId);
    }
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
    
    // Clear intervals
    if (tvClockInterval) {
        clearInterval(tvClockInterval);
        tvClockInterval = null;
    }
    if (tvRefreshInterval) {
        clearInterval(tvRefreshInterval);
        tvRefreshInterval = null;
    }
    if (tvSectionRotateInterval) {
        clearInterval(tvSectionRotateInterval);
        tvSectionRotateInterval = null;
    }
    
    // Show all sections again
    $('#joiners, #holidays, #celebrations, #announcements').removeClass('tv-active tv-hidden');
    
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
document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement && tvModeEnabled) {
        // User exited fullscreen via browser controls
        exitTVMode();
    }
});

// Initialize TV mode when DOM is ready
$(document).ready(function() {
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
    $('#darkModeBtn').on('click', function(e) {
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
 * Initialize scroll toggle buttons
 */
function initScrollToggles() {
    // Toggle team updates scroll
    $('#toggleTeamScroll').on('click', function() {
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
    
    // Toggle announcement scroll
    $('#toggleAnnouncementScroll').on('click', function() {
        const $track = $('.announcements-scroll-track');
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
