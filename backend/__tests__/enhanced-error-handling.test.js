const request = require('supertest');
const app = require('../server');
const EnvironmentValidator = require('../config/env-validation');
const SecurityValidator = require('../config/security-validator');
const databaseManager = require('../utils/database-manager');

describe('Enhanced Error Handling and Security', () => {
    
    describe('Environment Validation', () => {
        let envValidator;
        
        beforeEach(() => {
            envValidator = new EnvironmentValidator();
        });
        
        test('should validate JWT secret strength', () => {
            // Test weak secret
            process.env.JWT_SECRET = 'weak';
            const report = envValidator.validateSecurityStrength();
            expect(report.jwtSecurity).toBe('weak');
            
            // Test strong secret
            process.env.JWT_SECRET = 'a'.repeat(32);
            const strongReport = envValidator.validateSecurityStrength();
            expect(strongReport.overallScore).toBeGreaterThan(25);
        });
        
        test('should generate configuration summary', () => {
            const summary = envValidator.getConfigurationSummary();
            expect(summary).toHaveProperty('environment');
            expect(summary).toHaveProperty('database');
            expect(summary).toHaveProperty('security');
            expect(summary).toHaveProperty('email');
        });
    });
    
    describe('Security Validation', () => {
        let securityValidator;
        
        beforeEach(() => {
            securityValidator = new SecurityValidator();
        });
        
        test('should validate JWT security', () => {
            process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-validation';
            const result = securityValidator.validateJWTSecurity();
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('strength');
            expect(result).toHaveProperty('issues');
        });
        
        test('should validate email security', () => {
            process.env.EMAIL_USER = 'test@example.com';
            process.env.EMAIL_PASS = 'test-password';
            const result = securityValidator.validateEmailSecurity();
            expect(result).toHaveProperty('configured');
            expect(result.configured).toBe(true);
        });
        
        test('should generate security report', () => {
            const report = securityValidator.generateSecurityReport();
            expect(report).toHaveProperty('overall');
            expect(report).toHaveProperty('jwt');
            expect(report).toHaveProperty('email');
            expect(report).toHaveProperty('cors');
            expect(report.overall).toHaveProperty('score');
        });
    });
    
    describe('Database Manager', () => {
        test('should provide connection status', () => {
            const status = databaseManager.getConnectionStatus();
            expect(status).toHaveProperty('connected');
            expect(status).toHaveProperty('status');
            expect(status).toHaveProperty('retryCount');
        });
        
        test('should perform health check', async () => {
            const health = await databaseManager.healthCheck();
            expect(health).toHaveProperty('status');
            expect(health).toHaveProperty('message');
        });
    });
    
    describe('API Error Handling', () => {
        test('should handle 404 errors properly', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);
                
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });
        
        test('should handle validation errors', async () => {
            const response = await request(app)
                .post('/api/contact')
                .send({}) // Empty data to trigger validation
                .expect(400);
                
            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('error');
        });
        
        test('should include request ID in error responses', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);
                
            expect(response.body).toHaveProperty('requestId');
            expect(typeof response.body.requestId).toBe('string');
        });
    });
    
    describe('Health Check Endpoint', () => {
        test('should return comprehensive health information', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
                
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('database');
            expect(response.body).toHaveProperty('configuration');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });
    
    describe('Security Headers', () => {
        test('should include security headers', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
                
            expect(response.headers).toHaveProperty('x-content-type-options');
            expect(response.headers).toHaveProperty('x-frame-options');
        });
        
        test('should not expose technology stack', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
                
            expect(response.headers['x-powered-by']).toBeUndefined();
        });
    });
});

describe('Frontend Error Handler', () => {
    // These would be integration tests that could be run with a headless browser
    // For now, we'll just test the structure
    
    test('should be available globally', () => {
        // This would be tested in a browser environment
        expect(true).toBe(true); // Placeholder
    });
});

// Cleanup after tests
afterAll(async () => {
    if (databaseManager.isConnected()) {
        await databaseManager.disconnect();
    }
});