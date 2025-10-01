// Premium Animation System for MB Construction Website
document.addEventListener('DOMContentLoaded', function() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Apply animations only if user doesn't prefer reduced motion
  if (!prefersReducedMotion) {
    // Initialize all animation systems
    initScrollAnimations();
    initHoverEffects();
    initPageTransitions();
    initParticleEffects();
    initCounterAnimations();
    initMagneticEffects();
    initMorphingEffects();
    initGlowEffects();
    initParallaxEffects();
  } else {
    // Remove animation classes for users who prefer reduced motion
    document.body.classList.add('reduced-motion');
  }
  
  // Listen for theme changes to adjust animations
  document.addEventListener('themechange', function(e) {
    updateAnimationsForTheme(e.detail.theme);
  });
});

// Enhanced scroll-based animations using Intersection Observer
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .scale-up, .slide-up, .glass-card, .service-card, .project-card, .stat-card, .testimonial-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        
        // Add enhanced animation classes based on element type
        if (entry.target.classList.contains('glass-card')) {
          entry.target.classList.add('animate-fade-in-up', 'animate-glow-pulse');
        } else if (entry.target.classList.contains('service-card')) {
          entry.target.classList.add('animate-scale-elastic', 'hover-tilt');
        } else if (entry.target.classList.contains('project-card')) {
          entry.target.classList.add('animate-flip-y', 'hover-lift');
        } else if (entry.target.classList.contains('stat-card')) {
          entry.target.classList.add('animate-scale-bounce', 'animate-pulse');
        } else if (entry.target.classList.contains('testimonial-card')) {
          entry.target.classList.add('animate-morph-in');
        }
        
        // Add sparkle effect to important elements
        if (entry.target.classList.contains('hero-title') || entry.target.classList.contains('section-title')) {
          addSparkleEffect(entry.target);
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
  });
  
  animatedElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.08}s`;
    observer.observe(element);
  });
  
  // Enhanced staggered animations
  const staggeredContainers = document.querySelectorAll('.stagger-children, .stats-grid, .services-grid, .projects-grid, .testimonials-grid');
  staggeredContainers.forEach(container => {
    const items = container.children;
    Array.from(items).forEach((item, index) => {
      item.style.animationDelay = `${index * 0.12}s`;
      item.classList.add('animate-fade-in-up', 'hover-lift');
    });
  });
}

// Enhanced hover effects with premium interactions
function initHoverEffects() {
  // Premium button hover effects
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.classList.add('hover-lift', 'hover-glow');
    
    button.addEventListener('mouseenter', function() {
      this.style.willChange = 'transform, box-shadow';
      this.classList.add('animate-glow-pulse');
      createRippleEffect(this);
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.willChange = 'auto';
      this.classList.remove('animate-glow-pulse');
    });
  });
  
  // Enhanced card hover effects
  const cards = document.querySelectorAll('.glass-card, .service-card, .project-card, .stat-card, .testimonial-card');
  cards.forEach(card => {
    card.classList.add('hover-lift', 'hover-tilt');
    
    card.addEventListener('mouseenter', function() {
      this.style.willChange = 'transform, box-shadow';
      this.classList.add('animate-glow-pulse');
      addFloatingParticles(this);
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.willChange = 'auto';
      this.classList.remove('animate-glow-pulse');
      removeFloatingParticles(this);
    });
  });
  
  // Premium navigation link effects
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.classList.add('animate-text-glow');
      createTextSparkle(this);
    });
    
    link.addEventListener('mouseleave', function() {
      this.classList.remove('animate-text-glow');
    });
  });
  
  // Enhanced service icon effects
  const serviceIcons = document.querySelectorAll('.service-icon');
  serviceIcons.forEach(icon => {
    icon.classList.add('hover-rotate', 'animate-liquid-morph');
    
    icon.addEventListener('mouseenter', function() {
      this.classList.add('animate-rainbow-glow');
    });
    
    icon.addEventListener('mouseleave', function() {
      this.classList.remove('animate-rainbow-glow');
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

// Initialize particle effects
function initParticleEffects() {
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    createFloatingParticles(heroSection);
  }
}

// Create floating particles
function createFloatingParticles(container) {
  const particleCount = 20;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(245, 158, 11, ${Math.random() * 0.5 + 0.2});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 10 + 15}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 1;
    `;
    
    container.appendChild(particle);
  }
}

// Initialize counter animations
function initCounterAnimations() {
  const counters = document.querySelectorAll('[data-target]');
  
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        animateCounter(counter, target);
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

// Animate counter numbers
function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const duration = 2000;
  const stepTime = duration / 100;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, stepTime);
}

// Initialize magnetic effects for interactive elements
function initMagneticEffects() {
  const magneticElements = document.querySelectorAll('.btn, .brand-logo, .theme-toggle');
  
  magneticElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.1;
      const moveY = y * 0.1;
      
      this.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translate(0, 0)';
    });
  });
}

// Update animations based on current theme
function updateAnimationsForTheme(theme) {
  // Adjust animation properties based on theme
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.style.setProperty('--animation-shadow-color', 'rgba(15, 23, 42, 0.1)');
    root.style.setProperty('--particle-color', 'rgba(245, 158, 11, 0.3)');
  } else {
    root.style.setProperty('--animation-shadow-color', 'rgba(245, 158, 11, 0.2)');
    root.style.setProperty('--particle-color', 'rgba(245, 158, 11, 0.4)');
  }
  
  // Update existing particles
  const particles = document.querySelectorAll('.floating-particle');
  particles.forEach(particle => {
    const opacity = theme === 'light' ? Math.random() * 0.3 + 0.1 : Math.random() * 0.5 + 0.2;
    particle.style.background = `rgba(245, 158, 11, ${opacity})`;
  });
}
// Initialize morphing effects
function initMorphingEffects() {
  const morphElements = document.querySelectorAll('.brand-logo, .service-icon, .hero-title');
  
  morphElements.forEach(element => {
    element.classList.add('animate-liquid-morph');
  });
}

