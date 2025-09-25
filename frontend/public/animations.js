// Enhanced Animations for MB Construction Website
document.addEventListener('DOMContentLoaded', function() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Apply animations only if user doesn't prefer reduced motion
  if (!prefersReducedMotion) {
    // Initialize scroll-based animations
    initScrollAnimations();
    
    // Initialize hover effects
    initHoverEffects();
    
    // Initialize page transitions
    initPageTransitions();
  } else {
    // Remove animation classes for users who prefer reduced motion
    document.body.classList.add('reduced-motion');
  }
  
  // Listen for theme changes to adjust animations
  document.addEventListener('themechange', function(e) {
    // Adjust animations based on theme if needed
    updateAnimationsForTheme(e.detail.theme);
  });
});

// Initialize scroll-based animations using Intersection Observer
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .zoom-in, .hero-title, .hero-subtitle, .section-title, .card, .service-item, .project-item, .team-member');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Unobserve after animation is triggered
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(element => {
    // Add initial state class if not already present
    if (!element.classList.contains('fade-in') && 
        !element.classList.contains('slide-in') && 
        !element.classList.contains('zoom-in')) {
      element.classList.add('fade-in');
    }
    observer.observe(element);
  });
  
  // Add staggered animations for list items
  const staggeredLists = document.querySelectorAll('.staggered-list');
  staggeredLists.forEach(list => {
    const items = list.children;
    Array.from(items).forEach((item, index) => {
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add('staggered-item');
    });
  });
}

// Initialize hover effects
function initHoverEffects() {
  // Add magnetic effect to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.style.setProperty('--x-pos', `${x}px`);
      this.style.setProperty('--y-pos', `${y}px`);
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.setProperty('--x-pos', '50%');
      this.style.setProperty('--y-pos', '50%');
    });
  });
  
  // Add hover effects to cards
  const cards = document.querySelectorAll('.card, .service-item, .project-item, .team-member');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
}

// Initialize page transitions
function initPageTransitions() {
  // Smooth scroll for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Highlight active nav link
        document.querySelectorAll('.nav-link').forEach(navLink => {
          navLink.classList.remove('active');
        });
        this.classList.add('active');
        
        // Smooth scroll to target
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Update animations based on current theme
function updateAnimationsForTheme(theme) {
  // Adjust animation properties based on theme
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.style.setProperty('--animation-shadow-color', 'rgba(0, 0, 0, 0.1)');
  } else if (theme === 'dark') {
    root.style.setProperty('--animation-shadow-color', 'rgba(245, 158, 11, 0.2)');
  } else if (theme === 'blue') {
    root.style.setProperty('--animation-shadow-color', 'rgba(56, 189, 248, 0.2)');
  }
}