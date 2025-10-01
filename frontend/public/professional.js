// Professional.js - Additional professional features for MB Construction website

// Professional loading and initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Professional features initialized');
    
    // Add any professional-specific functionality here
    initProfessionalFeatures();
});

function initProfessionalFeatures() {
    // Professional animations and effects
    addProfessionalTouchEffects();
    initProfessionalScrollEffects();
}

function addProfessionalTouchEffects() {
    // Add subtle hover effects for professional appearance
    const cards = document.querySelectorAll('.enterprise-card, .service-card, .project-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initProfessionalScrollEffects() {
    // Professional scroll-based animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('professional-reveal');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}