// Initialize glow effects
function initGlowEffects() {
  const glowElements = document.querySelectorAll('.gradient-text, .hero-title, .section-title');
  
  glowElements.forEach(element => {
    element.classList.add('animate-text-glow');
  });
  
  // Add dynamic glow based on scroll position
  window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const glowIntensity = Math.sin(scrollPercent * Math.PI * 4) * 0.5 + 0.5;
    
    document.documentElement.style.setProperty('--glow-intensity', glowIntensity);
  });
}

// Initialize parallax effects
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.hero-background, .hero-particles');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    parallaxElements.forEach(element => {
      element.style.transform = `translateY(${rate}px)`;
    });
  });
}

// Create ripple effect on button click
function createRippleEffect(element) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple-effect';
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Add sparkle effect to elements
function addSparkleEffect(element) {
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--color-primary);
      border-radius: 50%;
      pointer-events: none;
      animation: sparkle 2s ease-in-out infinite;
      animation-delay: ${i * 0.2}s;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
    `;
    
    element.style.position = 'relative';
    element.appendChild(sparkle);
    
    setTimeout(() => {
      sparkle.remove();
    }, 2000);
  }
}

// Create text sparkle effect
function createTextSparkle(element) {
  const sparkle = document.createElement('span');
  sparkle.textContent = '✨';
  sparkle.style.cssText = `
    position: absolute;
    font-size: 12px;
    animation: sparkle 1s ease-out;
    pointer-events: none;
    left: ${Math.random() * 100}%;
    top: -20px;
  `;
  
  element.style.position = 'relative';
  element.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
}

// Add floating particles to elements
function addFloatingParticles(element) {
  for (let i = 0; i < 3; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle-hover';
    particle.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      background: var(--color-primary);
      border-radius: 50%;
      opacity: 0.7;
      animation: particleFloat 3s ease-in-out infinite;
      animation-delay: ${i * 0.5}s;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      pointer-events: none;
    `;
    
    element.appendChild(particle);
  }
}

// Remove floating particles
function removeFloatingParticles(element) {
  const particles = element.querySelectorAll('.floating-particle-hover');
  particles.forEach(particle => {
    particle.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      particle.remove();
    }, 300);
  });
}

// Enhanced magnetic effects with 3D transforms
function initMagneticEffects() {
  const magneticElements = document.querySelectorAll('.btn, .brand-logo, .theme-toggle, .service-card, .project-card');
  
  magneticElements.forEach(element => {
    element.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = x * 0.15;
      const moveY = y * 0.15;
      const rotateX = y * 0.05;
      const rotateY = x * -0.05;
      
      this.style.transform = `
        translate3d(${moveX}px, ${moveY}px, 0) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        scale(1.02)
      `;
    });
    
    element.addEventListener('mouseleave', function() {
      this.style.transform = 'translate3d(0, 0, 0) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// Enhanced particle effects with dynamic colors
function initParticleEffects() {
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    createAdvancedParticles(heroSection);
  }
  
  // Add interactive particles that follow mouse
  document.addEventListener('mousemove', createMouseParticles);
}

// Create advanced floating particles
function createAdvancedParticles(container) {
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'advanced-particle';
    
    const size = Math.random() * 6 + 2;
    const hue = Math.random() * 60 + 15; // Orange to yellow range
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: hsl(${hue}, 80%, 60%);
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 15 + 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 1;
      opacity: ${Math.random() * 0.6 + 0.2};
      box-shadow: 0 0 ${size * 2}px hsl(${hue}, 80%, 60%);
    `;
    
    container.appendChild(particle);
  }
}

// Create mouse-following particles
let mouseParticleTimeout;
function createMouseParticles(e) {
  clearTimeout(mouseParticleTimeout);
  
  mouseParticleTimeout = setTimeout(() => {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: var(--color-primary);
      border-radius: 50%;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      pointer-events: none;
      z-index: 9999;
      animation: mouseParticleFade 1s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1000);
  }, 50);
}

// Enhanced counter animations with easing
function animateCounter(element, target) {
  let current = 0;
  const duration = 2500;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    current = Math.floor(target * easeOutQuart);
    
    element.textContent = current;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
      element.classList.add('animate-glow-pulse');
    }
  }
  
  requestAnimationFrame(updateCounter);
}

// Update animations based on current theme with enhanced effects
function updateAnimationsForTheme(theme) {
  const root = document.documentElement;
  
  if (theme === 'light') {
    root.style.setProperty('--animation-shadow-color', 'rgba(24, 24, 27, 0.1)');
    root.style.setProperty('--particle-color', 'rgba(255, 107, 53, 0.4)');
    root.style.setProperty('--glow-color', 'rgba(255, 107, 53, 0.3)');
  } else {
    root.style.setProperty('--animation-shadow-color', 'rgba(255, 107, 53, 0.2)');
    root.style.setProperty('--particle-color', 'rgba(255, 107, 53, 0.6)');
    root.style.setProperty('--glow-color', 'rgba(255, 107, 53, 0.5)');
  }
  
  // Update existing particles with new theme colors
  const particles = document.querySelectorAll('.floating-particle, .advanced-particle');
  particles.forEach(particle => {
    const opacity = theme === 'light' ? Math.random() * 0.4 + 0.1 : Math.random() * 0.6 + 0.2;
    particle.style.opacity = opacity;
  });
}

// Add CSS for new animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes mouseParticleFade {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(0);
      opacity: 0;
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: scale(0);
    }
  }
`;
document.head.appendChild(additionalStyles);