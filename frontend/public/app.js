// MB Construction - Premium Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initWelcomeScreen();
    initNavigation();
    initThemeToggle();
    initHero();
    initAnimations();
    initForms();
    initModal();
    initScrollEffects();
    initCounters();
    
    console.log('🚀 MB Construction website initialized successfully!');
});

// Welcome Screen Animation
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (welcomeScreen) {
        // Hide welcome screen after 3 seconds
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            // Enable body scroll after welcome screen
            document.body.style.overflow = 'auto';
        }, 3000);
        
        // Disable body scroll during welcome screen
        document.body.style.overflow = 'hidden';
    }
}

// Theme Toggle Functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Add a subtle animation
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });
    
    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
}

// Navigation Functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Close mobile menu
            if (navMenu) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Smooth scroll to section
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // Update active nav link
        updateActiveNavLink();
    });
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Hero Section Effects
function initHero() {
    const heroParticles = document.querySelector('.hero-particles');
    
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroParticles) {
            heroParticles.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Animation System
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-reveal');
                
                // Trigger counter animation for stat cards
                if (entry.target.classList.contains('stat-card')) {
                    animateCounter(entry.target);
                }
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .service-card,
        .project-card,
        .testimonial-card,
        .stat-card,
        .contact-card,
        .glass-card
    `);
    
    animatedElements.forEach(el => observer.observe(el));
}

// Counter Animation
function initCounters() {
    // This will be triggered by intersection observer
}

function animateCounter(card) {
    const numberElement = card.querySelector('.stat-number');
    if (!numberElement) return;
    
    const target = parseInt(numberElement.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            numberElement.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            numberElement.textContent = target + '+';
        }
    };
    
    updateCounter();
}

// Enhanced Form Handling with Performance Optimization
function initForms() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        console.log('📋 Contact form found, initializing...');
        
        // Add form validation on input for better UX
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        console.log('📝 Found', inputs.length, 'form inputs');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', debounce(clearFieldError, 300));
        });
        
        contactForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Contact form initialized successfully');
    } else {
        console.log('❌ Contact form not found!');
    }
}

// Real-time field validation
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(field);
    
    // Validation rules
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-Z\s\.]+$/,
            message: 'Name must be 2-100 characters and contain only letters, spaces, and dots'
        },
        email: {
            required: true,
            pattern: /^\S+@\S+\.\S+$/,
            message: 'Please enter a valid email address'
        },
        phone: {
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Please enter a valid phone number'
        },
        service: {
            required: true,
            message: 'Please select a service'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 2000,
            message: 'Message must be between 10 and 2000 characters'
        }
    };
    
    const rule = validationRules[fieldName];
    if (!rule) return;
    
    // Check required fields
    if (rule.required && !value) {
        showFieldError(field, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
        return false;
    }
    
    // Check pattern
    if (value && rule.pattern && !rule.pattern.test(value)) {
        showFieldError(field, rule.message);
        return false;
    }
    
    // Check length
    if (value && rule.minLength && value.length < rule.minLength) {
        showFieldError(field, rule.message);
        return false;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
        showFieldError(field, rule.message);
        return false;
    }
    
    return true;
}

function clearFieldError(field) {
    if (typeof field === 'object' && field.target) {
        field = field.target;
    }
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('error');
        const errorMsg = formGroup.querySelector('.field-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector('span').textContent;
    
    console.log('📝 Form data collected:', Object.fromEntries(formData));
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearFormErrors(form);
    
    // Validate form
    if (!validateForm(form, formData)) {
        console.log('❌ Form validation failed');
        resetSubmitButton(submitBtn, originalText);
        return;
    }
    
    console.log('✅ Form validation passed');
    
    // Prepare data for API
    const contactData = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone')?.trim() || '',
        company: formData.get('company')?.trim() || '',
        service: formData.get('service'),
        message: formData.get('message').trim()
    };
    
    try {
        // Use environment-aware API URL
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        console.log('🌐 Making API request to:', `${apiUrl}/api/contact`);
        console.log('📤 Sending data:', contactData);
        
        const response = await fetch(`${apiUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        const result = await response.json();
        console.log('📥 Response data:', result);
        
        if (result.success) {
            console.log('✅ Form submitted successfully');
            showSuccessModal();
            form.reset();
            showSuccessMessage('Thank you! Your message has been sent successfully.');
        } else {
            console.log('❌ Server returned error:', result.message);
            throw new Error(result.message || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        showErrorMessage('Failed to send message. Please try again or contact us directly.');
    } finally {
        resetSubmitButton(submitBtn, originalText);
    }
}

function validateForm(form, formData) {
    let isValid = true;
    
    // Required fields validation
    const requiredFields = ['name', 'email', 'service', 'message'];
    
    requiredFields.forEach(field => {
        const value = formData.get(field);
        const input = form.querySelector(`[name="${field}"]`);
        
        if (!value || value.trim() === '') {
            showFieldError(input, `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            isValid = false;
        }
    });
    
    // Email validation
    const email = formData.get('email');
    if (email && !isValidEmail(email)) {
        const emailInput = form.querySelector('[name="email"]');
        showFieldError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: #fca5a5;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    `;
    
    formGroup.appendChild(errorElement);
}

function clearFormErrors(form) {
    const errorGroups = form.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
        group.classList.remove('error');
        const errorMsg = group.querySelector('.field-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    });
    
    const formErrors = form.querySelectorAll('.form-error');
    formErrors.forEach(error => error.remove());
}

function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    // Insert at the top of the first form found
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(errorElement, form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 5000);
        
        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showSuccessMessage(message) {
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.textContent = message;
    
    // Insert at the top of the first form found
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(successElement, form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (successElement.parentNode) {
                successElement.remove();
            }
        }, 5000);
    }
}

function resetSubmitButton(button, originalText) {
    button.classList.remove('loading');
    button.querySelector('span').textContent = originalText;
    button.disabled = false;
}

// Modal System
function initModal() {
    const modal = document.getElementById('success-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    
    if (modalClose) {
        modalClose.addEventListener('click', hideSuccessModal);
    }
    
    if (modalOk) {
        modalOk.addEventListener('click', hideSuccessModal);
    }
    
    // Close modal when clicking backdrop
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                hideSuccessModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            hideSuccessModal();
        }
    });
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Scroll Effects
function initScrollEffects() {
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        // Update scroll progress
        if (scrollProgress) {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        }
        
        // Show/hide back to top button
        if (backToTop) {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    });
    
    // Back to top functionality
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimized scroll handler
const optimizedScrollHandler = throttle(() => {
    updateActiveNavLink();
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop&q=80'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize image preloading
preloadImages();

// Handle image loading states
function initImageLoading() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            img.addEventListener('error', function() {
                this.classList.add('error');
                // Optionally set a fallback image
                // this.src = 'path/to/fallback-image.jpg';
            });
        }
    });
}

// Initialize image loading
initImageLoading();

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    // Skip links for accessibility
    if (e.key === 'Tab' && e.shiftKey) {
        // Handle reverse tab navigation if needed
    }
});

