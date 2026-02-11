// Tab navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.nav-item[data-tab]');
    const panels = document.querySelectorAll('.tab-panel');

    // Show House Info tab by default
    const defaultTab = document.querySelector('[data-tab="house"]');
    const defaultPanel = document.getElementById('house');
    if (defaultTab && defaultPanel) {
        defaultTab.classList.add('active');
        defaultPanel.classList.add('active');
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
        });
    });
});
