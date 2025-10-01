const crypto = require('crypto');

class EnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.recommendations = [];
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    validateEnvironment() {
        console.log('🔍 Starting comprehensive environment validation...');
        
        this.validateRequiredVariables();
        this.validateSecuritySettings();
        this.validateDatabaseConfiguration();
        this.validateEmailConfiguration();
        this.validateServerConfiguration();
        
        this.generateReport();
        
        if (this.errors.length > 0) {
            console.error('❌ Environment validation failed with errors:');
            this.errors.forEach(error => console.error(`  - ${error}`));
            process.exit(1);
        }
        
        if (this.warnings.length > 0) {
            console.warn('⚠️  Environment validation completed with warnings:');
            this.warnings.forEach(warning => console.warn(`  - ${warning}`));
        }
        
        console.log('✅ Environment validation completed successfully');
    }

    validateRequiredVariables() {
        const required = ['NODE_ENV', 'PORT', 'MONGODB_URI'];
        
        required.forEach(variable => {
            if (!process.env[variable]) {
                this.errors.push(`Missing required environment variable: ${variable}`);
            }
        });
    }

    validateSecuritySettings() {
        // JWT Secret validation
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            this.errors.push('JWT_SECRET is required for authentication');
        } else if (jwtSecret.length < 32) {
            this.errors.push('JWT_SECRET must be at least 32 characters long for security');
            this.recommendations.push('Generate a secure JWT secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
        } else if (jwtSecret === 'your-secret-key' || jwtSecret === 'development-secret') {
            if (this.isProduction) {
                this.errors.push('JWT_SECRET cannot use default/placeholder values in production');
            } else {
                this.warnings.push('JWT_SECRET is using a default value - change for production');
            }
        }

        // CORS validation
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl) {
            this.warnings.push('FRONTEND_URL not set - CORS may not work properly');
        } else if (frontendUrl.includes('localhost') && this.isProduction) {
            this.warnings.push('FRONTEND_URL contains localhost in production environment');
        }
    }

    validateDatabaseConfiguration() {
        const mongoUri = process.env.MONGODB_URI;
        if (mongoUri) {
            if (mongoUri.includes('localhost') && this.isProduction) {
                this.warnings.push('Using localhost MongoDB URI in production environment');
            }
            if (!mongoUri.includes('mongodb://') && !mongoUri.includes('mongodb+srv://')) {
                this.errors.push('MONGODB_URI must be a valid MongoDB connection string');
            }
        }
    }

    validateEmailConfiguration() {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        if (!emailUser || !emailPass) {
            this.warnings.push('Email configuration incomplete - email functionality will be disabled');
            this.recommendations.push('Set EMAIL_USER and EMAIL_PASS for email notifications');
        } else {
            if (emailUser === 'your-email@gmail.com' || emailPass === 'your-app-password') {
                if (this.isProduction) {
                    this.errors.push('Email configuration cannot use placeholder values in production');
                } else {
                    this.warnings.push('Email configuration is using placeholder values');
                }
            }
        }
    }

    validateServerConfiguration() {
        const port = process.env.PORT;
        if (port && (isNaN(port) || port < 1 || port > 65535)) {
            this.errors.push('PORT must be a valid number between 1 and 65535');
        }

        // File upload configuration
        const maxFileSize = process.env.MAX_FILE_SIZE;
        if (maxFileSize && isNaN(maxFileSize)) {
            this.warnings.push('MAX_FILE_SIZE should be a number (bytes)');
        }
    }

    generateReport() {
        const summary = this.getConfigurationSummary();
        
        console.log('\n📊 Configuration Summary:');
        console.log(`Environment: ${summary.environment}`);
        console.log(`Database: ${summary.database}`);
        console.log(`Security: ${summary.security}`);
        console.log(`Email: ${summary.email}`);
        console.log(`Server: ${summary.server}`);
        
        if (this.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            this.recommendations.forEach(rec => console.log(`  - ${rec}`));
        }
    }

    getConfigurationSummary() {
        return {
            environment: process.env.NODE_ENV || 'development',
            database: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
            security: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
            email: (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? 'Configured' : 'Not configured',
            server: `Port ${process.env.PORT || 3000}`
        };
    }

    validateSecurityStrength() {
        const report = {
            jwtSecurity: 'weak',
            emailSecurity: 'weak',
            overallScore: 0
        };

        // JWT Security Assessment
        const jwtSecret = process.env.JWT_SECRET;
        if (jwtSecret && jwtSecret.length >= 32 && !['your-secret-key', 'development-secret'].includes(jwtSecret)) {
            report.jwtSecurity = 'strong';
            report.overallScore += 50;
        } else if (jwtSecret && jwtSecret.length >= 16) {
            report.jwtSecurity = 'medium';
            report.overallScore += 25;
        }

        // Email Security Assessment
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        if (emailUser && emailPass && !['your-email@gmail.com', 'your-app-password'].includes(emailUser)) {
            report.emailSecurity = 'strong';
            report.overallScore += 50;
        } else if (emailUser && emailPass) {
            report.emailSecurity = 'medium';
            report.overallScore += 25;
        }

        return report;
    }

    generateSecureJWTSecret() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = EnvironmentValidator;