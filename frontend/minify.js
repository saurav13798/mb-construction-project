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
    'theme-switcher.js'
];

// CSS files to minify
const cssFiles = ['style.css', 'animations.css'];

// Minify JS files
jsFiles.forEach(file => {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.js', '.min.js'));
    console.log(`Minifying ${file}...`);
    try {
        execSync(`npx terser "${inputPath}" -o "${outputPath}" -c -m`);
        console.log(`✓ Created ${file.replace('.js', '.min.js')}`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
    }
});

// Minify CSS files
cssFiles.forEach(file => {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.css', '.min.css'));
    console.log(`Minifying ${file}...`);
    try {
        execSync(`npx cleancss -o "${outputPath}" "${inputPath}"`);
        console.log(`✓ Created ${file.replace('.css', '.min.css')}`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
    }
});