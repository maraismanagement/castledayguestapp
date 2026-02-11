// Tab navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mardi Gras season hover effect (until Feb 18, 2026)
    const now = new Date();
    const mardiGrasEnd = new Date('2026-02-18T23:59:59');
    if (now <= mardiGrasEnd) {
        const recsTab = document.querySelector('[data-tab="recs"]');
        if (recsTab) {
            recsTab.classList.add('mardi-gras-hover');
        }
    }
    const tabs = document.querySelectorAll('.nav-item[data-tab]');
    const panels = document.querySelectorAll('.tab-panel');
    const headerImage = document.querySelector('.header-image img');

    // Map tab IDs to header images
    const headerImages = {
        'house': '../images/header-house.jpg',
        'pool': '../images/header-pool.jpg',
        'shop': '../images/header-shop.jpg',
        'services': '../images/header-services.jpg',
        'recs': '../images/header-recs.jpg',
        'contact': '../images/header-contact.jpg'
    };

    // Function to update header image
    function updateHeaderImage(tabId) {
        if (headerImage && headerImages[tabId]) {
            headerImage.src = headerImages[tabId];
        }
    }

    // Show House Info tab by default
    const defaultTab = document.querySelector('[data-tab="house"]');
    const defaultPanel = document.getElementById('house');
    if (defaultTab && defaultPanel) {
        defaultTab.classList.add('active');
        defaultPanel.classList.add('active');
        updateHeaderImage('house');
    } else if (panels.length > 0 && tabs.length > 0) {
        // Fallback to first tab
        panels[0].classList.add('active');
        tabs[0].classList.add('active');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('data-tab');

            // Remove active from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab and corresponding panel
            this.classList.add('active');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Update header image
            updateHeaderImage(targetId);
        });
    });
});
