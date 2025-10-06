// MB Construction - Professional Website JavaScript with Enhanced Animations

// Enhanced Animation Controller
class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animatedElements = new Set();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.initAnimationSystem();
    }
    
    initAnimationSystem() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupParallaxEffects();
        this.initCounterAnimations();
    }
    
    setupIntersectionObserver() {
        const options = {
            threshold: [0.1, 0.3, 0.5],
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.mainObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target, entry.intersectionRatio);
                }
            });
        }, options);
        
        // Observe all animatable elements
        this.observeElements();
    }
    
    observeElements() {
        const selectors = [
            '.fade-in', '.slide-up', '.slide-down', '.slide-left', '.slide-right',
            '.scale-up', '.bounce-in', '.rotate-in',
            '.service-card', '.project-card', '.owner-info', '.achievement',
            '.expertise-card', '.value-card', '.job-card', '.benefit-item',
            '.section-title', '.section-subtitle', '.about-hero-card',
            '.stagger-children > *'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!this.animatedElements.has(el)) {
                    this.mainObserver.observe(el);
                    this.animatedElements.add(el);
                }
            });
        });
    }
    
    triggerAnimation(element, ratio) {
        if (this.isReducedMotion) {
            element.style.opacity = '1';
            element.style.transform = 'none';
            return;
        }
        
        // Add base animation class
        element.classList.add('animate');
        
        // Handle specific animation types
        if (element.classList.contains('stagger-children')) {
            this.triggerStaggeredAnimation(element);
        }
        
        if (element.classList.contains('counter-animate')) {
            this.animateCounter(element);
        }
        
        // Progressive animation based on intersection ratio
        if (ratio > 0.5) {
            element.classList.add('fully-visible');
        }
        
        // Unobserve after animation
        this.mainObserver.unobserve(element);
    }
    
    triggerStaggeredAnimation(container) {
        const children = Array.from(container.children);
        const delay = container.classList.contains('stagger-fast') ? 50 : 
                     container.classList.contains('stagger-slow') ? 200 : 100;
        
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('animate');
            }, index * delay);
        });
    }
    
    setupScrollAnimations() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Parallax effects
        this.updateParallax(scrollY);
        
        // Navbar effects
        this.updateNavbar(scrollY);
        
        // Progress indicators
        this.updateScrollProgress(scrollY);
    }
    
    updateParallax(scrollY) {
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    updateNavbar(scrollY) {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }
    
    updateScrollProgress(scrollY) {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const progress = (scrollY / (docHeight - winHeight)) * 100;
        
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    setupHoverEffects() {
        // Enhanced card hover effects
        const cards = document.querySelectorAll('.service-card, .project-card, .job-card, .benefit-item');
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.handleCardHover(e, false));
        });
        
        // Button hover effects
        const buttons = document.querySelectorAll('.btn-enhanced');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', (e) => this.handleButtonHover(e, true));
            btn.addEventListener('mouseleave', (e) => this.handleButtonHover(e, false));
        });
    }
    
    handleCardHover(event, isEntering) {
        const card = event.currentTarget;
        
        if (isEntering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.4)';
            
            // Add glow effect for certain cards
            if (card.classList.contains('service-card') || card.classList.contains('project-card')) {
                card.style.borderColor = 'rgba(37, 99, 235, 0.5)';
            }
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.borderColor = '';
        }
    }
    
    handleButtonHover(event, isEntering) {
        const btn = event.currentTarget;
        const glow = btn.querySelector('.btn-glow');
        
        if (isEntering) {
            btn.style.transform = 'translateY(-2px)';
            if (glow) {
                glow.style.opacity = '0.7';
            }
        } else {
            btn.style.transform = '';
            if (glow) {
                glow.style.opacity = '0';
            }
        }
    }
    
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-background, .hero-particles');
        parallaxElements.forEach(el => {
            el.classList.add('parallax');
            el.dataset.speed = el.classList.contains('hero-particles') ? '0.3' : '0.5';
        });
    }
    
    initCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number, .achievement-number');
        counters.forEach(counter => {
            counter.classList.add('counter-animate');
        });
    }
    
    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        if (isNaN(target)) return;
        
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const originalText = element.textContent;
        const prefix = originalText.match(/^[^\d]*/)?.[0] || '';
        const suffix = originalText.match(/[^\d]*$/)?.[0] || '';
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = originalText;
            }
        };
        
        updateCounter();
    }
}

