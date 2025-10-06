// MB Construction - Admin Dashboard JavaScript

class AdminDashboard {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.apiUrl = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        this.init();
    }
    
    init() {
        console.log('🔧 Admin Dashboard Initialized');
        
        // Check if already logged in
        this.checkAuthStatus();
        
        // Bind event listeners
        this.bindEvents();
        
        // Load dashboard data if logged in
        if (this.isLoggedIn) {
            this.loadDashboardData();
        }
    }
    
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        // Auto-refresh dashboard data every 30 seconds
        if (this.isLoggedIn) {
            setInterval(() => this.loadDashboardData(), 30000);
        }
    }
    
    checkAuthStatus() {
        // Check for stored auth token
        const token = localStorage.getItem('admin_token');
        const user = localStorage.getItem('admin_user');
        
        if (token && user) {
            // Verify token is still valid
            this.verifyToken(token).then(isValid => {
                if (isValid) {
                    this.isLoggedIn = true;
                    this.currentUser = JSON.parse(user);
                    this.showDashboard();
                    this.loadDashboardData();
                } else {
                    // Token is invalid, clear storage and show login
                    this.clearAuthData();
                    this.showLogin();
                }
            });
        } else {
            this.showLogin();
        }
    }
    
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.apiUrl}/api/admin/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            // Show loading state
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            // Clear previous errors
            this.hideError();
            
            const loginData = {
                username: formData.get('username').trim(),
                password: formData.get('password')
            };
            
            // Validate input
            if (!loginData.username || !loginData.password) {
                throw new Error('Please enter both username and password');
            }
            
            const response = await fetch(`${this.apiUrl}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const result = await response.json();
            
            if (result.success && result.token) {
                // Store auth data
                localStorage.setItem('admin_token', result.token);
                localStorage.setItem('admin_user', JSON.stringify({
                    username: loginData.username,
                    loginTime: new Date().toISOString()
                }));
                
                this.isLoggedIn = true;
                this.currentUser = {
                    username: loginData.username,
                    loginTime: new Date().toISOString()
                };
                
                // Show success and redirect to dashboard
                this.showSuccess('Login successful! Loading dashboard...');
                
                setTimeout(() => {
                    this.showDashboard();
                    this.loadDashboardData();
                }, 1000);
                
            } else {
                throw new Error(result.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message.includes('Invalid credentials')) {
                errorMessage = 'Invalid username or password. Please check your credentials.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('username') || error.message.includes('password')) {
                errorMessage = error.message;
            }
            
            this.showError(errorMessage);
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    handleLogout() {
        // Clear stored auth data
        this.clearAuthData();
        
        this.isLoggedIn = false;
        this.currentUser = null;
        
        // Show login form
        this.showLogin();
        
        // Show logout message
        this.showSuccess('Logged out successfully');
        
        console.log('👋 Logged out successfully');
    }
    
    clearAuthData() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }
    
    showLogin() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('dashboard-section').classList.add('hidden');
        document.getElementById('logout-btn').style.display = 'none';
        
        // Clear any existing data
        this.clearDashboardData();
    }
    
    showDashboard() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        document.getElementById('logout-btn').style.display = 'inline-flex';
        
        // Update welcome message
        if (this.currentUser) {
            const welcomeMessage = document.querySelector('.admin-subtitle');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome back, ${this.currentUser.username}!`;
            }
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    hideError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }
    
    showSuccess(message) {
        // Create or update success message element
        let successDiv = document.getElementById('login-success');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.id = 'login-success';
            successDiv.className = 'success-message';
            
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.insertBefore(successDiv, loginForm.firstChild);
            }
        }
        
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.classList.add('hidden');
            }
        }, 3000);
    }
    
    async loadDashboardData() {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                this.handleLogout();
                return;
            }
            
            // Load contacts count
            await this.loadContactsData(token);
            
            // Load visits data
            await this.loadVisitsData(token);
            
            // Update last refresh time
            this.updateLastRefresh();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            
            // If unauthorized, logout user
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                this.handleLogout();
            }
        }
    }
    
    async loadContactsData(token) {
        try {
            const response = await fetch(`${this.apiUrl}/api/admin/contacts/count`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.updateContactStats(data);
            
        } catch (error) {
            console.error('Error loading contacts data:', error);
            // Set default values on error
            this.updateContactStats({ total: 0, today: 0 });
        }
    }
    
    async loadVisitsData(token) {
        try {
            const response = await fetch(`${this.apiUrl}/api/admin/visits`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.updateVisitsStats(data);
            
        } catch (error) {
            console.error('Error loading visits data:', error);
            // Set default values on error
            this.updateVisitsStats({ visits: [] });
        }
    }
    
    updateContactStats(data) {
        const totalContactsEl = document.getElementById('total-contacts');
        const newContactsEl = document.getElementById('new-contacts');
        
        if (totalContactsEl && data.total !== undefined) {
            this.animateCounter(totalContactsEl, data.total);
        }
        
        if (newContactsEl && data.today !== undefined) {
            this.animateCounter(newContactsEl, data.today);
        }
    }
    
    updateVisitsStats(data) {
        // Calculate total visits from the last 30 days
        const totalVisits = data.visits ? data.visits.reduce((sum, visit) => sum + visit.count, 0) : 0;
        
        const monthlyVisitsEl = document.getElementById('monthly-visits');
        if (monthlyVisitsEl) {
            monthlyVisitsEl.textContent = this.formatNumber(totalVisits);
        }
    }
    
    updateLastRefresh() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Add or update refresh indicator
        let refreshIndicator = document.getElementById('last-refresh');
        if (!refreshIndicator) {
            refreshIndicator = document.createElement('div');
            refreshIndicator.id = 'last-refresh';
            refreshIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: rgba(37, 99, 235, 0.1);
                color: #3b82f6;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.75rem;
                border: 1px solid rgba(37, 99, 235, 0.2);
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(refreshIndicator);
        }
        
        refreshIndicator.textContent = `Last updated: ${timeString}`;
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    animateCounter(element, target) {
        const current = parseInt(element.textContent) || 0;
        const increment = Math.ceil((target - current) / 20);
        
        if (current < target) {
            element.textContent = current + increment;
            setTimeout(() => this.animateCounter(element, target), 50);
        } else {
            element.textContent = target;
        }
    }
    
    clearDashboardData() {
        // Reset all counters to 0
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            counter.textContent = '0';
        });
        
        // Remove refresh indicator
        const refreshIndicator = document.getElementById('last-refresh');
        if (refreshIndicator) {
            refreshIndicator.remove();
        }
    }
    
    async loadContacts() {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;
            
            const response = await fetch(`${this.apiUrl}/api/admin/contacts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const contacts = await response.json();
                this.displayContacts(contacts);
            } else {
                throw new Error('Failed to load contacts');
            }
            
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.showContactsError('Failed to load contacts');
        }
    }
    
    async loadAllContacts() {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;
            
            const response = await fetch(`${this.apiUrl}/api/admin/contacts/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.displayContacts(data.contacts || []);
            } else {
                throw new Error('Failed to load contacts');
            }
            
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.showContactsError('Failed to load contacts');
        }
    }
    
    displayContacts(contacts) {
        const contactsList = document.getElementById('contacts-list');
        if (!contactsList) return;
        
        if (contacts.length === 0) {
            contactsList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No contacts found.</p>';
            return;
        }
        
        const contactsHTML = contacts.map(contact => `
            <div class="contact-item" style="
                background: var(--glass-bg);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-lg);
                padding: var(--space-4);
                margin-bottom: var(--space-4);
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-3);">
                    <div>
                        <h4 style="color: var(--color-text); margin-bottom: var(--space-1);">${contact.name}</h4>
                        <p style="color: var(--color-text-secondary); font-size: 0.875rem;">${contact.email}</p>
                        ${contact.phone ? `<p style="color: var(--color-text-secondary); font-size: 0.875rem;">${contact.phone}</p>` : ''}
                    </div>
                    <div style="text-align: right;">
                        <span style="color: var(--color-text-muted); font-size: 0.75rem;">${new Date(contact.createdAt).toLocaleDateString()}</span>
                        <br>
                        <span style="color: var(--color-primary); font-size: 0.75rem; font-weight: 600;">${contact.service || 'General Inquiry'}</span>
                    </div>
                </div>
                <div style="background: rgba(37, 99, 235, 0.05); padding: var(--space-3); border-radius: var(--radius-md);">
                    <p style="color: var(--color-text-secondary); line-height: 1.5; margin: 0;">${contact.message}</p>
                </div>
                <div style="margin-top: var(--space-3); display: flex; gap: var(--space-2);">
                    <button onclick="markAsRead('${contact._id}')" class="admin-btn" style="flex: none; padding: var(--space-1) var(--space-3); font-size: 0.75rem;">
                        Mark as Read
                    </button>
                    <button onclick="deleteContact('${contact._id}')" class="admin-btn danger" style="flex: none; padding: var(--space-1) var(--space-3); font-size: 0.75rem;">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        contactsList.innerHTML = contactsHTML;
    }
    
    showContactsError(message) {
        const contactsList = document.getElementById('contacts-list');
        if (contactsList) {
            contactsList.innerHTML = `<p style="text-align: center; color: #dc2626;">${message}</p>`;
        }
    }
}

// Global functions for admin actions
window.viewContacts = async function() {
    const modal = document.getElementById('contacts-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        
        // Load contacts using the new endpoint
        if (window.adminDashboard) {
            await window.adminDashboard.loadAllContacts();
        }
    }
};

window.closeContactsModal = function() {
    const modal = document.getElementById('contacts-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.exportContacts = async function() {
    try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            alert('Please login first');
            return;
        }
        
        const response = await fetch(`${window.adminDashboard.apiUrl}/api/admin/contacts/all?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const contacts = data.contacts;
            
            // Create CSV content
            const csvContent = [
                ['Name', 'Email', 'Phone', 'Service', 'Message', 'Date', 'Status'].join(','),
                ...contacts.map(contact => [
                    `"${contact.name}"`,
                    `"${contact.email}"`,
                    `"${contact.phone || ''}"`,
                    `"${contact.service || ''}"`,
                    `"${contact.message.replace(/"/g, '""')}"`,
                    `"${new Date(contact.createdAt).toLocaleDateString()}"`,
                    `"${contact.isRead ? 'Read' : 'Unread'}"`
                ].join(','))
            ].join('\n');
            
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            alert('Contacts exported successfully!');
        } else {
            throw new Error('Failed to export contacts');
        }
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export contacts. Please try again.');
    }
};

