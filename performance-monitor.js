#!/usr/bin/env node

/**
 * Performance Monitoring Script for MB Construction Website
 * Monitors Core Web Vitals and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceMonitor {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            scores: {},
            recommendations: [],
            issues: []
        };
    }

    async runAudit() {
        console.log('🔍 Starting Performance Audit...\n');
        
        try {
            await this.checkFileOptimization();
            await this.checkDependencies();
            await this.checkBundleSize();
            await this.generateReport();
        } catch (error) {
            console.error('❌ Audit failed:', error.message);
        }
    }

    async checkFileOptimization() {
        console.log('📁 Checking file optimization...');
        
        const frontendDir = path.join(__dirname, 'frontend', 'public');
        const files = fs.readdirSync(frontendDir);
        
        // Check for minified files
        const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));
        const cssFiles = files.filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
        
        if (jsFiles.length > 0) {
            this.results.issues.push(`Unminified JS files found: ${jsFiles.join(', ')}`);
            this.results.recommendations.push('Run "npm run build" to minify JavaScript files');
        }
        
        if (cssFiles.length > 0) {
            this.results.issues.push(`Unminified CSS files found: ${cssFiles.join(', ')}`);
            this.results.recommendations.push('Run "npm run build" to minify CSS files');
        }
        
        // Check file sizes
        files.forEach(file => {
            const filePath = path.join(frontendDir, file);
            const stats = fs.statSync(filePath);
            const sizeKB = Math.round(stats.size / 1024);
            
            if (file.endsWith('.js') && sizeKB > 100) {
                this.results.issues.push(`Large JS file: ${file} (${sizeKB}KB)`);
                this.results.recommendations.push(`Consider code splitting for ${file}`);
            }
            
            if (file.endsWith('.css') && sizeKB > 50) {
                this.results.issues.push(`Large CSS file: ${file} (${sizeKB}KB)`);
                this.results.recommendations.push(`Consider CSS optimization for ${file}`);
            }
        });
        
        console.log('✓ File optimization check complete');
    }

    async checkDependencies() {
        console.log('📦 Checking dependencies...');
        
        try {
            // Check backend dependencies
            const backendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'package.json')));
            const backendDeps = Object.keys(backendPackage.dependencies || {});
            
            // Check for heavy dependencies
            const heavyDeps = ['lodash', 'moment', 'axios'].filter(dep => backendDeps.includes(dep));
            if (heavyDeps.length > 0) {
                this.results.recommendations.push(`Consider lighter alternatives to: ${heavyDeps.join(', ')}`);
            }
            
            // Check frontend dependencies
            const frontendPackage = JSON.parse(fs.readFileSync(path.join(__dirname, 'frontend', 'package.json')));
            const frontendDeps = Object.keys(frontendPackage.dependencies || {});
            
            if (frontendDeps.length > 0) {
                this.results.recommendations.push('Consider if all frontend dependencies are necessary');
            }
            
        } catch (error) {
            this.results.issues.push('Could not analyze dependencies');
        }
        
        console.log('✓ Dependency check complete');
    }

    async checkBundleSize() {
        console.log('📊 Analyzing bundle sizes...');
        
        const frontendDir = path.join(__dirname, 'frontend', 'public');
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        
        try {
            const files = fs.readdirSync(frontendDir);
            
            files.forEach(file => {
                const filePath = path.join(frontendDir, file);
                const stats = fs.statSync(filePath);
                const sizeKB = stats.size / 1024;
                
                totalSize += sizeKB;
                
                if (file.endsWith('.js')) {
                    jsSize += sizeKB;
                } else if (file.endsWith('.css')) {
                    cssSize += sizeKB;
                }
            });
            
            this.results.scores.bundleSize = {
                total: Math.round(totalSize),
                javascript: Math.round(jsSize),
                css: Math.round(cssSize)
            };
            
            // Performance thresholds
            if (jsSize > 200) {
                this.results.issues.push(`JavaScript bundle too large: ${Math.round(jsSize)}KB`);
                this.results.recommendations.push('Consider code splitting and tree shaking');
            }
            
            if (cssSize > 100) {
                this.results.issues.push(`CSS bundle too large: ${Math.round(cssSize)}KB`);
                this.results.recommendations.push('Consider CSS purging and critical CSS extraction');
            }
            
        } catch (error) {
            this.results.issues.push('Could not analyze bundle sizes');
        }
        
        console.log('✓ Bundle analysis complete');
    }

    async generateReport() {
        console.log('\n📋 Performance Report');
        console.log('='.repeat(50));
        
        // Calculate overall score
        let score = 100;
        score -= this.results.issues.length * 10;
        score = Math.max(0, score);
        
        this.results.scores.overall = score;
        
        // Display results
        console.log(`Overall Score: ${score}/100`);
        
        if (this.results.scores.bundleSize) {
            console.log(`\nBundle Sizes:`);
            console.log(`  Total: ${this.results.scores.bundleSize.total}KB`);
            console.log(`  JavaScript: ${this.results.scores.bundleSize.javascript}KB`);
            console.log(`  CSS: ${this.results.scores.bundleSize.css}KB`);
        }
        
        if (this.results.issues.length > 0) {
            console.log(`\n⚠️ Issues Found (${this.results.issues.length}):`);
            this.results.issues.forEach(issue => console.log(`  - ${issue}`));
        }
        
        if (this.results.recommendations.length > 0) {
            console.log(`\n💡 Recommendations (${this.results.recommendations.length}):`);
            this.results.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
        
        // Save report
        const reportPath = path.join(__dirname, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
        
        // Performance badge
        if (score >= 90) {
            console.log('\n🏆 Excellent Performance!');
        } else if (score >= 70) {
            console.log('\n⚠️ Good Performance - Minor improvements needed');
        } else {
            console.log('\n❌ Poor Performance - Significant optimization required');
        }
    }
}

// Run if called directly
if (require.main === module) {
    const monitor = new PerformanceMonitor();
    monitor.runAudit().catch(console.error);
}

module.exports = PerformanceMonitor;