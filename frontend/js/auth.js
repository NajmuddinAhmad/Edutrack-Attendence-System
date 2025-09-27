// Auth.js - Authentication utilities and user management

class Auth {
    constructor() {
        this.token = null;
        this.user = null;
        this.init();
    }

    init() {
        // Check for existing authentication
        this.token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        
        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (e) {
                console.error('Error parsing user data:', e);
                this.clearAuth();
                return;
            }
        }

        // Get current page info
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html') || currentPage === '/login' || currentPage.endsWith('/login');
        const isRegisterPage = currentPage.includes('register.html') || currentPage === '/register' || currentPage.endsWith('/register');
        const isAuthPage = isLoginPage || isRegisterPage;

        // Handle authentication state
        if (this.isAuthenticated()) {
            if (isAuthPage) {
                // User is authenticated but on auth page, redirect to dashboard
                window.location.href = '/index.html';
                return;
            }
            // User is authenticated and on protected page, initialize UI
            this.updateUserInterface();
            this.setupUserMenu();
        } else {
            if (!isAuthPage) {
                // User is not authenticated and not on auth page, redirect to login
                this.redirectToLogin();
            }
            // If user is not authenticated but on auth page, do nothing (let them login/register)
        }
    }

    isAuthenticated() {
        return this.token && this.user;
    }

    login(token, user, remember = false) {
        this.token = token;
        this.user = user;

        const storage = remember ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(user));

        this.updateUserInterface();
        this.setupUserMenu();
    }

    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    }

    logout() {
        this.token = null;
        this.user = null;

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        this.redirectToLogin();
    }

    redirectToLogin() {
        // Don't redirect if already on login or register page
        const currentPage = window.location.pathname;
        const isLoginPage = currentPage.includes('login.html') || currentPage === '/login' || currentPage.endsWith('/login');
        const isRegisterPage = currentPage.includes('register.html') || currentPage === '/register' || currentPage.endsWith('/register');
        
        if (!isLoginPage && !isRegisterPage) {
            console.log('Redirecting to login page');
            window.location.href = '/login.html';
        }
    }

    updateUserInterface() {
        if (!this.user) return;

        // Update user initials
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            const initials = `${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}`.toUpperCase();
            userInitials.textContent = initials || this.user.username?.[0]?.toUpperCase() || 'U';
        }

        // Update user name
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = this.user.firstName && this.user.lastName 
                ? `${this.user.firstName} ${this.user.lastName}`
                : this.user.username || 'User';
        }

        // Update user role
        const userRole = document.getElementById('user-role');
        if (userRole) {
            userRole.textContent = this.formatRole(this.user.role);
            
            // Add role-specific ID if available
            if (this.user.studentId || this.user.teacherId) {
                userRole.textContent += ` (${this.user.studentId || this.user.teacherId})`;
            }
        }

        // Update page title based on role
        this.updatePageTitle();
    }

    formatRole(role) {
        const roleMap = {
            'student': 'Student',
            'teacher': 'Teacher',
            'admin': 'Administrator'
        };
        return roleMap[role] || role;
    }

    updatePageTitle() {
        const titleElement = document.querySelector('h1');
        if (titleElement && this.user) {
            const roleTitles = {
                'student': 'Student Dashboard',
                'teacher': 'Teacher Dashboard', 
                'admin': 'Admin Dashboard'
            };
            
            const newTitle = roleTitles[this.user.role] || 'Dashboard';
            titleElement.textContent = newTitle;
        }
    }

    setupUserMenu() {
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenu = document.getElementById('user-menu');
        const userMenuChevron = document.getElementById('user-menu-chevron');
        const logoutBtn = document.getElementById('logout-btn');

        if (userMenuButton && userMenu) {
            // Toggle user menu
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = userMenu.classList.contains('hidden');
                
                if (isHidden) {
                    userMenu.classList.remove('hidden');
                    userMenuChevron.style.transform = 'rotate(180deg)';
                } else {
                    userMenu.classList.add('hidden');
                    userMenuChevron.style.transform = 'rotate(0deg)';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', () => {
                userMenu.classList.add('hidden');
                userMenuChevron.style.transform = 'rotate(0deg)';
            });

            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }

        // Profile and settings links
        const profileLink = document.getElementById('profile-link');
        const settingsLink = document.getElementById('settings-link');

        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfile();
            });
        }

        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSettings();
            });
        }
    }

    async handleLogout() {
        try {
            // Call logout API
            await this.makeAuthenticatedRequest('/api/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Always clear local auth data
            this.logout();
        }
    }

    showProfile() {
        // Create and show profile modal
        this.showUserProfileModal();
    }

    showSettings() {
        // For now, just show an alert
        alert('Settings page coming soon!');
    }

    showUserProfileModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">User Profile</h3>
                    <button id="close-profile-modal" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="text-xl font-medium text-primary">${this.user.firstName?.[0] || ''}${this.user.lastName?.[0] || ''}</span>
                        </div>
                        <div>
                            <h4 class="font-semibold">${this.user.firstName} ${this.user.lastName}</h4>
                            <p class="text-sm text-gray-600">${this.formatRole(this.user.role)}</p>
                            ${this.user.studentId || this.user.teacherId ? `<p class="text-xs text-gray-500">${this.user.studentId || this.user.teacherId}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="border-t pt-4 space-y-3">
                        <div>
                            <label class="text-sm font-medium text-gray-700">Email</label>
                            <p class="text-sm text-gray-900">${this.user.email}</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Username</label>
                            <p class="text-sm text-gray-900">${this.user.username}</p>
                        </div>
                        
                        ${this.user.phone ? `
                            <div>
                                <label class="text-sm font-medium text-gray-700">Phone</label>
                                <p class="text-sm text-gray-900">${this.user.phone}</p>
                            </div>
                        ` : ''}
                        
                        ${this.user.department ? `
                            <div>
                                <label class="text-sm font-medium text-gray-700">Department</label>
                                <p class="text-sm text-gray-900">${this.user.department}</p>
                            </div>
                        ` : ''}
                        
                        ${this.user.year ? `
                            <div>
                                <label class="text-sm font-medium text-gray-700">Year</label>
                                <p class="text-sm text-gray-900">${this.user.year}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="border-t pt-4 flex justify-end space-x-3">
                        <button id="change-password-btn" class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Change Password
                        </button>
                        <button id="close-profile-modal-btn" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        lucide.createIcons();

        // Close modal handlers
        const closeButtons = modal.querySelectorAll('#close-profile-modal, #close-profile-modal-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Change password handler
        const changePasswordBtn = modal.querySelector('#change-password-btn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                document.body.removeChild(modal);
                this.showChangePasswordModal();
            });
        }

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showChangePasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Change Password</h3>
                    <button id="close-password-modal" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                </div>
                
                <form id="change-password-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" id="current-password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="new-password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" id="confirm-new-password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" required>
                    </div>
                    
                    <div id="password-error" class="hidden text-sm text-red-600"></div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button type="button" id="cancel-password-change" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" id="submit-password-change" class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                            Change Password
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        lucide.createIcons();

        const form = modal.querySelector('#change-password-form');
        const errorDiv = modal.querySelector('#password-error');

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const currentPassword = modal.querySelector('#current-password').value;
            const newPassword = modal.querySelector('#new-password').value;
            const confirmPassword = modal.querySelector('#confirm-new-password').value;

            // Validation
            if (newPassword !== confirmPassword) {
                this.showError(errorDiv, 'New passwords do not match');
                return;
            }

            if (newPassword.length < 6) {
                this.showError(errorDiv, 'New password must be at least 6 characters long');
                return;
            }

            try {
                const response = await this.makeAuthenticatedRequest('/api/auth/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                        confirmPassword
                    })
                });

                const data = await response.json();

                if (data.success) {
                    document.body.removeChild(modal);
                    alert('Password changed successfully!');
                } else {
                    this.showError(errorDiv, data.message || 'Failed to change password');
                }
            } catch (error) {
                console.error('Change password error:', error);
                this.showError(errorDiv, 'Connection error. Please try again.');
            }
        });

        // Close modal handlers
        const closeButtons = modal.querySelectorAll('#close-password-modal, #cancel-password-change');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showError(errorDiv, message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    // Make authenticated API requests
    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Check if token is expired
        if (response.status === 401 || response.status === 403) {
            this.logout();
            throw new Error('Authentication expired');
        }

        return response;
    }

    // Get current user info
    getUser() {
        return this.user;
    }

    // Get current token
    getToken() {
        return this.token;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.user && roles.includes(this.user.role);
    }
}

// Create global auth instance
window.auth = new Auth();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}