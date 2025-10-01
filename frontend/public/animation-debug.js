// Animation Debug - Development helper for MB Construction website

// Animation debugging and performance monitoring
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Animation debug mode enabled');
        initAnimationDebug();
    }
});

function initAnimationDebug() {
    // Debug animation performance
    let animationCount = 0;
    
    // Monitor CSS animations
    document.addEventListener('animationstart', function(e) {
        animationCount++;
        console.log(`Animation started: ${e.animationName} (Total active: ${animationCount})`);
    });
    
    document.addEventListener('animationend', function(e) {
        animationCount--;
        console.log(`Animation ended: ${e.animationName} (Total active: ${animationCount})`);
    });
    
    // Monitor scroll performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                console.log('Scroll event processed at:', window.scrollY);
                scrollTimeout = null;
            }, 100);
        }
    });
    
    // Add debug info to console
    console.log('Animation debug initialized. Monitoring CSS animations and scroll performance.');
}