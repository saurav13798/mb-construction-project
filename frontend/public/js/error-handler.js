class FrontendErrorHandler {
    constructor() {
        this.setupGlobalErrorHandling();
        this.messageContainer = null;
        this.createMessageContainer();
    }

    setupGlobalErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            this.logError(event.error, 'Global Error');
            this.showUserMessage('An unexpected error occurred. Please refresh the page and try again.', 'error');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.logError(event.reason, 'Unhandled Promise');
            this.showUserMessage('A network or processing error occurred. Please try again.', 'error');
            event.preventDefault(); // Prevent the default browser behavior
        });
    }

    createMessageContainer() {
        // Create a container for error messages if it doesn't exist
        if (!document.getElementById('error-message-container')) {
            const container = document.createElement('div');
            container.id = 'error-message-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            this.messageContainer = container;
        } else {
            this.messageContainer = document.getElementById('error-message-container');
        }
    }

    async handleApiError(error, context = {}) {
        console.error('API Error:', error);
        
        let userMessage = 'An error occurred. Please try again.';
        let errorType = 'error';

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 400:
                    userMessage = data?.message || 'Invalid request. Please check your input.';
                    break;
                case 401:
                    userMessage = 'Authentication required. Please log in.';
                    break;
                case 403:
                    userMessage = 'Access denied. You don\'t have permission for this action.';
                    break;
                case 404:
                    userMessage = 'The requested resource was not found.';
                    break;
                case 429:
                    userMessage = 'Too many requests. Please wait a moment and try again.';
                    break;
                case 500:
                    userMessage = 'Server error. Please try again later.';
                    break;
                default:
                    userMessage = data?.message || `Error ${status}: Please try again.`;
            }

            // Handle validation errors specifically
            if (data?.error?.type === 'VALIDATION_ERROR' && data?.error?.details) {
                this.handleValidationErrors(data.error.details, context.form);
                return;
            }

        } else if (error.request) {
            // Network error
            userMessage = 'Network error. Please check your connection and try again.';
            errorType = 'warning';
        } else {
            // Other error
            userMessage = error.message || 'An unexpected error occurred.';
        }

        this.showUserMessage(userMessage, errorType);
        
        // Preserve form data if context includes form
        if (context.form) {
            this.preserveFormData(context.form);
        }
    }

    handleValidationErrors(errors, form) {
        if (!Array.isArray(errors)) return;

        errors.forEach(error => {
            const field = form?.querySelector(`[name="${error.field}"]`);
            if (field) {
                this.showFieldError(field, error.message);
            } else {
                this.showUserMessage(error.message, 'warning');
            }
        });
    }

    showFieldError(field, message) {
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Add error styling to field
        field.classList.add('error');
        field.style.borderColor = '#e74c3c';

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: block;
        `;

        // Insert error message after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);

        // Remove error styling when user starts typing
        field.addEventListener('input', () => {
            field.classList.remove('error');
            field.style.borderColor = '';
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, { once: true });
    }

    showUserMessage(message, type = 'info', duration = 5000) {
        const messageElement = document.createElement('div');
        messageElement.className = `user-message message-${type}`;
        
        const colors = {
            error: { bg: '#fee', border: '#e74c3c', text: '#c0392b' },
            warning: { bg: '#fff3cd', border: '#f39c12', text: '#d68910' },
            success: { bg: '#d4edda', border: '#27ae60', text: '#1e8449' },
            info: { bg: '#d1ecf1', border: '#3498db', text: '#2980b9' }
        };

        const color = colors[type] || colors.info;

        messageElement.style.cssText = `
            background-color: ${color.bg};
            border: 1px solid ${color.border};
            border-left: 4px solid ${color.border};
            color: ${color.text};
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
            position: relative;
        `;

        messageElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <span style="margin-left: 10px; font-weight: bold;">&times;</span>
            </div>
        `;

        // Add CSS animation
        if (!document.getElementById('message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Click to dismiss
        messageElement.addEventListener('click', () => {
            this.removeMessage(messageElement);
        });

        this.messageContainer.appendChild(messageElement);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    this.removeMessage(messageElement);
                }
            }, duration);
        }
    }

    removeMessage(messageElement) {
        messageElement.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
    }

    preserveFormData(form) {
        if (!form) return;

        const formData = new FormData(form);
        const preservedData = {};

        for (let [key, value] of formData.entries()) {
            preservedData[key] = value;
        }

        // Store in sessionStorage for recovery
        sessionStorage.setItem(`preserved_form_${form.id || 'default'}`, JSON.stringify(preservedData));
        
        this.showUserMessage('Your form data has been preserved. You can continue where you left off.', 'info');
    }

    restoreFormData(form) {
        if (!form) return;

        const formId = form.id || 'default';
        const preservedData = sessionStorage.getItem(`preserved_form_${formId}`);
        
        if (preservedData) {
            try {
                const data = JSON.parse(preservedData);
                
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = data[key];
                    }
                });

                this.showUserMessage('Your previous form data has been restored.', 'success');
                
                // Clear preserved data after restoration
                sessionStorage.removeItem(`preserved_form_${formId}`);
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }

    logError(error, context = '') {
        const errorLog = {
            timestamp: new Date().toISOString(),
            context,
            message: error?.message || error,
            stack: error?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        console.error('Frontend Error Log:', errorLog);

        // In a real application, you might want to send this to a logging service
        // this.sendErrorToLoggingService(errorLog);
    }

    // Utility method to wrap API calls with error handling
    async apiCall(apiFunction, context = {}) {
        try {
            return await apiFunction();
        } catch (error) {
            await this.handleApiError(error, context);
            throw error; // Re-throw so calling code can handle it if needed
        }
    }

    // Check network connectivity
    checkNetworkStatus() {
        if (!navigator.onLine) {
            this.showUserMessage('You appear to be offline. Some features may not work properly.', 'warning', 0);
        }

        window.addEventListener('online', () => {
            this.showUserMessage('Connection restored. You are back online.', 'success');
        });

        window.addEventListener('offline', () => {
            this.showUserMessage('Connection lost. You are currently offline.', 'warning', 0);
        });
    }
}

// Initialize the error handler when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.errorHandler = new FrontendErrorHandler();
    window.errorHandler.checkNetworkStatus();
    
    // Restore form data for any forms on the page
    document.querySelectorAll('form').forEach(form => {
        window.errorHandler.restoreFormData(form);
    });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendErrorHandler;
}