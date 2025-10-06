// MB Construction - Admin Registration JavaScript

class AdminRegistration {
    constructor() {
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Admin Registration Initialized');
        
        // Bind event listeners
        this.bindEvents();
        
        // Check if user is already logged in
        this.checkExistingAuth();
    }
    
    bindEvents() {
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }
        
        // Real-time validation
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });
        
        // Password confirmation validation
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }
    
    checkExistingAuth() {
        const token = localStorage.getItem('admin_token');
        if (token) {
            this.showMessage('You are already logged in as an admin.', 'success');
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 2000);
        }
    }
    
    async handleRegistration(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        this.setButtonLoading(submitBtn, true);
        
        // Clear previous messages
        this.hideMessages();
        
        // Validate form
        if (!this.validateForm(form, formData)) {
            this.setButtonLoading(submitBtn, false);
            return;
        }
        
        // Prepare registration data
        const registrationData = {
            username: formData.get('username').trim(),
            email: formData.get('email')?.trim() || '',
            password: formData.get('password'),
            registrationCode: formData.get('registrationCode').trim()
        };
        
        try {
            const response = await fetch(`${this.apiUrl}/api/admin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showMessage('Admin account created successfully! Redirecting to login...', 'success');
                form.reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 2000);
                
            } else {
                // Handle validation errors
                if (result.errors && Array.isArray(result.errors)) {
                    this.handleValidationErrors(result.errors);
                } else {
                    throw new Error(result.message || 'Registration failed');
                }
            }
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            
            let errorMessage = 'Registration failed. Please try again.';
            
            // Handle specific error cases
            if (error.message.includes('Invalid registration code')) {
                errorMessage = 'Invalid registration code. Please contact the system administrator.';
            } else if (error.message.includes('Username already taken')) {
                errorMessage = 'Username is already taken. Please choose a different username.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            this.showMessage(errorMessage, 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
        }
    }
    
    validateForm(form, formData) {
        let isValid = true;
        
        // Clear previous errors
        this.clearAllFieldErrors();
        
        // Username validation
        const username = formData.get('username')?.trim();
        if (!username || username.length < 3 || username.length > 50) {
            this.showFieldError('username', 'Username must be 3-50 characters long');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            this.showFieldError('username', 'Username can only contain letters, numbers, hyphens, and underscores');
            isValid = false;
        }
        
        // Email validation (optional)
        const email = formData.get('email')?.trim();
        if (email && !this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Password validation
        const password = formData.get('password');
        if (!password || password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters long');
            isValid = false;
        } else if (password.length > 128) {
            this.showFieldError('password', 'Password must be less than 128 characters');
            isValid = false;
        }
        
        // Password confirmation validation
        const confirmPassword = formData.get('confirmPassword');
        if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }
        
        // Registration code validation
        const registrationCode = formData.get('registrationCode')?.trim();
        if (!registrationCode) {
            this.showFieldError('registrationCode', 'Registration code is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        
        this.clearFieldError(field);
        
        switch (fieldName) {
            case 'username':
                if (!value) {
                    this.showFieldError(field, 'Username is required');
                    return false;
                } else if (value.length < 3 || value.length > 50) {
                    this.showFieldError(field, 'Username must be 3-50 characters long');
                    return false;
                } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
                    this.showFieldError(field, 'Username can only contain letters, numbers, hyphens, and underscores');
                    return false;
                }
                break;
                
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'password':
                if (!value) {
                    this.showFieldError(field, 'Password is required');
                    return false;
                } else if (value.length < 6) {
                    this.showFieldError(field, 'Password must be at least 6 characters long');
                    return false;
                } else if (value.length > 128) {
                    this.showFieldError(field, 'Password must be less than 128 characters');
                    return false;
                }
                // Trigger password match validation if confirm password has value
                this.validatePasswordMatch();
                break;
                
            case 'confirmPassword':
                this.validatePasswordMatch();
                break;
                
            case 'registrationCode':
                if (!value) {
                    this.showFieldError(field, 'Registration code is required');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword');
        const confirmValue = confirmPassword.value;
        
        if (confirmValue && password !== confirmValue) {
            this.showFieldError(confirmPassword, 'Passwords do not match');
            return false;
        } else if (confirmValue && password === confirmValue) {
            this.clearFieldError(confirmPassword);
            return true;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showFieldError(field, message) {
        if (typeof field === 'string') {
            field = document.getElementById(field);
        }
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            
            // Remove existing error message
            const existingError = formGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            formGroup.appendChild(errorElement);
        }
    }
    
    clearFieldError(field) {
        if (typeof field === 'string') {
            field = document.getElementById(field);
        }
        
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorElement = formGroup.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
    
    clearAllFieldErrors() {
        const errorGroups = document.querySelectorAll('.form-group.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
            const errorElement = group.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        });
    }
    
    handleValidationErrors(errors) {
        errors.forEach(error => {
            const field = error.path || error.param;
            if (field) {
                this.showFieldError(field, error.msg || error.message);
            }
        });
        
        // Also show general error message
        this.showMessage('Please fix the validation errors below.', 'error');
    }
    
    showMessage(message, type = 'info') {
        this.hideMessages();
        
        const messageElement = document.getElementById(`${type}-message`);
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.remove('hidden');
            
            // Auto-hide after 5 seconds for non-success messages
            if (type !== 'success') {
                setTimeout(() => {
                    this.hideMessages();
                }, 5000);
            }
        }
    }
    
    hideMessages() {
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');
        
        if (successMessage) successMessage.classList.add('hidden');
        if (errorMessage) errorMessage.classList.add('hidden');
    }
    
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.classList.remove('loading');
        }
    }
}

// Initialize admin registration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.adminRegistration = new AdminRegistration();
});