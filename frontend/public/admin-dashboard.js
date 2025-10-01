/**
 * Professional Admin Dashboard
 * Handles authentication, data visualization, and inquiry management
 */

class AdminDashboard {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.apiBase = 'http://localhost:3000/api/admin';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Registration form
        const registerForm = document.getElementById('adminRegisterForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Toggle between login and register
        const showRegisterBtn = document.getElementById('show-register-btn');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.showRegisterForm());
        }

        const showLoginBtn = document.getElementById('show-login-btn');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.showLoginForm());
        }

        // Logout button
        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Export inquiries button
        const exportBtn = document.getElementById('export-inquiries-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportInquiries());
        }

        // Password confirmation validation
        const confirmPasswordField = document.getElementById('confirm-password');
        const passwordField = document.getElementById('register-password');
        if (confirmPasswordField && passwordField) {
            confirmPasswordField.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
            passwordField.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    checkAuthStatus() {
        if (this.token) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLoginForm();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const loginBtn = form.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('admin-error-message');
        
        // Show loading state
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<div class="loading-spinner"></div> Authenticating...';
        loginBtn.disabled = true;
        
        // Hide previous errors
        errorDiv.classList.remove('show');
        
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    password: formData.get('password')
                })
            });

            // Check if response is ok and has content
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Login failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response isn't JSON, use the text or a generic message
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                localStorage.setItem('adminToken', this.token);
                
                // Success animation
                loginBtn.innerHTML = '✓ Access Granted';
                loginBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    this.showDashboard();
                    this.loadDashboardData();
                }, 1000);
                
            } else {
                throw new Error(data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Login failed. Please check your credentials.');
            
            // Reset button
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            loginBtn.classList.remove('btn-success');
        }
    }

    handleLogout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.showLoginForm();
    }

    showLoginForm() {
        const loginPanel = document.getElementById('admin-login-panel');
        const registerPanel = document.getElementById('admin-register-panel');
        const dashboardPanel = document.getElementById('admin-dashboard-panel');
        
        if (loginPanel) loginPanel.style.display = 'block';
        if (registerPanel) registerPanel.style.display = 'none';
        if (dashboardPanel) dashboardPanel.style.display = 'none';
        
        // Reset forms
        const loginForm = document.getElementById('adminLoginForm');
        const registerForm = document.getElementById('adminRegisterForm');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Clear messages
        this.clearMessages();
    }

    showRegisterForm() {
        const loginPanel = document.getElementById('admin-login-panel');
        const registerPanel = document.getElementById('admin-register-panel');
        const dashboardPanel = document.getElementById('admin-dashboard-panel');
        
        if (loginPanel) loginPanel.style.display = 'none';
        if (registerPanel) registerPanel.style.display = 'block';
        if (dashboardPanel) dashboardPanel.style.display = 'none';
        
        // Reset forms
        const loginForm = document.getElementById('adminLoginForm');
        const registerForm = document.getElementById('adminRegisterForm');
        if (loginForm) loginForm.reset();
        if (registerForm) registerForm.reset();
        
        // Clear messages
        this.clearMessages();
    }

    showDashboard() {
        const loginPanel = document.getElementById('admin-login-panel');
        const dashboardPanel = document.getElementById('admin-dashboard-panel');
        
        if (loginPanel) loginPanel.style.display = 'none';
        if (dashboardPanel) dashboardPanel.style.display = 'block';
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const registerBtn = form.querySelector('button[type="submit"]');
        const errorDiv = document.getElementById('admin-register-error');
        const successDiv = document.getElementById('admin-register-success');
        
        // Validate password match
        if (!this.validatePasswordMatch()) {
            this.showRegisterError('Passwords do not match');
            return;
        }
        
        // Show loading state
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<div class="loading-spinner"></div> Creating Account...';
        registerBtn.disabled = true;
        
        // Hide previous messages
        errorDiv.classList.remove('show');
        successDiv.classList.remove('show');
        
        try {
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    registrationCode: formData.get('registrationCode')
                })
            });

            // Check if response is ok and has content
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Registration failed';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If response isn't JSON, use the text or a generic message
                    errorMessage = errorText || `Server error: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.success) {
                // Success animation
                registerBtn.innerHTML = '✓ Account Created';
                registerBtn.classList.add('btn-success');
                
                this.showRegisterSuccess('Admin account created successfully! You can now login.');
                
                setTimeout(() => {
                    this.showLoginForm();
                }, 2000);
                
            } else {
                throw new Error(data.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showRegisterError(error.message || 'Registration failed. Please check your details.');
            
            // Reset button
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
            registerBtn.classList.remove('btn-success');
        }
    }

    validatePasswordMatch() {
        const passwordField = document.getElementById('register-password');
        const confirmPasswordField = document.getElementById('confirm-password');
        
        if (!passwordField || !confirmPasswordField) return true;
        
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordField.setCustomValidity('Passwords do not match');
            confirmPasswordField.classList.add('error');
            return false;
        } else {
            confirmPasswordField.setCustomValidity('');
            confirmPasswordField.classList.remove('error');
            return true;
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('admin-error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 5000);
        }
    }

    showRegisterError(message) {
        const errorDiv = document.getElementById('admin-register-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorDiv.classList.remove('show');
            }, 5000);
        }
    }

    showRegisterSuccess(message) {
        const successDiv = document.getElementById('admin-register-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.add('show');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successDiv.classList.remove('show');
            }, 5000);
        }
    }

    clearMessages() {
        const errorDiv = document.getElementById('admin-error-message');
        const registerErrorDiv = document.getElementById('admin-register-error');
        const registerSuccessDiv = document.getElementById('admin-register-success');
        
        if (errorDiv) errorDiv.classList.remove('show');
        if (registerErrorDiv) registerErrorDiv.classList.remove('show');
        if (registerSuccessDiv) registerSuccessDiv.classList.remove('show');
    }

    async loadDashboardData() {
        try {
            this.updateLastRefreshTime();
            await Promise.all([
                this.loadVisitsData(),
                this.loadInquiriesData(),
                this.loadRecentInquiries(),
                this.loadQuickStats()
            ]);
        } catch (error) {
            console.error('Dashboard data loading error:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async refreshDashboard() {
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<div class="loading-spinner"></div> Refreshing...';
            refreshBtn.disabled = true;
            
            await this.loadDashboardData();
            
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }

    updateLastRefreshTime() {
        const timeElement = document.getElementById('last-update-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-IN');
        }
    }

    async loadQuickStats() {
        try {
            const response = await fetch('http://localhost:3000/api/contact/stats', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleLogout();
                    return;
                }
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            
            if (data.success) {
                this.renderQuickStats(data.data);
            }
            
        } catch (error) {
            console.error('Quick stats error:', error);
        }
    }

    renderQuickStats(stats) {
        const totalElement = document.getElementById('total-inquiries');
        const newElement = document.getElementById('new-inquiries');
        const responseElement = document.getElementById('response-rate');
        const avgTimeElement = document.getElementById('avg-response-time');

        if (totalElement) totalElement.textContent = stats.overview.totalContacts || '0';
        if (newElement) newElement.textContent = stats.overview.recentContacts || '0';
        if (responseElement) responseElement.textContent = '95%'; // Calculate from actual data
        if (avgTimeElement) avgTimeElement.textContent = '< 24h'; // Calculate from actual data
    }

    async exportInquiries() {
        try {
            const response = await fetch('http://localhost:3000/api/contact?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch inquiries for export');
            }

            const data = await response.json();
            this.downloadCSV(data.data);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError('Failed to export inquiries');
        }
    }

    downloadCSV(inquiries) {
        const headers = ['Name', 'Email', 'Phone', 'Company', 'Service', 'Message', 'Date', 'Status'];
        const csvContent = [
            headers.join(','),
            ...inquiries.map(inquiry => [
                `"${inquiry.name || ''}"`,
                `"${inquiry.email || ''}"`,
                `"${inquiry.phone || ''}"`,
                `"${inquiry.company || ''}"`,
                `"${this.formatServiceName(inquiry.service)}"`,
                `"${(inquiry.message || '').replace(/"/g, '""')}"`,
                `"${this.formatDate(inquiry.createdAt)}"`,
                `"${inquiry.status || 'new'}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mb-construction-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async loadVisitsData() {
        const container = document.getElementById('visits-chart');
        const summaryContainer = document.getElementById('visits-summary');
        
        try {
            const response = await fetch(`${this.apiBase}/visits`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleLogout();
                    return;
                }
                throw new Error('Failed to fetch visits data');
            }

            const data = await response.json();
            
            if (data.success) {
                this.renderVisitsChart(container, data.visits);
                this.renderVisitsSummary(summaryContainer, data.visits);
            } else {
                throw new Error(data.message);
            }
            
        } catch (error) {
            console.error('Visits data error:', error);
            container.innerHTML = '<p class="error-text">Failed to load visits data</p>';
        }
    }

    async loadInquiriesData() {
        const container = document.getElementById('inquiries-chart');
        const summaryContainer = document.getElementById('inquiries-summary');
        
        try {
            const response = await fetch(`${this.apiBase}/contacts`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleLogout();
                    return;
                }
                throw new Error('Failed to fetch inquiries data');
            }

            const data = await response.json();
            
            if (data.success) {
                this.renderInquiriesChart(container, data.contactsByService);
                this.renderInquiriesSummary(summaryContainer, data.contactsByService);
            } else {
                throw new Error(data.message);
            }
            
        } catch (error) {
            console.error('Inquiries data error:', error);
            container.innerHTML = '<p class="error-text">Failed to load inquiries data</p>';
        }
    }

    async loadRecentInquiries() {
        const container = document.getElementById('recent-inquiries');
        
        try {
            const response = await fetch('http://localhost:3000/api/contact?limit=10', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleLogout();
                    return;
                }
                throw new Error('Failed to fetch recent inquiries');
            }

            const data = await response.json();
            this.renderRecentInquiries(container, data.data || []);
            
        } catch (error) {
            console.error('Recent inquiries error:', error);
            container.innerHTML = '<p class="error-text">Failed to load recent inquiries</p>';
        }
    }

    renderVisitsChart(container, visits) {
        if (!visits || visits.length === 0) {
            container.innerHTML = '<p class="no-data">No visits data available</p>';
            return;
        }

        const maxVisits = Math.max(...visits.map(v => v.count));
        
        const chartHTML = `
            <div class="visits-chart">
                ${visits.map(visit => {
                    const height = (visit.count / maxVisits) * 100;
                    const date = `${visit._id.day}/${visit._id.month}`;
                    return `<div class="chart-bar" style="height: ${height}%" data-value="${visit.count}" title="${date}: ${visit.count} visits"></div>`;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = chartHTML;
    }

    renderVisitsSummary(container, visits) {
        const totalVisits = visits.reduce((sum, visit) => sum + visit.count, 0);
        const avgVisits = visits.length > 0 ? Math.round(totalVisits / visits.length) : 0;
        const maxDay = visits.reduce((max, visit) => visit.count > max.count ? visit : max, visits[0] || {count: 0});
        
        container.innerHTML = `
            <div class="summary-item">
                <span class="summary-number">${totalVisits}</span>
                <span class="summary-label">Total Visits</span>
            </div>
            <div class="summary-item">
                <span class="summary-number">${avgVisits}</span>
                <span class="summary-label">Daily Average</span>
            </div>
            <div class="summary-item">
                <span class="summary-number">${maxDay.count || 0}</span>
                <span class="summary-label">Peak Day</span>
            </div>
        `;
    }

    renderInquiriesChart(container, inquiries) {
        if (!inquiries || inquiries.length === 0) {
            container.innerHTML = '<p class="no-data">No inquiries data available</p>';
            return;
        }

        const maxInquiries = Math.max(...inquiries.map(i => i.count));
        
        const chartHTML = `
            <div class="inquiries-chart">
                ${inquiries.map(inquiry => {
                    const height = (inquiry.count / maxInquiries) * 100;
                    const serviceName = this.formatServiceName(inquiry._id);
                    return `<div class="chart-bar" style="height: ${height}%" data-value="${inquiry.count}" title="${serviceName}: ${inquiry.count} inquiries"></div>`;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = chartHTML;
    }

    renderInquiriesSummary(container, inquiries) {
        const totalInquiries = inquiries.reduce((sum, inquiry) => sum + inquiry.count, 0);
        const topService = inquiries.reduce((max, inquiry) => inquiry.count > max.count ? inquiry : max, inquiries[0] || {count: 0});
        
        container.innerHTML = `
            <div class="summary-item">
                <span class="summary-number">${totalInquiries}</span>
                <span class="summary-label">Total Inquiries</span>
            </div>
            <div class="summary-item">
                <span class="summary-number">${inquiries.length}</span>
                <span class="summary-label">Service Types</span>
            </div>
            <div class="summary-item">
                <span class="summary-number">${topService.count || 0}</span>
                <span class="summary-label">Top Service</span>
            </div>
        `;
    }

    renderRecentInquiries(container, inquiries) {
        if (!inquiries || inquiries.length === 0) {
            container.innerHTML = '<p class="no-data">No recent inquiries available</p>';
            return;
        }

        const recentInquiries = inquiries.slice(0, 10); // Show last 10
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Service</th>
                        <th>Company</th>
                        <th>Date</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentInquiries.map(inquiry => `
                        <tr>
                            <td>${this.escapeHtml(inquiry.name || 'N/A')}</td>
                            <td>${this.escapeHtml(inquiry.email || 'N/A')}</td>
                            <td><span class="inquiry-service">${this.formatServiceName(inquiry.service)}</span></td>
                            <td>${this.escapeHtml(inquiry.company || 'N/A')}</td>
                            <td class="inquiry-date">${this.formatDate(inquiry.createdAt)}</td>
                            <td>${this.truncateText(this.escapeHtml(inquiry.message || ''), 50)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = tableHTML;
    }

    formatServiceName(service) {
        const serviceNames = {
            'redevelopment': 'Redevelopment',
            'government-contract': 'Government Contract',
            'manpower': 'Manpower Supply',
            'consultation': 'Consultation',
            'other': 'Other'
        };
        return serviceNames[service] || service || 'Unknown';
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with admin dashboard
    if (document.getElementById('admin-dashboard-section')) {
        new AdminDashboard();
    }
});

// Add professional styles for error states and registration
const adminStyles = `
    .error-text {
        color: #dc2626;
        text-align: center;
        font-style: italic;
        padding: var(--space-4);
    }
    
    .no-data {
        color: var(--color-text-secondary);
        text-align: center;
        font-style: italic;
        padding: var(--space-4);
    }
    
    .btn-success {
        background: var(--gradient-success) !important;
        border-color: var(--color-success) !important;
    }
    
    .success-message {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
        padding: var(--space-4);
        border-radius: var(--radius-md);
        margin-top: var(--space-4);
        opacity: 0;
        transform: translateY(-10px);
        transition: all var(--transition-normal);
    }
    
    .success-message.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .auth-toggle {
        text-align: center;
        margin-top: var(--space-4);
    }
    
    .link-btn {
        background: none;
        border: none;
        color: var(--color-primary);
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.875rem;
        padding: 0;
        transition: color var(--transition-normal);
    }
    
    .link-btn:hover {
        color: var(--color-primary-light);
    }
    
    .form-help {
        display: block;
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        margin-top: var(--space-1);
        font-style: italic;
    }
    
    .form-group input.error {
        border-color: #dc2626;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
    
    .admin-panel {
        animation: panelSlideIn 0.5s ease-out;
    }
    
    @keyframes panelSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

// Inject admin styles
const adminStyleSheet = document.createElement('style');
adminStyleSheet.textContent = adminStyles;
document.head.appendChild(adminStyleSheet);