// Enhanced UI Controller
class UIController {
    constructor() {
        this.activeModal = null;
        this.mobileMenuOpen = false;
        
        this.initUI();
    }
    
    initUI() {
        this.setupNavigation();
        this.setupModals();
        this.setupForms();
        this.setupScrollEffects();
        this.setupKeyboardNavigation();
    }
    
    setupNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Smooth scroll navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavClick(link);
            });
        });
        
        // Update active nav on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNav();
        });
    }
    
    toggleMobileMenu() {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (this.mobileMenuOpen) {
            navMenu.classList.add('active');
            navToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    handleNavClick(link) {
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (this.mobileMenuOpen) {
                this.toggleMobileMenu();
            }
        }
    }
    
    updateActiveNav() {
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
    
    setupModals() {
        const modal = document.getElementById('success-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
    }
    
    showModal(modalId = 'success-modal') {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('fade-in');
            this.activeModal = modal;
            document.body.style.overflow = 'hidden';
            
            // Focus management
            const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }
    
    closeModal() {
        if (this.activeModal) {
            this.activeModal.style.display = 'none';
            this.activeModal.classList.remove('fade-in');
            this.activeModal = null;
            document.body.style.overflow = '';
        }
    }
    
    setupForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', (e) => this.validateField(e.target));
                input.addEventListener('input', (e) => this.clearFieldError(e.target));
            });
        });
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        this.setButtonLoading(submitBtn, true);
        
        // Validate form
        if (!this.validateForm(form)) {
            this.setButtonLoading(submitBtn, false);
            return;
        }
        
        try {
            const response = await this.submitForm(formData);
            
            if (response.success) {
                this.showModal();
                form.reset();
                this.showNotification('Message sent successfully!', 'success');
            } else {
                throw new Error(response.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    async submitForm(formData) {
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        const contactData = {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim(),
            phone: formData.get('phone')?.trim() || '',
            service: formData.get('service'),
            message: formData.get('message')?.trim()
        };
        
        const response = await fetch(`${apiUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        return await response.json();
    }
    
    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        
        this.clearFieldError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }
        
        // Email validation
        if (fieldType === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        // Phone validation
        if (fieldName === 'phone' && value && !this.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        
        return true;
    }
    
    getFieldLabel(field) {
        const label = field.closest('.form-group')?.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    isValidPhone(phone) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));
    }
    
    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            let errorElement = formGroup.querySelector('.field-error');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                formGroup.appendChild(errorElement);
            }
            
            errorElement.textContent = message;
        }
    }
    
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorElement = formGroup.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    setButtonLoading(button, isLoading) {
        const span = button.querySelector('span');
        
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            if (span) {
                span.dataset.originalText = span.textContent;
                span.textContent = 'Sending...';
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (span && span.dataset.originalText) {
                span.textContent = span.dataset.originalText;
            }
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #059669;' : 'background: #dc2626;'}
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    setupScrollEffects() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Tab navigation enhancement
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
}

// Performance Monitoring and Core Web Vitals
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: null,
            ttfb: null,
            fcp: null
        };
        
        this.thresholds = {
            lcp: 2500,    // 2.5 seconds
            fid: 100,     // 100 milliseconds
            cls: 0.1,     // 0.1 cumulative score
            ttfb: 800,    // 800 milliseconds
            fcp: 1800     // 1.8 seconds
        };
        
        this.initPerformanceTracking();
    }
    
    initPerformanceTracking() {
        // Track Core Web Vitals
        this.trackLCP();
        this.trackFID();
        this.trackCLS();
        this.trackTTFB();
        this.trackFCP();
        
        // Track resource loading
        this.trackResourceTiming();
        
        // Report metrics after page load
        window.addEventListener('load', () => {
            setTimeout(() => this.reportMetrics(), 1000);
        });
    }
    
    trackLCP() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
                this.checkThreshold('lcp', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
    
    trackFID() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const firstInput = entryList.getEntries()[0];
                if (firstInput) {
                    const fid = firstInput.processingStart - firstInput.startTime;
                    this.metrics.fid = fid;
                    this.checkThreshold('fid', fid);
                }
            }).observe({ entryTypes: ['first-input'] });
        }
    }
    
    trackCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.metrics.cls = clsValue;
                this.checkThreshold('cls', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }
    
    trackTTFB() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const [navigationEntry] = entryList.getEntries();
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                this.metrics.ttfb = ttfb;
                this.checkThreshold('ttfb', ttfb);
            }).observe({ entryTypes: ['navigation'] });
        }
    }
    
    trackFCP() {
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    this.metrics.fcp = fcpEntry.startTime;
                    this.checkThreshold('fcp', fcpEntry.startTime);
                }
            }).observe({ entryTypes: ['paint'] });
        }
    }
    
    trackResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(resource => resource.duration > 1000);
            
            if (slowResources.length > 0) {
                console.warn('🐌 Slow loading resources detected:', slowResources.map(r => ({
                    name: r.name.split('/').pop(),
                    duration: Math.round(r.duration) + 'ms',
                    size: r.transferSize ? Math.round(r.transferSize / 1024) + 'KB' : 'unknown'
                })));
            }
        });
    }
    
    checkThreshold(metric, value) {
        const threshold = this.thresholds[metric];
        const status = value <= threshold ? '✅' : '⚠️';
        const color = value <= threshold ? 'color: green' : 'color: orange';
        
        console.log(`%c${status} ${metric.toUpperCase()}: ${Math.round(value)}${metric === 'cls' ? '' : 'ms'} (threshold: ${threshold}${metric === 'cls' ? '' : 'ms'})`, color);
    }
    
    reportMetrics() {
        console.group('📊 Performance Metrics Report');
        console.log('Core Web Vitals:', this.metrics);
        
        // Calculate performance score
        const score = this.calculatePerformanceScore();
        console.log(`%c🎯 Performance Score: ${score}/100`, score >= 90 ? 'color: green; font-weight: bold' : score >= 70 ? 'color: orange; font-weight: bold' : 'color: red; font-weight: bold');
        
        // Show performance badge in development
        if (window.location.hostname === 'localhost') {
            this.showPerformanceBadge(score);
        }
        
        console.groupEnd();
    }
    
    showPerformanceBadge(score) {
        const badge = document.createElement('div');
        badge.className = 'performance-badge';
        badge.innerHTML = `⚡ ${score}/100`;
        
        if (score >= 90) {
            badge.classList.add('good');
        } else if (score >= 70) {
            badge.classList.add('needs-improvement');
        } else {
            badge.classList.add('poor');
        }
        
        // Add click handler to show detailed metrics
        badge.addEventListener('click', () => {
            console.group('📊 Detailed Performance Metrics');
            console.table(this.metrics);
            console.groupEnd();
        });
        
        badge.title = 'Click to view detailed metrics';
        document.body.appendChild(badge);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (badge.parentElement) {
                badge.style.opacity = '0';
                badge.style.transition = 'opacity 0.5s ease';
                setTimeout(() => badge.remove(), 500);
            }
        }, 10000);
    }
    
    calculatePerformanceScore() {
        let score = 100;
        
        // Deduct points for poor metrics
        if (this.metrics.lcp > this.thresholds.lcp) score -= 20;
        if (this.metrics.fid > this.thresholds.fid) score -= 15;
        if (this.metrics.cls > this.thresholds.cls) score -= 15;
        if (this.metrics.ttfb > this.thresholds.ttfb) score -= 10;
        if (this.metrics.fcp > this.thresholds.fcp) score -= 10;
        
        return Math.max(0, score);
    }
}

// Resource Loading Manager
class ResourceManager {
    constructor() {
        this.criticalResources = new Set();
        this.deferredResources = new Set();
        this.loadedResources = new Set();
        
        this.initResourceManagement();
    }
    
    initResourceManagement() {
        this.preloadCriticalAssets();
        this.setupLazyLoading();
        this.optimizeImageLoading();
    }
    
    preloadCriticalAssets() {
        const criticalAssets = [
            { type: 'font', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap', crossorigin: 'anonymous' },
            { type: 'image', href: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop&q=80' }
        ];
        
        criticalAssets.forEach(asset => this.preloadAsset(asset));
    }
    
    preloadAsset(asset) {
        if (this.criticalResources.has(asset.href)) return;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = asset.type === 'font' ? 'style' : asset.type;
        link.href = asset.href;
        
        if (asset.crossorigin) {
            link.crossOrigin = asset.crossorigin;
        }
        
        if (asset.type === 'font') {
            link.onload = () => {
                const styleLink = document.createElement('link');
                styleLink.rel = 'stylesheet';
                styleLink.href = asset.href;
                document.head.appendChild(styleLink);
            };
        }
        
        document.head.appendChild(link);
        this.criticalResources.add(asset.href);
    }
    
    setupLazyLoading() {
        // Lazy load non-critical CSS
        const nonCriticalCSS = document.querySelectorAll('link[rel="preload"][as="style"]');
        nonCriticalCSS.forEach(link => {
            link.addEventListener('load', () => {
                link.rel = 'stylesheet';
            });
        });
    }
    
    optimizeImageLoading() {
        // Add loading="lazy" to images below the fold
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (index > 2) { // Skip first 3 images (likely above the fold)
                img.loading = 'lazy';
                img.decoding = 'async';
            }
        });
    }
}

// Image Optimization System
class ImageOptimizer {
    constructor() {
        this.supportsWebP = this.checkWebPSupport();
        this.supportsAVIF = this.checkAVIFSupport();
        this.lazyImages = new Set();
        
        this.initImageOptimization();
    }
    
    checkWebPSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('webp') > -1;
    }
    
    checkAVIFSupport() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/avif').indexOf('avif') > -1;
    }
    
    initImageOptimization() {
        this.setupIntersectionObserver();
        this.optimizeExistingImages();
        this.addImageErrorHandling();
    }
    
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        this.imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
    }
    
    optimizeExistingImages() {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                this.lazyImages.add(img);
                if (this.imageObserver) {
                    this.imageObserver.observe(img);
                }
            }
            
            // Add blur-to-sharp transition
            if (!img.complete) {
                img.style.filter = 'blur(5px)';
                img.style.transition = 'filter 0.3s ease';
                
                img.addEventListener('load', () => {
                    img.style.filter = 'none';
                });
            }
        });
    }
    
    loadImage(img) {
        if (img.dataset.src) {
            // Create optimized image URL
            const optimizedSrc = this.getOptimizedImageUrl(img.dataset.src);
            
            // Preload the image
            const imageLoader = new Image();
            imageLoader.onload = () => {
                img.src = optimizedSrc;
                img.classList.add('loaded');
                img.style.filter = 'none';
            };
            
            imageLoader.onerror = () => {
                // Fallback to original image
                img.src = img.dataset.src;
                img.classList.add('error');
            };
            
            imageLoader.src = optimizedSrc;
        }
    }
    
    getOptimizedImageUrl(originalUrl) {
        // If using Unsplash, add format optimization
        if (originalUrl.includes('unsplash.com')) {
            const url = new URL(originalUrl);
            if (this.supportsAVIF) {
                url.searchParams.set('fm', 'avif');
            } else if (this.supportsWebP) {
                url.searchParams.set('fm', 'webp');
            }
            url.searchParams.set('q', '85'); // Optimize quality
            return url.toString();
        }
        
        return originalUrl;
    }
    
    addImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                console.warn('Image failed to load:', e.target.src);
                e.target.classList.add('image-error');
                
                // Add placeholder or retry logic here
                if (!e.target.dataset.retried) {
                    e.target.dataset.retried = 'true';
                    setTimeout(() => {
                        e.target.src = e.target.src; // Retry loading
                    }, 2000);
                }
            }
        }, true);
    }
}

// Initialize performance systems
const performanceMonitor = new PerformanceMonitor();
const resourceManager = new ResourceManager();
const imageOptimizer = new ImageOptimizer();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MB Construction - Professional Website Initialized');
    
    // Initialize core systems
    const animationController = new AnimationController();
    const uiController = new UIController();
    const performanceMonitor = new PerformanceMonitor();
    
    // Initialize welcome screen
    initWelcomeScreen();
    
    // Initialize scroll effects
    initScrollEffects();
    
    // Initialize additional features
    initImageLazyLoading();
    initAccessibilityFeatures();
    
    // Store controllers globally for debugging
    window.mbConstruction = {
        animationController,
        uiController,
        performanceMonitor
    };
    
    console.log('✅ All systems initialized successfully');
});

// Welcome Screen with enhanced animation
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (welcomeScreen) {
        // Faster welcome screen (1.2 seconds)
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            document.body.style.overflow = 'auto';
            
            // Trigger initial animations after welcome screen
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 300);
        }, 1200);
        
        document.body.style.overflow = 'hidden';
    }
}

// Enhanced scroll effects
function initScrollEffects() {
    let ticking = false;
    
    // Throttled scroll handler
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                updateParallaxElements();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    function updateScrollProgress() {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        const progress = (scrollTop / (docHeight - winHeight)) * 100;
        
        // Update any progress indicators
        const progressBars = document.querySelectorAll('.scroll-progress');
        progressBars.forEach(bar => {
            bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        });
    }
    
    function updateParallaxElements() {
        const scrollY = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.5;
            const yPos = -(scrollY * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Image lazy loading with intersection observer
function initImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px'
        });
        
        // Observe all images with data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Accessibility enhancements
function initAccessibilityFeatures() {
    // Skip to content link
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#main-content');
            if (target) {
                target.focus();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Enhanced focus management
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Announce dynamic content changes to screen readers
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    
    window.announceToScreenReader = (message) => {
        announcer.textContent = message;
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    };
}

// Utility functions
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
    }
}

// Global modal functions
window.closeModal = function() {
    if (window.mbConstruction?.uiController) {
        window.mbConstruction.uiController.closeModal();
    }
};

window.showModal = function(modalId) {
    if (window.mbConstruction?.uiController) {
        window.mbConstruction.uiController.showModal(modalId);
    }
};

// Welcome Screen Animation - Faster
function initWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcome-screen');
    
    if (welcomeScreen) {
        // Hide welcome screen after 1.5 seconds (faster)
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            // Enable body scroll after welcome screen
            document.body.style.overflow = 'auto';
        }, 1500);
        
        // Disable body scroll during welcome screen
        document.body.style.overflow = 'hidden';
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

// Enhanced Animation System
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
                
                // Trigger heading animations
                if (entry.target.classList.contains('heading-animated')) {
                    entry.target.classList.add('in-view');
                }
                
                // Trigger counter animation for achievement cards
                if (entry.target.classList.contains('achievement-item') || entry.target.classList.contains('stat-card')) {
                    animateCounter(entry.target);
                }
                
                // Trigger staggered animations for children
                if (entry.target.classList.contains('stagger-children') || 
                    entry.target.classList.contains('stagger-fast') || 
                    entry.target.classList.contains('stagger-slow')) {
                    triggerStaggeredAnimation(entry.target);
                }
                
                // Unobserve after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .fade-in,
        .slide-up,
        .slide-down,
        .slide-left,
        .slide-right,
        .scale-up,
        .scale-down,
        .service-card,
        .project-card,
        .testimonial-card,
        .achievement-card,
        .stat-card,
        .contact-card,
        .glass-card,
        .heading-animated,
        .stagger-children,
        .stagger-fast,
        .stagger-slow
    `);
    
    animatedElements.forEach(el => observer.observe(el));
}

// Staggered Animation Trigger
function triggerStaggeredAnimation(container) {
    const children = Array.from(container.children);
    children.forEach((child, index) => {
        // Set stagger index if not already set
        if (!child.style.getPropertyValue('--stagger-index')) {
            child.style.setProperty('--stagger-index', index);
        }
        
        // Add animation classes if they don't exist
        if (!child.classList.contains('fade-in') && 
            !child.classList.contains('slide-up') && 
            !child.classList.contains('scale-up')) {
            child.classList.add('fade-in');
        }
    });
}

// Counter Animation
function initCounters() {
    // This will be triggered by intersection observer
}

function animateCounter(card) {
    // Look for different types of number elements
    const numberElement = card.querySelector('.stat-number') || 
                         card.querySelector('.achievement-number') ||
                         card.querySelector('[data-target]');
    
    if (!numberElement) return;
    
    // Get target from data attribute or text content
    let target;
    if (numberElement.hasAttribute('data-target')) {
        target = parseInt(numberElement.getAttribute('data-target'));
    } else {
        // Extract number from text content (handles cases like "150+", "₹500+", "98%")
        const text = numberElement.textContent;
        const match = text.match(/(\d+)/);
        if (match) {
            target = parseInt(match[1]);
        } else {
            return; // No number found
        }
    }
    
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    // Store original text format
    const originalText = numberElement.textContent;
    const prefix = originalText.match(/^[^\d]*/)?.[0] || '';
    const suffix = originalText.match(/[^\d]*$/)?.[0] || '';
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            numberElement.textContent = prefix + Math.floor(current) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            numberElement.textContent = prefix + target + suffix;
        }
    };
    
    updateCounter();
}

// Enhanced Form Handling with Performance Optimization
function initForms() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Add form validation on input for better UX
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', debounce(clearFieldError, 300));
        });
        
        contactForm.addEventListener('submit', handleFormSubmit);
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
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.querySelector('span').textContent;
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearFormErrors(form);
    
    // Validate form
    if (!validateForm(form, formData)) {
        resetSubmitButton(submitBtn, originalText);
        return;
    }
    
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
        // Use environment-aware API URL with error handling
        const apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        const response = await fetch(`${apiUrl}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccessModal();
            form.reset();
            showSuccessMessage('Thank you! Your message has been sent successfully.');
        } else {
            throw new Error(result.message || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('❌ Form submission error:', error);
        
        // Use the enhanced error handler
        if (window.errorHandler) {
            window.errorHandler.handleApiError(error, { 
                form: form.id,
                formData: Object.fromEntries(formData.entries()),
                timestamp: new Date().toISOString()
            });
        } else {
            showErrorMessage('Failed to send message. Please try again or contact us directly.');
        }
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
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 5000);
    }
}

function showSuccessMessage(message) {
    const successElement = document.createElement('div');
    successElement.className = 'form-success';
    successElement.textContent = message;
    successElement.style.cssText = `
        background: #d1fae5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(successElement, form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (successElement.parentElement) {
                successElement.remove();
            }
        }, 5000);
    }
}

function resetSubmitButton(submitBtn, originalText) {
    submitBtn.classList.remove('loading');
    submitBtn.querySelector('span').textContent = originalText;
    submitBtn.disabled = false;
}

// Modal functionality
function initModal() {
    // Modal will be handled by form submission
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make closeModal globally available
window.closeModal = closeModal;

// Scroll Effects
function initScrollEffects() {
    // Parallax effects are handled in initHero
    // Additional scroll effects can be added here
}

// Performance optimization
function optimizePageLoad() {
    // Optimize images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.loading) {
            img.loading = 'lazy';
        }
        img.decoding = 'async';
    });
    
    // Optimize fonts
    if ('fonts' in document) {
        document.fonts.ready.then(() => {
            document.body.classList.add('fonts-loaded');
        });
    }
}

// Utility function for debouncing
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