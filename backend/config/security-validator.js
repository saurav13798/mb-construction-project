const crypto = require('crypto');

class SecurityValidator {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    validateJWTSecurity() {
        const jwtSecret = process.env.JWT_SECRET;
        const result = {
            isValid: false,
            strength: 'weak',
            issues: [],
            recommendations: []
        };

        if (!jwtSecret) {
            result.issues.push('JWT_SECRET is not set');
            result.recommendations.push('Set JWT_SECRET environment variable');
            return result;
        }

        // Check length
        if (jwtSecret.length < 32) {
            result.issues.push('JWT secret is too short (minimum 32 characters)');
            result.recommendations.push('Use a JWT secret with at least 32 characters');
        }

        // Check for common weak secrets
        const weakSecrets = [
            'secret',
            'your-secret-key',
            'development-secret',
            'jwt-secret',
            'mysecret',
            '123456',
            'password'
        ];

        if (weakSecrets.includes(jwtSecret.toLowerCase())) {
            result.issues.push('JWT secret is using a common/weak value');
            result.recommendations.push('Generate a cryptographically secure random secret');
        }

        // Check entropy (basic check for randomness)
        const entropy = this.calculateEntropy(jwtSecret);
        if (entropy < 4.0) {
            result.issues.push('JWT secret has low entropy (not random enough)');
            result.recommendations.push('Use a randomly generated secret with high entropy');
        }

        // Determine strength
        if (result.issues.length === 0) {
            result.strength = 'strong';
            result.isValid = true;
        } else if (jwtSecret.length >= 16 && entropy > 3.0) {
            result.strength = 'medium';
            result.isValid = !this.isProduction; // Medium is acceptable in development
        }

        return result;
    }

    validateEmailSecurity() {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        
        const result = {
            isValid: false,
            configured: false,
            issues: [],
            recommendations: []
        };

        if (!emailUser || !emailPass) {
            result.issues.push('Email configuration is incomplete');
            result.recommendations.push('Set EMAIL_USER and EMAIL_PASS for email functionality');
            return result;
        }

        result.configured = true;

        // Check for placeholder values
        const placeholders = [
            'your-email@gmail.com',
            'your-app-password',
            'example@email.com',
            'password',
            'your-password'
        ];

        if (placeholders.includes(emailUser) || placeholders.includes(emailPass)) {
            result.issues.push('Email configuration uses placeholder values');
            result.recommendations.push('Replace placeholder values with actual email credentials');
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailUser)) {
            result.issues.push('EMAIL_USER is not a valid email format');
            result.recommendations.push('Use a valid email address for EMAIL_USER');
        }

        // Check password strength (basic)
        if (emailPass.length < 8) {
            result.issues.push('Email password appears to be too short');
            result.recommendations.push('Use a strong app password for email authentication');
        }

        result.isValid = result.issues.length === 0;
        return result;
    }

    validateCORSSettings() {
        const frontendUrl = process.env.FRONTEND_URL;
        const result = {
            isValid: false,
            issues: [],
            recommendations: []
        };

        if (!frontendUrl) {
            result.issues.push('FRONTEND_URL is not configured');
            result.recommendations.push('Set FRONTEND_URL for proper CORS configuration');
            return result;
        }

        // Check for localhost in production
        if (this.isProduction && frontendUrl.includes('localhost')) {
            result.issues.push('Using localhost URL in production environment');
            result.recommendations.push('Use production domain URL instead of localhost');
        }

        // Check for HTTP in production
        if (this.isProduction && frontendUrl.startsWith('http://')) {
            result.issues.push('Using HTTP instead of HTTPS in production');
            result.recommendations.push('Use HTTPS for production frontend URL');
        }

        // Validate URL format
        try {
            new URL(frontendUrl);
        } catch (error) {
            result.issues.push('FRONTEND_URL is not a valid URL');
            result.recommendations.push('Provide a valid URL for FRONTEND_URL');
        }

        result.isValid = result.issues.length === 0;
        return result;
    }

    generateSecurityReport() {
        const jwtSecurity = this.validateJWTSecurity();
        const emailSecurity = this.validateEmailSecurity();
        const corsSecurity = this.validateCORSSettings();

        const report = {
            overall: {
                score: 0,
                status: 'insecure',
                criticalIssues: 0,
                warnings: 0
            },
            jwt: jwtSecurity,
            email: emailSecurity,
            cors: corsSecurity,
            recommendations: []
        };

        // Calculate overall score
        let score = 0;
        let maxScore = 0;

        // JWT scoring (40% of total)
        maxScore += 40;
        if (jwtSecurity.strength === 'strong') score += 40;
        else if (jwtSecurity.strength === 'medium') score += 20;

        // Email scoring (30% of total)
        maxScore += 30;
        if (emailSecurity.isValid) score += 30;
        else if (emailSecurity.configured) score += 15;

        // CORS scoring (30% of total)
        maxScore += 30;
        if (corsSecurity.isValid) score += 30;

        report.overall.score = Math.round((score / maxScore) * 100);

        // Determine status
        if (report.overall.score >= 80) {
            report.overall.status = 'secure';
        } else if (report.overall.score >= 60) {
            report.overall.status = 'moderate';
        } else {
            report.overall.status = 'insecure';
        }

        // Count issues
        [jwtSecurity, emailSecurity, corsSecurity].forEach(section => {
            section.issues.forEach(issue => {
                if (issue.includes('not set') || issue.includes('placeholder') || issue.includes('weak')) {
                    report.overall.criticalIssues++;
                } else {
                    report.overall.warnings++;
                }
            });
            report.recommendations.push(...section.recommendations);
        });

        // Remove duplicate recommendations
        report.recommendations = [...new Set(report.recommendations)];

        return report;
    }

    calculateEntropy(str) {
        const freq = {};
        for (let char of str) {
            freq[char] = (freq[char] || 0) + 1;
        }

        let entropy = 0;
        const len = str.length;
        
        for (let char in freq) {
            const p = freq[char] / len;
            entropy -= p * Math.log2(p);
        }

        return entropy;
    }

    generateSecureJWTSecret() {
        return crypto.randomBytes(32).toString('hex');
    }

    generateSecurityGuidelines() {
        return {
            jwt: {
                title: 'JWT Security Best Practices',
                guidelines: [
                    'Use a cryptographically secure random secret of at least 32 characters',
                    'Never use predictable or common secrets',
                    'Rotate JWT secrets periodically in production',
                    'Store secrets securely using environment variables',
                    'Use different secrets for different environments'
                ]
            },
            email: {
                title: 'Email Security Best Practices',
                guidelines: [
                    'Use app-specific passwords instead of regular passwords',
                    'Enable two-factor authentication on email accounts',
                    'Use dedicated email accounts for application notifications',
                    'Regularly rotate email credentials',
                    'Monitor email account access logs'
                ]
            },
            cors: {
                title: 'CORS Security Best Practices',
                guidelines: [
                    'Specify exact origins instead of using wildcards',
                    'Use HTTPS URLs in production environments',
                    'Regularly review and update allowed origins',
                    'Implement proper preflight request handling',
                    'Monitor CORS-related errors in logs'
                ]
            }
        };
    }
}

module.exports = SecurityValidator;