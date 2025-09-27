// Enhanced Theme Switcher Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Available themes
    const themes = ['dark', 'light', 'blue'];
    
    // Check for saved theme preference or use default
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Create theme menu
    createThemeMenu();
    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const themeMenu = document.getElementById('theme-menu');
        themeMenu.classList.toggle('active');
    });
    
    // Close theme menu when clicking outside
    document.addEventListener('click', function() {
        const themeMenu = document.getElementById('theme-menu');
        if (themeMenu && themeMenu.classList.contains('active')) {
            themeMenu.classList.remove('active');
        }
    });
    
    // Function to create theme menu
    function createThemeMenu() {
        // Create theme menu if it doesn't exist
        if (!document.getElementById('theme-menu')) {
            const themeMenu = document.createElement('div');
            themeMenu.id = 'theme-menu';
            themeMenu.className = 'theme-menu';
            
            // Add theme options
            themes.forEach(theme => {
                const themeOption = document.createElement('button');
                themeOption.className = 'theme-option';
                themeOption.setAttribute('data-theme', theme);
                
                // Set icon based on theme
                let icon = '🌙'; // dark
                if (theme === 'light') icon = '☀️';
                if (theme === 'blue') icon = '🔵';
                
                themeOption.innerHTML = `<span class="theme-icon">${icon}</span><span>${theme.charAt(0).toUpperCase() + theme.slice(1)}</span>`;
                
                // Add click event
                themeOption.addEventListener('click', function(e) {
                    e.stopPropagation();
                    setTheme(theme);
                    localStorage.setItem('theme', theme);
                    document.getElementById('theme-menu').classList.remove('active');
                });
                
                themeMenu.appendChild(themeOption);
            });
            
            // Add to DOM
            themeToggle.parentNode.appendChild(themeMenu);
            
            // Add styles if not already in CSS
            if (!document.getElementById('theme-menu-styles')) {
                const style = document.createElement('style');
                style.id = 'theme-menu-styles';
                style.textContent = `
                    .theme-menu {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: var(--color-surface);
                        border-radius: var(--radius-md);
                        box-shadow: var(--shadow-lg);
                        border: 1px solid var(--color-border);
                        padding: 0.5rem;
                        z-index: 100;
                        display: none;
                        backdrop-filter: var(--glass-blur);
                        -webkit-backdrop-filter: var(--glass-blur);
                        min-width: 150px;
                        transform: translateY(10px);
                        opacity: 0;
                        transition: transform 0.3s ease, opacity 0.3s ease;
                    }
                    .theme-menu.active {
                        display: block;
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .theme-option {
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        width: 100%;
                        background: none;
                        border: none;
                        color: var(--color-text);
                        cursor: pointer;
                        border-radius: var(--radius-sm);
                        transition: background 0.2s ease;
                        text-align: left;
                    }
                    .theme-option:hover {
                        background: var(--glass-bg);
                    }
                    .nav-actions {
                        position: relative;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // Function to set theme and update icon
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update toggle icon
        let icon = '🌙'; // dark
        if (theme === 'light') icon = '☀️';
        if (theme === 'blue') icon = '🔵';
        themeIcon.textContent = icon;
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            let color = '#000000'; // dark
            if (theme === 'light') color = '#1e293b';
            if (theme === 'blue') color = '#0f172a';
            metaThemeColor.setAttribute('content', color);
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }
});