// Focus management for modals and mobile menu
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Error handling for failed API calls
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Optionally show user-friendly error message
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you want to add PWA capabilities
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}

// Analytics and tracking (placeholder)
function trackEvent(eventName, eventData = {}) {
    // Implement your analytics tracking here
    console.log('Event tracked:', eventName, eventData);
}

// Track form submissions
document.addEventListener('submit', (e) => {
    if (e.target.tagName === 'FORM') {
        trackEvent('form_submit', {
            form_id: e.target.id,
            form_type: 'contact'
        });
    }
});

// Track theme changes
document.addEventListener('click', (e) => {
    if (e.target.closest('.theme-toggle')) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        trackEvent('theme_change', {
            from_theme: currentTheme,
            to_theme: currentTheme === 'dark' ? 'light' : 'dark'
        });
    }
});

// Track button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn')) {
        trackEvent('button_click', {
            button_text: e.target.textContent.trim(),
            button_type: e.target.classList.contains('btn-primary') ? 'primary' : 'secondary'
        });
    }
});

// Enhanced Performance Monitoring and Optimization
const performanceMetrics = {
    startTime: performance.now(),
    
    // Track Core Web Vitals
    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            this.metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            if (firstInput) {
                console.log('FID:', firstInput.processingStart - firstInput.startTime);
                this.metrics.fid = firstInput.processingStart - firstInput.startTime;
            }
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
            this.metrics.cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });
    },

    // Track page load performance
    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now() - this.startTime;
            console.log('Total page load time:', loadTime.toFixed(2), 'ms');
            
            // Track navigation timing
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                console.log('Navigation metrics:', {
                    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                    tcp: navigation.connectEnd - navigation.connectStart,
                    request: navigation.responseStart - navigation.requestStart,
                    response: navigation.responseEnd - navigation.responseStart,
                    dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    load: navigation.loadEventEnd - navigation.loadEventStart
                });
            }
        });
    },

    // Track resource loading
    trackResources() {
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(resource => resource.duration > 1000);
        
        if (slowResources.length > 0) {
            console.warn('Slow loading resources:', slowResources.map(r => ({
                name: r.name,
                duration: r.duration.toFixed(2) + 'ms'
            })));
        }
    },

    metrics: {}
};

// Initialize performance tracking
if (typeof PerformanceObserver !== 'undefined') {
    performanceMetrics.trackCoreWebVitals();
    performanceMetrics.trackPageLoad();
    
    // Track resources after page load
    window.addEventListener('load', () => {
        setTimeout(() => performanceMetrics.trackResources(), 1000);
    });
}

// Image lazy loading optimization
function optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Add loading placeholder
                    img.style.backgroundColor = 'var(--glass-bg)';
                    
                    img.addEventListener('load', () => {
                        img.style.backgroundColor = 'transparent';
                        img.classList.add('loaded');
                    });
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize image optimization
optimizeImages();

// Accessibility improvements
function improveAccessibility() {
    // Add skip link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--color-gold-500);
        color: var(--color-white);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.setAttribute('id', 'main-content');
    }
}

// Initialize accessibility improvements
improveAccessibility();

// Handle reduced motion preferences
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for users who prefer reduced motion
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-normal', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
}

// System theme preference detection
function detectSystemTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Only use system preference if no saved theme
    if (!savedTheme) {
        const systemTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        localStorage.setItem('theme', systemTheme);
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme');
    // Only update if user hasn't manually set a preference
    if (!savedTheme) {
        const systemTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        
        // Update theme toggle icon if it exists
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = systemTheme === 'dark' ? '☀️' : '🌙';
        }
    }
});

// Initialize system theme detection
detectSystemTheme();

// Console welcome message
console.log(`
🏗️ MB Construction Website
Building Tomorrow, Today

Developed with ❤️ using modern web technologies
- Glassmorphism UI
- Smooth animations
- Responsive design
- Accessibility focused
- Performance optimized

© 2025 MB Construction. All rights reserved.
`);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateForm,
        isValidEmail,
        debounce,
        throttle
    };
}