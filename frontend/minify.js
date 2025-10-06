const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// List of JS files to minify
const jsFiles = [
    'admin-dashboard.js',
    'animations.js',
    'app.js',
    'contact-form-fix.js',
    'theme-switcher.js',
    'animation-debug.js',
    'js/error-handler.js'
];

// CSS files to minify
const cssFiles = ['style.css', 'animations.css'];

// Minify JS files with enhanced options
jsFiles.forEach(file => {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.js', '.min.js'));
    
    // Skip if file doesn't exist
    if (!fs.existsSync(inputPath)) {
        console.log(`⚠️ Skipping ${file} (file not found)`);
        return;
    }
    
    console.log(`Minifying ${file}...`);
    try {
        // Enhanced terser options for better compression
        execSync(`npx terser "${inputPath}" -o "${outputPath}" -c drop_console=true,drop_debugger=true,pure_funcs=['console.log','console.debug'] -m --source-map`);
        console.log(`✓ Created ${file.replace('.js', '.min.js')}`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
    }
});

// Minify CSS files with enhanced options
cssFiles.forEach(file => {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.css', '.min.css'));
    
    // Skip if file doesn't exist
    if (!fs.existsSync(inputPath)) {
        console.log(`⚠️ Skipping ${file} (file not found)`);
        return;
    }
    
    console.log(`Minifying ${file}...`);
    try {
        // Enhanced cleancss options for better compression
        execSync(`npx cleancss -O2 --source-map -o "${outputPath}" "${inputPath}"`);
        console.log(`✓ Created ${file.replace('.css', '.min.css')}`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
    }
});