window.manageProjects = function() {
    alert('Project management functionality will be implemented soon!');
};

window.addProject = function() {
    alert('Add project functionality will be implemented soon!');
};

window.manageUsers = function() {
    alert('User management functionality will be implemented soon!');
};

window.addUser = function() {
    window.open('admin-register.html', '_blank');
};

window.viewAnalytics = function() {
    alert('Detailed analytics functionality will be implemented soon!');
};

window.exportReport = function() {
    alert('Report export functionality will be implemented soon!');
};

window.editContent = function() {
    alert('Content management functionality will be implemented soon!');
};

window.manageMedia = function() {
    alert('Media library functionality will be implemented soon!');
};

window.systemSettings = function() {
    alert('System settings functionality will be implemented soon!');
};

window.createBackup = function() {
    alert('Backup functionality will be implemented soon!');
};

window.markAsRead = async function(contactId) {
    try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        
        const response = await fetch(`${window.adminDashboard.apiUrl}/api/admin/contacts/${contactId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Reload contacts and update dashboard
            await window.adminDashboard.loadAllContacts();
            await window.adminDashboard.loadDashboardData();
            
            // Show success message
            const notification = document.createElement('div');
            notification.textContent = 'Contact marked as read';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #059669;
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                z-index: 10001;
                font-size: 0.875rem;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } else {
            throw new Error('Failed to mark as read');
        }
    } catch (error) {
        console.error('Error marking contact as read:', error);
        alert('Failed to mark contact as read');
    }
};

window.deleteContact = async function(contactId) {
    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('admin_token');
        if (!token) return;
        
        const response = await fetch(`${window.adminDashboard.apiUrl}/api/admin/contacts/${contactId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Reload contacts and update dashboard
            await window.adminDashboard.loadAllContacts();
            await window.adminDashboard.loadDashboardData();
            
            // Show success message
            const notification = document.createElement('div');
            notification.textContent = 'Contact deleted successfully';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc2626;
                color: white;
                padding: 0.75rem 1rem;
                border-radius: 8px;
                z-index: 10001;
                font-size: 0.875rem;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } else {
            throw new Error('Failed to delete contact');
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
    }
};

// Initialize admin dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.adminDashboard = new AdminDashboard();
});