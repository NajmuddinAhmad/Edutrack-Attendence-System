// Role-based dashboard functionality
class RoleBasedDashboard {
    constructor() {
        this.currentRole = null;
        this.dashboardConfigs = {
            student: {
                title: "Student Dashboard",
                subtitle: "Track your attendance and academic progress",
                navigation: [
                    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', visible: true },
                    { id: 'my-attendance', icon: 'calendar-check', label: 'My Attendance', visible: true },
                    { id: 'my-classes', icon: 'book-open', label: 'My Classes', visible: true },
                    { id: 'my-grades', icon: 'award', label: 'My Grades', visible: true },
                    { id: 'profile', icon: 'user', label: 'Profile', visible: true }
                ],
                widgets: ['attendanceOverview', 'upcomingClasses', 'recentGrades', 'announcements'],
                permissions: ['view_own_attendance', 'view_own_grades', 'view_own_schedule']
            },
            teacher: {
                title: "Teacher Dashboard",
                subtitle: "Manage your classes and track student progress",
                navigation: [
                    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', visible: true },
                    { id: 'my-classes', icon: 'users', label: 'My Classes', visible: true },
                    { id: 'attendance', icon: 'user-check', label: 'Attendance', visible: true },
                    { id: 'students', icon: 'graduation-cap', label: 'Students', visible: true },
                    { id: 'analytics', icon: 'trending-up', label: 'Analytics', visible: true },
                    { id: 'gradebook', icon: 'book-open', label: 'Gradebook', visible: true },
                    { id: 'profile', icon: 'user', label: 'Profile', visible: true }
                ],
                widgets: ['classOverview', 'attendanceStats', 'studentProgress', 'upcomingClasses'],
                permissions: ['manage_classes', 'view_student_attendance', 'manage_grades', 'view_analytics']
            },
            admin: {
                title: "Admin Dashboard",
                subtitle: "Manage the entire attendance system",
                navigation: [
                    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard', visible: true },
                    { id: 'students', icon: 'users', label: 'Students', visible: true },
                    { id: 'teachers', icon: 'user-tie', label: 'Teachers', visible: true },
                    { id: 'classes', icon: 'calendar-days', label: 'Classes', visible: true },
                    { id: 'attendance', icon: 'user-check', label: 'Attendance', visible: true },
                    { id: 'analytics', icon: 'trending-up', label: 'Analytics', visible: true },
                    { id: 'reports', icon: 'file-text', label: 'Reports', visible: true },
                    { id: 'settings', icon: 'settings', label: 'Settings', visible: true }
                ],
                widgets: ['systemOverview', 'userStats', 'attendanceOverview', 'systemHealth'],
                permissions: ['manage_users', 'manage_classes', 'view_all_data', 'system_settings']
            }
        };

        // Initialize feature managers
        this.studentAttendanceViewer = new StudentAttendanceViewer();
        
        this.init();
    }

    init() {
        // Wait for auth to be initialized
        if (window.auth && window.auth.getUser()) {
            this.setupRoleBasedDashboard();
        } else {
            // Retry after a short delay, with max attempts
            this.initAttempts = (this.initAttempts || 0) + 1;
            if (this.initAttempts < 50) { // Max 5 seconds of retries
                setTimeout(() => this.init(), 100);
            } else {
                console.error('Failed to initialize role-based dashboard: Auth not available');
            }
        }
    }

    setupRoleBasedDashboard() {
        const user = window.auth.getUser();
        if (!user) {
            console.error('No user found during role-based dashboard setup');
            return;
        }

        this.currentRole = user.role;
        console.log(`Setting up role-based dashboard for role: ${this.currentRole}`);
        
        const config = this.dashboardConfigs[this.currentRole];
        
        if (config) {
            this.updateNavigation(config.navigation);
            this.updateDashboardHeader(config.title, config.subtitle);
            this.setupDashboardContent(config.widgets);
            this.setupRoleBasedEventHandlers();
            console.log('Role-based dashboard setup completed');
        } else {
            console.error(`No configuration found for role: ${this.currentRole}`);
        }
    }

    updateNavigation(navItems) {
        const nav = document.querySelector('nav');
        if (!nav) return;

        // Clear existing navigation
        nav.innerHTML = '';

        // Add navigation items based on role
        navItems.forEach((item, index) => {
            if (item.visible) {
                const navItem = document.createElement('a');
                navItem.href = '#';
                navItem.className = `nav-item ${index === 0 ? 'nav-active' : 'nav-inactive'} flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`;
                navItem.setAttribute('data-page', item.id);
                
                navItem.innerHTML = `
                    <i data-lucide="${item.icon}" class="nav-icon h-4 w-4 mr-3"></i>
                    <span class="nav-text">${item.label}</span>
                `;
                
                nav.appendChild(navItem);
            }
        });

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Setup navigation event handlers
        this.setupNavigationHandlers();
    }

    updateDashboardHeader(title, subtitle) {
        const titleElement = document.querySelector('h1');
        const subtitleElement = document.querySelector('h1 + p');
        
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        if (subtitleElement) {
            subtitleElement.textContent = subtitle;
        }
    }

    setupDashboardContent(widgets) {
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        // Find the stats grid and update it
        const statsGrid = mainContent.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
        if (statsGrid) {
            this.updateStatsGrid(statsGrid, widgets);
        }

        // Update quick actions based on role
        this.updateQuickActions();
    }

    updateStatsGrid(statsGrid, widgets) {
        // Clear existing stats
        statsGrid.innerHTML = '';

        const user = window.auth.getUser();
        const role = user.role;

        let stats = [];

        switch (role) {
            case 'student':
                stats = [
                    {
                        title: 'Attendance Rate',
                        value: '87.5%',
                        icon: 'calendar-check',
                        trend: '+2.1%',
                        color: 'text-green-600'
                    },
                    {
                        title: 'Classes Today',
                        value: '4',
                        icon: 'clock',
                        trend: '2 upcoming',
                        color: 'text-blue-600'
                    },
                    {
                        title: 'Average Grade',
                        value: 'A-',
                        icon: 'award',
                        trend: '+0.2 GPA',
                        color: 'text-purple-600'
                    },
                    {
                        title: 'Assignments Due',
                        value: '3',
                        icon: 'clipboard-list',
                        trend: 'This week',
                        color: 'text-orange-600'
                    }
                ];
                break;

            case 'teacher':
                stats = [
                    {
                        title: 'My Classes',
                        value: '6',
                        icon: 'users',
                        trend: '142 students',
                        color: 'text-blue-600'
                    },
                    {
                        title: 'Today\'s Attendance',
                        value: '89.3%',
                        icon: 'user-check',
                        trend: '+1.2%',
                        color: 'text-green-600'
                    },
                    {
                        title: 'Assignments to Grade',
                        value: '28',
                        icon: 'clipboard-check',
                        trend: '3 overdue',
                        color: 'text-orange-600'
                    },
                    {
                        title: 'Classes Today',
                        value: '3',
                        icon: 'calendar-days',
                        trend: 'Next at 2:00 PM',
                        color: 'text-purple-600'
                    }
                ];
                break;

            case 'admin':
                stats = [
                    {
                        title: 'Total Students',
                        value: '1,247',
                        icon: 'users',
                        trend: '+12 this month',
                        color: 'text-blue-600'
                    },
                    {
                        title: 'System Attendance',
                        value: '87.4%',
                        icon: 'trending-up',
                        trend: '+2.1%',
                        color: 'text-green-600'
                    },
                    {
                        title: 'Active Teachers',
                        value: '89',
                        icon: 'user-tie',
                        trend: '5 new this month',
                        color: 'text-purple-600'
                    },
                    {
                        title: 'System Health',
                        value: '99.9%',
                        icon: 'activity',
                        trend: 'All systems operational',
                        color: 'text-green-600'
                    }
                ];
                break;
        }

        // Create stat cards
        stats.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'card';
            statCard.innerHTML = `
                <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                    <h3 class="text-sm font-medium text-muted-foreground">${stat.title}</h3>
                    <i data-lucide="${stat.icon}" class="h-4 w-4 text-muted-foreground"></i>
                </div>
                <div class="px-6 pb-6">
                    <div class="text-2xl font-bold">${stat.value}</div>
                    <p class="text-xs ${stat.color}">${stat.trend}</p>
                </div>
            `;
            statsGrid.appendChild(statCard);
        });

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    updateQuickActions() {
        const quickActionsGrid = document.querySelector('.grid.grid-cols-2.gap-3');
        if (!quickActionsGrid) return;

        quickActionsGrid.innerHTML = '';

        const user = window.auth.getUser();
        const role = user.role;

        let actions = [];

        switch (role) {
            case 'student':
                actions = [
                    {
                        label: 'Check In',
                        icon: 'check-circle',
                        action: 'student-check-in',
                        class: 'gradient-btn text-primary-foreground'
                    },
                    {
                        label: 'View Schedule',
                        icon: 'calendar',
                        action: 'view-schedule',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    },
                    {
                        label: 'My Grades',
                        icon: 'award',
                        action: 'view-grades',
                        class: 'bg-muted text-muted-foreground hover:bg-muted/80'
                    },
                    {
                        label: 'Submit Assignment',
                        icon: 'upload',
                        action: 'submit-assignment',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    }
                ];
                break;

            case 'teacher':
                actions = [
                    {
                        label: 'Mark Attendance',
                        icon: 'user-check',
                        action: 'mark-attendance',
                        class: 'gradient-btn text-primary-foreground'
                    },
                    {
                        label: 'Create Assignment',
                        icon: 'plus-circle',
                        action: 'create-assignment',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    },
                    {
                        label: 'Grade Assignments',
                        icon: 'edit',
                        action: 'grade-assignments',
                        class: 'bg-muted text-muted-foreground hover:bg-muted/80'
                    },
                    {
                        label: 'Class Analytics',
                        icon: 'bar-chart',
                        action: 'view-analytics',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    }
                ];
                break;

            case 'admin':
                actions = [
                    {
                        label: 'Add User',
                        icon: 'user-plus',
                        action: 'add-user',
                        class: 'gradient-btn text-primary-foreground'
                    },
                    {
                        label: 'System Reports',
                        icon: 'file-text',
                        action: 'system-reports',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    },
                    {
                        label: 'Manage Classes',
                        icon: 'calendar-plus',
                        action: 'manage-classes',
                        class: 'bg-muted text-muted-foreground hover:bg-muted/80'
                    },
                    {
                        label: 'System Settings',
                        icon: 'settings',
                        action: 'system-settings',
                        class: 'border border-border bg-card hover:bg-accent hover:text-accent-foreground'
                    }
                ];
                break;
        }

        // Create action buttons
        actions.forEach(action => {
            const actionBtn = document.createElement('button');
            actionBtn.className = `${action.class} flex flex-col h-20 text-center items-center justify-center rounded-md transition-all duration-200 hover:shadow-lg`;
            actionBtn.setAttribute('data-action', action.action);
            actionBtn.innerHTML = `
                <i data-lucide="${action.icon}" class="h-5 w-5 mb-1"></i>
                <span class="text-xs">${action.label}</span>
            `;
            quickActionsGrid.appendChild(actionBtn);
        });

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Setup action handlers
        this.setupActionHandlers();
    }

    setupNavigationHandlers() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all nav items
                navItems.forEach(nav => {
                    nav.classList.remove('nav-active');
                    nav.classList.add('nav-inactive');
                });
                
                // Add active class to clicked item
                item.classList.remove('nav-inactive');
                item.classList.add('nav-active');
                
                // Get the page identifier
                const page = item.getAttribute('data-page');
                this.handleNavigation(page);
            });
        });
    }

    setupActionHandlers() {
        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('data-action');
                this.handleAction(action);
            });
        });
    }

    handleNavigation(page) {
        console.log(`Navigating to: ${page} for role: ${this.currentRole}`);
        
        // Clear any existing content loading states
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        
        // Small delay to ensure DOM is ready and prevent conflicts
        setTimeout(() => {
            // Handle specific page navigation
            switch (page) {
                case 'dashboard':
                    this.showDashboard();
                    break;
                case 'my-attendance':
                case 'attendance':
                    this.showAttendance();
                    break;
                case 'students':
                    this.showStudents();
                    break;
                case 'classes':
                case 'my-classes':
                    this.showClasses();
                    break;
                case 'analytics':
                    this.showAnalytics();
                    break;
                case 'teachers':
                    this.showTeachers();
                    break;
                case 'gradebook':
                    this.showGradebook();
                    break;
                case 'reports':
                    this.showReports();
                    break;
                case 'settings':
                    this.showSettings();
                    break;
                case 'my-grades':
                    this.showStudentGrades();
                    break;
                case 'profile':
                    if (window.auth && window.auth.showProfile) {
                        window.auth.showProfile();
                    } else {
                        this.showComingSoon('Profile Management');
                    }
                    break;
                default:
                    console.log(`Page ${page} not implemented yet`);
                    this.showComingSoon(page);
            }
            
            // Reinitialize Lucide icons after content change
            if (window.lucide) {
                lucide.createIcons();
            }
        }, 10);
    }

    handleAction(action) {
        console.log(`Action triggered: ${action} for role: ${this.currentRole}`);
        
        switch (action) {
            case 'mark-attendance':
                this.showAttendanceMarking();
                break;
            case 'student-check-in':
                this.showStudentCheckIn();
                break;
            case 'add-user':
                this.showAddUserModal();
                break;
            case 'view-schedule':
                this.showSchedule();
                break;
            case 'view-analytics':
                this.showAnalytics();
                break;
            default:
                this.showComingSoon(action);
        }
    }

    showDashboard() {
        // Refresh dashboard data and ensure it's properly displayed
        console.log('Refreshing dashboard view');
        
        // Get main content area
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;
        
        // Reset to dashboard layout
        this.loadDashboardLayout();
        this.loadDashboardData();
    }
    
    loadDashboardLayout() {
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;
        
        const user = window.auth.getUser();
        const config = this.dashboardConfigs[user.role];
        
        // Reset the main content to dashboard layout
        mainContent.innerHTML = `
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold">${config.title}</h1>
                    <p class="text-muted-foreground">
                        ${config.subtitle}
                    </p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-muted-foreground">Today</p>
                    <p class="text-lg font-semibold" id="current-date"></p>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Stats will be populated by updateStatsGrid -->
            </div>

            <!-- Dashboard Content -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Recent Activity -->
                <div class="lg:col-span-2">
                    <div class="card">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
                            <div class="space-y-4" id="recent-activity">
                                <!-- Recent activity will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="space-y-6">
                    <div class="card">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <!-- Quick actions will be populated -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Update current date
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            currentDateElement.textContent = new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        // Setup dashboard content based on role
        this.setupDashboardContent(config.widgets);
        
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async loadDashboardData() {
        try {
            // Load real dashboard statistics
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const stats = await response.json();
                    this.updateDashboardStats(stats);
                } else {
                    // Fallback to mock data
                    this.loadMockDashboardData();
                }
            } else {
                this.loadMockDashboardData();
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.loadMockDashboardData();
        }
    }

    loadMockDashboardData() {
        const user = window.auth.getUser();
        const role = user.role;
        
        // Update with realistic mock data based on role
        const mockStats = {
            totalStudents: role === 'student' ? '8' : '2,847',
            presentToday: role === 'student' ? '7' : '2,456',
            lateArrivals: role === 'student' ? '1' : '47',
            avgDuration: '85 min',
            attendanceRate: role === 'student' ? '88.5%' : '86.3%'
        };
        
        this.updateDashboardStats(mockStats);
    }

    updateDashboardStats(stats) {
        // Update the stats in the current view
        const totalStudentsEl = document.getElementById('total-students');
        const presentTodayEl = document.getElementById('present-today');
        const lateArrivalsEl = document.getElementById('late-arrivals');
        const avgDurationEl = document.getElementById('avg-duration');
        const attendanceRateEl = document.getElementById('attendance-rate');

        if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents;
        if (presentTodayEl) presentTodayEl.textContent = stats.presentToday;
        if (lateArrivalsEl) lateArrivalsEl.textContent = stats.lateArrivals;
        if (avgDurationEl) avgDurationEl.textContent = stats.avgDuration;
        if (attendanceRateEl) attendanceRateEl.textContent = stats.attendanceRate + ' attendance rate';
    }

    showAttendance() {
        const user = window.auth.getUser();
        if (user.role === 'teacher') {
            // Load teacher attendance marking interface
            if (window.attendanceMarker) {
                window.attendanceMarker.setupAttendanceMarker();
            } else {
                // Initialize attendance marker if not already done
                window.attendanceMarker = new AttendanceMarker();
            }
        } else if (user.role === 'student') {
            // Load student attendance viewer
            if (this.studentAttendanceViewer) {
                this.studentAttendanceViewer.showStudentAttendance();
            }
        } else {
            // Admin view - show attendance overview
            this.showComingSoon('Attendance Overview');
        }
    }

    showStudents() {
        const user = window.auth.getUser();
        if (user.role === 'admin' || user.role === 'teacher') {
            // Load student management interface
            if (window.studentManager) {
                window.studentManager.loadStudentsPage();
            } else {
                // Initialize student manager if not already done
                window.studentManager = new StudentManager();
                window.studentManager.loadStudentsPage();
            }
        } else {
            this.showComingSoon('Student Management');
        }
    }

    showClasses() {
        // Load class management with real data
        this.loadClassesPage();
    }

    async loadClassesPage() {
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const user = window.auth.getUser();
        const role = user.role;

        const classesPageHtml = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">${role === 'student' ? 'My Classes' : 'Classes Management'}</h1>
                        <p class="text-muted-foreground">
                            ${role === 'student' ? 'View your enrolled classes and schedules' : 'Manage class schedules and monitor attendance'}
                        </p>
                    </div>
                    ${role !== 'student' ? `
                        <button id="add-class" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                            <i data-lucide="plus" class="h-4 w-4"></i>
                            Add Class
                        </button>
                    ` : ''}
                </div>

                <!-- Classes Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="classes-grid">
                    <!-- Classes will be loaded here -->
                </div>

                ${role !== 'student' ? `
                    <!-- All Classes Table -->
                    <div class="card">
                        <div class="p-6">
                            <h3 class="text-lg font-semibold mb-4">All Classes</h3>
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="border-b border-border">
                                            <th class="text-left py-3 px-4">Class</th>
                                            <th class="text-left py-3 px-4">Schedule</th>
                                            <th class="text-left py-3 px-4">Students</th>
                                            <th class="text-left py-3 px-4">Attendance Rate</th>
                                            <th class="text-left py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="classes-table">
                                        <!-- Table rows will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        mainContent.innerHTML = classesPageHtml;
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load classes data
        await this.loadClassesData();
        
        // Setup event handlers
        this.setupClassesEventHandlers();
    }

    async loadClassesData() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/classes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const classes = await response.json();
                    this.displayClassesData(classes);
                    return;
                }
            }
        } catch (error) {
            console.log('Using mock classes data:', error);
        }
        
        // Fallback to mock data
        this.displayMockClassesData();
    }

    displayClassesData(classes) {
        const user = window.auth.getUser();
        const role = user.role;
        
        // Display as cards
        const gridEl = document.getElementById('classes-grid');
        if (gridEl && classes.length > 0) {
            gridEl.innerHTML = classes.map(cls => `
                <div class="card p-6 hover:shadow-lg transition-shadow">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">${cls.name}</h3>
                            <p class="text-sm text-gray-600">${cls.code} - Section ${cls.section}</p>
                        </div>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${cls.attendanceRate || 'N/A'}</span>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center">
                            <i data-lucide="clock" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.schedule}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="map-pin" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.room}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="users" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.students}/${cls.capacity} students</span>
                        </div>
                        ${role !== 'student' ? `
                            <div class="flex items-center">
                                <i data-lucide="user" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>${cls.teacher}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        ${role === 'student' ? `
                            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                View Details
                            </button>
                        ` : `
                            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600" 
                                    onclick="window.attendanceMarker?.setupAttendanceMarker()">
                                Mark Attendance
                            </button>
                            <button class="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                Edit
                            </button>
                        `}
                    </div>
                </div>
            `).join('');
        }

        // Display as table for non-students
        if (role !== 'student') {
            const tableEl = document.getElementById('classes-table');
            if (tableEl && classes.length > 0) {
                tableEl.innerHTML = classes.map(cls => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4">
                            <div>
                                <div class="font-medium">${cls.name}</div>
                                <div class="text-sm text-gray-600">${cls.code} - Section ${cls.section}</div>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <div class="text-sm">${cls.schedule}</div>
                            <div class="text-xs text-gray-600">${cls.room}</div>
                        </td>
                        <td class="py-3 px-4">${cls.students}/${cls.capacity}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">${cls.attendanceRate || 'N/A'}</span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex gap-2">
                                <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                <button class="text-green-600 hover:text-green-800 text-sm" 
                                        onclick="window.attendanceMarker?.setupAttendanceMarker()">
                                    Attendance
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    displayMockClassesData() {
        const user = window.auth.getUser();
        const role = user.role;
        
        const mockClasses = [
            {
                id: 1,
                name: 'Data Structures',
                code: 'CS201',
                section: 'A',
                schedule: 'Mon, Wed, Fri 09:00-10:30',
                room: 'Room 201',
                students: 28,
                capacity: 30,
                attendanceRate: '94.2%',
                teacher: 'Dr. Sarah Smith'
            },
            {
                id: 2,
                name: 'Database Systems',
                code: 'CS301',
                section: 'B',
                schedule: 'Tue, Thu 14:00-15:30',
                room: 'Lab 301',
                students: 22,
                capacity: 25,
                attendanceRate: '89.1%',
                teacher: 'Dr. Sarah Smith'
            },
            {
                id: 3,
                name: 'Software Engineering',
                code: 'CS401',
                section: 'A',
                schedule: 'Mon, Wed 11:00-12:30',
                room: 'Room 401',
                students: 31,
                capacity: 32,
                attendanceRate: '91.5%',
                teacher: 'Dr. Sarah Smith'
            }
        ];

        // Display as cards
        const gridEl = document.getElementById('classes-grid');
        if (gridEl) {
            gridEl.innerHTML = mockClasses.map(cls => `
                <div class="card p-6 hover:shadow-lg transition-shadow">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">${cls.name}</h3>
                            <p class="text-sm text-gray-600">${cls.code} - Section ${cls.section}</p>
                        </div>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${cls.attendanceRate}</span>
                    </div>
                    
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center">
                            <i data-lucide="clock" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.schedule}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="map-pin" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.room}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="users" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.students}/${cls.capacity} students</span>
                        </div>
                        ${role !== 'student' ? `
                            <div class="flex items-center">
                                <i data-lucide="user" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>${cls.teacher}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="mt-4 flex gap-2">
                        ${role === 'student' ? `
                            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                View Details
                            </button>
                        ` : `
                            <button class="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600" 
                                    onclick="window.attendanceMarker?.setupAttendanceMarker()">
                                Mark Attendance
                            </button>
                            <button class="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                                Edit
                            </button>
                        `}
                    </div>
                </div>
            `).join('');
        }

        // Display as table for non-students
        if (role !== 'student') {
            const tableEl = document.getElementById('classes-table');
            if (tableEl) {
                tableEl.innerHTML = mockClasses.map(cls => `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4">
                            <div>
                                <div class="font-medium">${cls.name}</div>
                                <div class="text-sm text-gray-600">${cls.code} - Section ${cls.section}</div>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <div class="text-sm">${cls.schedule}</div>
                            <div class="text-xs text-gray-600">${cls.room}</div>
                        </td>
                        <td class="py-3 px-4">${cls.students}/${cls.capacity}</td>
                        <td class="py-3 px-4">
                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">${cls.attendanceRate}</span>
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex gap-2">
                                <button class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                                <button class="text-green-600 hover:text-green-800 text-sm" 
                                        onclick="window.attendanceMarker?.setupAttendanceMarker()">
                                    Attendance
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        }

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    setupClassesEventHandlers() {
        const addClassBtn = document.getElementById('add-class');
        if (addClassBtn) {
            addClassBtn.addEventListener('click', () => {
                this.showComingSoon('Add Class');
            });
        }
    }

    showAnalytics() {
        // Load analytics page with real data
        this.loadAnalyticsPage();
    }

    async loadAnalyticsPage() {
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const analyticsPageHtml = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">Analytics & Reports</h1>
                        <p class="text-muted-foreground">
                            Detailed insights into attendance patterns and performance.
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <button id="refresh-analytics" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                            <i data-lucide="refresh-cw" class="h-4 w-4 mr-2 inline"></i>
                            Refresh
                        </button>
                        <button id="export-report" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md">
                            <i data-lucide="download" class="h-4 w-4 mr-2 inline"></i>
                            Export Report
                        </button>
                    </div>
                </div>

                <!-- Analytics Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-4">Attendance Trends</h3>
                        <div class="space-y-3" id="attendance-trends">
                            <div class="animate-pulse">
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div class="h-2 bg-gray-200 rounded mb-3"></div>
                                <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                                <div class="h-2 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-4">Class Performance</h3>
                        <div class="space-y-3" id="class-performance">
                            <div class="animate-pulse">
                                <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-4/5"></div>
                            </div>
                        </div>
                    </div>

                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
                        <div class="space-y-3" id="quick-stats">
                            <div class="animate-pulse">
                                <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Analytics -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div class="space-y-3" id="recent-analytics-activity">
                            <!-- Will be populated with real data -->
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-4">Monthly Overview</h3>
                        <div id="monthly-chart" class="h-64 flex items-end justify-center space-x-2">
                            <!-- Simple bar chart will be generated -->
                        </div>
                        <div class="flex justify-center space-x-4 mt-4 text-xs text-muted-foreground">
                            <span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = analyticsPageHtml;
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load analytics data
        await this.loadAnalyticsData();
        
        // Setup event handlers
        this.setupAnalyticsEventHandlers();
    }

    async loadAnalyticsData() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/analytics/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.displayAnalyticsData(data);
                    return;
                }
            }
        } catch (error) {
            console.log('Using mock analytics data:', error);
        }
        
        // Fallback to mock data
        this.displayMockAnalyticsData();
    }

    displayAnalyticsData(data) {
        const user = window.auth.getUser();
        const role = user.role;
        
        // Attendance trends
        const trendsEl = document.getElementById('attendance-trends');
        if (trendsEl && data.trends) {
            trendsEl.innerHTML = data.trends.map(trend => `
                <div class="flex justify-between">
                    <span class="text-sm">${trend.period}</span>
                    <span class="text-sm font-medium text-green-600">${trend.rate}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full">
                    <div class="h-2 bg-green-500 rounded-full" style="width: ${trend.rate}"></div>
                </div>
            `).join('');
        }

        // Class performance
        const performanceEl = document.getElementById('class-performance');
        if (performanceEl && data.performance) {
            performanceEl.innerHTML = data.performance.map(cls => `
                <div class="flex justify-between">
                    <span class="text-sm">${cls.name}</span>
                    <span class="text-sm font-medium">${cls.rate}</span>
                </div>
            `).join('');
        }

        // Quick stats
        const statsEl = document.getElementById('quick-stats');
        if (statsEl && data.stats) {
            statsEl.innerHTML = data.stats.map(stat => `
                <div class="flex justify-between">
                    <span class="text-sm">${stat.label}</span>
                    <span class="text-sm font-medium">${stat.value}</span>
                </div>
            `).join('');
        }

        // Recent activity
        const activityEl = document.getElementById('recent-analytics-activity');
        if (activityEl && data.activities) {
            activityEl.innerHTML = data.activities.map(activity => `
                <div class="text-sm p-2 border-l-2 border-blue-500 bg-blue-50">
                    ${activity}
                </div>
            `).join('');
        }

        // Monthly chart
        if (data.monthlyData) {
            this.generateMonthlyChart(data.monthlyData);
        } else {
            this.generateMonthlyChart();
        }
    }

    displayMockAnalyticsData() {
        const user = window.auth.getUser();
        const role = user.role;
        
        // Attendance trends
        const trendsEl = document.getElementById('attendance-trends');
        if (trendsEl) {
            trendsEl.innerHTML = `
                <div class="flex justify-between">
                    <span class="text-sm">This Week</span>
                    <span class="text-sm font-medium text-green-600">89.5%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full">
                    <div class="h-2 bg-green-500 rounded-full" style="width: 89.5%"></div>
                </div>
                <div class="flex justify-between">
                    <span class="text-sm">Last Week</span>
                    <span class="text-sm font-medium text-blue-600">92.1%</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full">
                    <div class="h-2 bg-blue-500 rounded-full" style="width: 92.1%"></div>
                </div>
            `;
        }

        // Class performance
        const performanceEl = document.getElementById('class-performance');
        if (performanceEl) {
            const classes = role === 'student' 
                ? [
                    { name: 'CS201', rate: '95.0%' },
                    { name: 'CS301', rate: '87.5%' },
                    { name: 'CS401', rate: '92.0%' }
                  ]
                : [
                    { name: 'CS201 - Data Structures', rate: '94.2%' },
                    { name: 'CS301 - Database Systems', rate: '89.1%' },
                    { name: 'CS401 - Software Engineering', rate: '91.5%' },
                    { name: 'CS302 - Computer Networks', rate: '88.7%' },
                    { name: 'CS203 - Web Development', rate: '93.3%' }
                  ];
            
            performanceEl.innerHTML = classes.map(cls => `
                <div class="flex justify-between">
                    <span class="text-sm">${cls.name}</span>
                    <span class="text-sm font-medium">${cls.rate}</span>
                </div>
            `).join('');
        }

        // Quick stats
        const statsEl = document.getElementById('quick-stats');
        if (statsEl) {
            const stats = role === 'student'
                ? [
                    { label: 'Your Attendance', value: '87.5%' },
                    { label: 'Classes Attended', value: '42/48' },
                    { label: 'Perfect Attendance Days', value: '12' }
                  ]
                : [
                    { label: 'Total Classes', value: '5' },
                    { label: 'Active Students', value: '156' },
                    { label: 'Avg Attendance', value: '90.2%' }
                  ];
            
            statsEl.innerHTML = stats.map(stat => `
                <div class="flex justify-between">
                    <span class="text-sm">${stat.label}</span>
                    <span class="text-sm font-medium">${stat.value}</span>
                </div>
            `).join('');
        }

        // Recent activity
        const activityEl = document.getElementById('recent-analytics-activity');
        if (activityEl) {
            const activities = role === 'student'
                ? [
                    'Attended CS201 - Data Structures',
                    'Missed CS301 - Database Systems',
                    'Attended CS401 - Software Engineering'
                  ]
                : [
                    'CS201: 28/30 students present',
                    'CS301: 22/25 students present', 
                    'CS401: 31/32 students present'
                  ];
            
            activityEl.innerHTML = activities.map(activity => `
                <div class="text-sm p-2 border-l-2 border-blue-500 bg-blue-50">
                    ${activity}
                </div>
            `).join('');
        }

        // Monthly chart
        this.generateMonthlyChart();
    }

    generateMonthlyChart(data = null) {
        const chartEl = document.getElementById('monthly-chart');
        if (chartEl) {
            const chartData = data || [65, 78, 82, 88, 92, 89, 94]; // Mock monthly data if no data provided
            chartEl.innerHTML = chartData.map(value => `
                <div class="bg-blue-500 w-8 rounded-t" style="height: ${value}%"></div>
            `).join('');
        }
    }

    setupAnalyticsEventHandlers() {
        const refreshBtn = document.getElementById('refresh-analytics');
        const exportBtn = document.getElementById('export-report');
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadAnalyticsData();
                this.showSuccessMessage('Analytics refreshed!');
            });
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportAnalyticsReport();
            });
        }
    }

    exportAnalyticsReport() {
        // Mock export functionality
        this.showSuccessMessage('Report exported successfully!');
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="check-circle" class="h-5 w-5 mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        if (window.lucide) {
            lucide.createIcons();
        }
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    showAttendanceMarking() {
        // Same as showAttendance for teachers
        this.showAttendance();
    }

    showStudentCheckIn() {
        const user = window.auth.getUser();
        if (user.role === 'student' && this.studentAttendanceViewer) {
            this.studentAttendanceViewer.showCheckInInterface();
        } else {
            this.showComingSoon('Student Check-in');
        }
    }

    async showTeachers() {
        const user = window.auth.getUser();
        if (user.role !== 'admin') {
            this.showError('Only administrators can access teacher management');
            return;
        }
        
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        // Show loading state
        mainContent.innerHTML = `
            <div class="flex items-center justify-center h-32">
                <div class="text-muted-foreground">Loading teachers...</div>
            </div>
        `;

        try {
            // Load teacher data
            const teachersData = await this.loadTeachersData();
            
            const teachersPageHtml = `
                <div class="space-y-6">
                    <!-- Header -->
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-3xl font-bold">Teachers Management</h1>
                            <p class="text-muted-foreground">
                                Manage faculty members and their information.
                            </p>
                        </div>
                        <button id="add-teacher-btn" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                            <i data-lucide="user-plus" class="h-4 w-4"></i>
                            Add Teacher
                        </button>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div class="card">
                            <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                <h3 class="text-sm font-medium text-muted-foreground">Total Teachers</h3>
                                <i data-lucide="users" class="h-4 w-4 text-muted-foreground"></i>
                            </div>
                            <div class="px-6 pb-6">
                                <div class="text-2xl font-bold" id="total-teachers">${teachersData.stats.totalTeachers}</div>
                                <p class="text-xs text-green-600">+${teachersData.stats.newThisMonth} this month</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                <h3 class="text-sm font-medium text-muted-foreground">Active Teachers</h3>
                                <i data-lucide="user-check" class="h-4 w-4 text-muted-foreground"></i>
                            </div>
                            <div class="px-6 pb-6">
                                <div class="text-2xl font-bold text-green-600" id="active-teachers">${teachersData.stats.activeTeachers}</div>
                                <p class="text-xs text-muted-foreground">${Math.round((teachersData.stats.activeTeachers/teachersData.stats.totalTeachers)*100)}% active</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                <h3 class="text-sm font-medium text-muted-foreground">Total Classes</h3>
                                <i data-lucide="calendar" class="h-4 w-4 text-muted-foreground"></i>
                            </div>
                            <div class="px-6 pb-6">
                                <div class="text-2xl font-bold" id="total-classes">${teachersData.stats.totalClasses}</div>
                                <p class="text-xs text-muted-foreground">Across all teachers</p>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                <h3 class="text-sm font-medium text-muted-foreground">Students Teaching</h3>
                                <i data-lucide="graduation-cap" class="h-4 w-4 text-muted-foreground"></i>
                            </div>
                            <div class="px-6 pb-6">
                                <div class="text-2xl font-bold" id="total-students-teaching">${teachersData.stats.totalStudentsTeaching}</div>
                                <p class="text-xs text-muted-foreground">Total enrollment</p>
                            </div>
                        </div>
                    </div>

                    <!-- Search and Filters -->
                    <div class="card p-6">
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <input type="text" placeholder="Search teachers..." class="form-input" id="teacher-search">
                            </div>
                            <div>
                                <select class="form-input" id="department-filter">
                                    <option value="">All Departments</option>
                                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                                    <option value="Electronics & Communication">Electronics & Communication</option>
                                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                                    <option value="Civil Engineering">Civil Engineering</option>
                                    <option value="Electrical Engineering">Electrical Engineering</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                </select>
                            </div>
                            <div>
                                <select class="form-input" id="status-filter">
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <button id="apply-filters-btn" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md w-full">
                                    <i data-lucide="filter" class="h-4 w-4 inline mr-2"></i>
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Teachers List -->
                    <div class="card">
                        <div class="p-6">
                            <div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead>
                                        <tr class="border-b border-border">
                                            <th class="text-left py-3 px-4">Teacher</th>
                                            <th class="text-left py-3 px-4">ID</th>
                                            <th class="text-left py-3 px-4">Department</th>
                                            <th class="text-left py-3 px-4">Experience</th>
                                            <th class="text-left py-3 px-4">Classes</th>
                                            <th class="text-left py-3 px-4">Students</th>
                                            <th class="text-left py-3 px-4">Status</th>
                                            <th class="text-left py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="teachers-table-body">
                                        <!-- Teachers will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            mainContent.innerHTML = teachersPageHtml;
            
            // Load teachers table
            this.populateTeachersTable(teachersData.teachers);
            
            // Setup event listeners
            this.setupTeachersEventListeners();
            
            // Reinitialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
            
        } catch (error) {
            console.error('Error loading teachers page:', error);
            mainContent.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-red-600">Error loading teachers data. Please try again.</p>
                    <button onclick="window.roleBasedDashboard.showTeachers()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Retry
                    </button>
                </div>
            `;
        }
    }
    
    async loadTeachersData() {
        try {
            const token = localStorage.getItem('token');
            const [teachersResponse, statsResponse] = await Promise.all([
                fetch('http://localhost:3000/api/teachers', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('http://localhost:3000/api/teachers/stats/overview', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);
            
            const teachersData = await teachersResponse.json();
            const statsData = await statsResponse.json();
            
            return {
                teachers: teachersData.success ? teachersData.data.teachers : [],
                stats: statsData.success ? statsData.data : {
                    totalTeachers: 89,
                    activeTeachers: 84,
                    newThisMonth: 3,
                    totalClasses: 156,
                    totalStudentsTeaching: 2847
                }
            };
        } catch (error) {
            console.error('Error loading teachers data:', error);
            // Return mock data as fallback
            return {
                teachers: [
                    {
                        id: 2,
                        firstName: 'Rajesh',
                        lastName: 'Sharma',
                        email: 'rajesh.sharma@svnit.ac.in',
                        teacherId: 'CSE001',
                        department: 'Computer Science & Engineering',
                        experience: '12 years',
                        totalClasses: 8,
                        totalStudents: 245,
                        isActive: true,
                        phone: '+91-9876543211'
                    },
                    {
                        id: 3,
                        firstName: 'Priya',
                        lastName: 'Gupta',
                        email: 'priya.gupta@svnit.ac.in',
                        teacherId: 'MATH001',
                        department: 'Mathematics',
                        experience: '8 years',
                        totalClasses: 6,
                        totalStudents: 180,
                        isActive: true,
                        phone: '+91-9876543212'
                    },
                    {
                        id: 4,
                        firstName: 'Anil',
                        lastName: 'Verma',
                        email: 'anil.verma@svnit.ac.in',
                        teacherId: 'ECE001',
                        department: 'Electronics & Communication',
                        experience: '15 years',
                        totalClasses: 7,
                        totalStudents: 210,
                        isActive: true,
                        phone: '+91-9876543213'
                    }
                ],
                stats: {
                    totalTeachers: 245,
                    activeTeachers: 231,
                    newThisMonth: 8,
                    totalClasses: 387,
                    totalStudentsTeaching: 12450
                }
            };
        }
    }
    
    populateTeachersTable(teachers) {
        const tbody = document.getElementById('teachers-table-body');
        if (!tbody) return;
        
        if (teachers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-muted-foreground">
                        No teachers found
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = teachers.map(teacher => `
            <tr class="border-b border-border hover:bg-accent/50">
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                        <div class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="text-xs font-medium text-primary">${teacher.firstName[0]}${teacher.lastName[0]}</span>
                        </div>
                        <div>
                            <p class="font-medium">${teacher.firstName} ${teacher.lastName}</p>
                            <p class="text-sm text-muted-foreground">${teacher.email}</p>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="font-mono text-sm">${teacher.teacherId}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-sm">${teacher.department}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-sm">${teacher.experience || 'N/A'}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-sm font-medium">${teacher.totalClasses || 0}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="text-sm font-medium">${teacher.totalStudents || 0}</span>
                </td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${teacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                        <button onclick="window.roleBasedDashboard.viewTeacher(${teacher.id})" 
                                class="text-blue-600 hover:text-blue-800 text-sm">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.roleBasedDashboard.editTeacher(${teacher.id})" 
                                class="text-green-600 hover:text-green-800 text-sm">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                        <button onclick="window.roleBasedDashboard.toggleTeacherStatus(${teacher.id}, ${!teacher.isActive})" 
                                class="text-${teacher.isActive ? 'red' : 'green'}-600 hover:text-${teacher.isActive ? 'red' : 'green'}-800 text-sm">
                            <i data-lucide="${teacher.isActive ? 'user-x' : 'user-check'}" class="h-4 w-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Reinitialize Lucide icons for the table
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    setupTeachersEventListeners() {
        // Add Teacher button
        const addTeacherBtn = document.getElementById('add-teacher-btn');
        if (addTeacherBtn) {
            addTeacherBtn.addEventListener('click', () => {
                this.showAddTeacherModal();
            });
        }
        
        // Apply filters button
        const applyFiltersBtn = document.getElementById('apply-filters-btn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                this.applyTeacherFilters();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('teacher-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyTeacherFilters();
                }, 300);
            });
        }
    }
    
    showAddTeacherModal() {
        // Use the existing add user modal but preset role to teacher
        this.showAddUserModal();
        
        // After modal opens, preset the role to teacher
        setTimeout(() => {
            const roleSelect = document.getElementById('user-role');
            if (roleSelect) {
                roleSelect.value = 'teacher';
                roleSelect.dispatchEvent(new Event('change'));
            }
        }, 100);
    }
    
    async applyTeacherFilters() {
        const search = document.getElementById('teacher-search')?.value || '';
        const department = document.getElementById('department-filter')?.value || '';
        const status = document.getElementById('status-filter')?.value || 'all';
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/teachers?search=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}&status=${status}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.populateTeachersTable(data.data.teachers);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }
    
    async viewTeacher(teacherId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (data.success) {
                this.showTeacherDetailsModal(data.data);
            } else {
                this.showError('Failed to load teacher details');
            }
        } catch (error) {
            console.error('Error loading teacher details:', error);
            this.showError('Error loading teacher details');
        }
    }
    
    showTeacherDetailsModal(teacher) {
        const modalHtml = `
            <div class="w-full max-w-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold">Teacher Details</h2>
                    <button onclick="modalManager.close()" class="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                        <i data-lucide="x" class="h-4 w-4"></i>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="flex items-center space-x-4">
                        <div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span class="text-xl font-medium text-primary">${teacher.firstName[0]}${teacher.lastName[0]}</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold">${teacher.firstName} ${teacher.lastName}</h3>
                            <p class="text-muted-foreground">${teacher.department}</p>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">
                                ${teacher.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-medium mb-3">Personal Information</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>Teacher ID:</strong> ${teacher.teacherId}</p>
                                <p><strong>Email:</strong> ${teacher.email}</p>
                                <p><strong>Phone:</strong> ${teacher.phone || 'N/A'}</p>
                                <p><strong>Experience:</strong> ${teacher.experience || 'N/A'}</p>
                                <p><strong>Qualification:</strong> ${teacher.qualification || 'N/A'}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-medium mb-3">Teaching Information</h4>
                            <div class="space-y-2 text-sm">
                                <p><strong>Department:</strong> ${teacher.department}</p>
                                <p><strong>Total Classes:</strong> ${teacher.totalClasses || 0}</p>
                                <p><strong>Total Students:</strong> ${teacher.totalStudents || 0}</p>
                                <p><strong>Office:</strong> ${teacher.office || 'N/A'}</p>
                                <p><strong>Office Hours:</strong> ${teacher.officeHours || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    ${teacher.subjects && teacher.subjects.length > 0 ? `
                        <div>
                            <h4 class="font-medium mb-3">Subjects Teaching</h4>
                            <div class="flex flex-wrap gap-2">
                                ${teacher.subjects.map(subject => `
                                    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">${subject}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${teacher.bio ? `
                        <div>
                            <h4 class="font-medium mb-3">Biography</h4>
                            <p class="text-sm text-muted-foreground">${teacher.bio}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="flex space-x-3 pt-6 mt-6 border-t">
                    <button onclick="window.roleBasedDashboard.editTeacher(${teacher.id}); modalManager.close();" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md">
                        Edit Teacher
                    </button>
                    <button onclick="modalManager.close()" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        modalManager.open(modalHtml);
        if (window.lucide) lucide.createIcons();
    }
    
    editTeacher(teacherId) {
        this.showComingSoon('Edit Teacher functionality');
    }
    
    async toggleTeacherStatus(teacherId, newStatus) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/teachers/${teacherId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: newStatus })
            });
            
            const data = await response.json();
            if (data.success) {
                this.showSuccess(`Teacher ${newStatus ? 'activated' : 'deactivated'} successfully`);
                // Refresh the teachers list
                this.applyTeacherFilters();
            } else {
                this.showError(data.message || 'Failed to update teacher status');
            }
        } catch (error) {
            console.error('Error updating teacher status:', error);
            this.showError('Error updating teacher status');
        }
    }

    showGradebook() {
        this.showComingSoon('Gradebook');
    }

    showReports() {
        this.showComingSoon('Reports');
    }

    showSettings() {
        this.showComingSoon('Settings');
    }

    showStudentGrades() {
        this.showComingSoon('Student Grades');
    }

    showAddUserModal() {
        // Show proper add user modal based on admin role
        const user = window.auth.getUser();
        if (user.role !== 'admin') {
            this.showError('Only administrators can add users');
            return;
        }
        
        const modalHtml = `
            <div class="w-full max-w-lg">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold">Add New User</h2>
                    <button onclick="modalManager.close()" class="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                        <i data-lucide="x" class="h-4 w-4"></i>
                    </button>
                </div>
                
                <form id="add-user-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">First Name</label>
                            <input type="text" class="form-input" id="user-firstname" placeholder="First name" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Last Name</label>
                            <input type="text" class="form-input" id="user-lastname" placeholder="Last name" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Username</label>
                        <input type="text" class="form-input" id="user-username" placeholder="Username" required>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Email</label>
                        <input type="email" class="form-input" id="user-email" placeholder="user@example.com" required>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Password</label>
                            <input type="password" class="form-input" id="user-password" placeholder="Password" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Confirm Password</label>
                            <input type="password" class="form-input" id="user-confirm-password" placeholder="Confirm password" required>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Role</label>
                        <select class="form-input" id="user-role" required>
                            <option value="">Select role...</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    
                    <div id="role-specific-fields">
                        <!-- Role-specific fields will be added here -->
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Phone (Optional)</label>
                        <input type="tel" class="form-input" id="user-phone" placeholder="Phone number">
                    </div>
                    
                    <div class="flex space-x-3 pt-4">
                        <button type="submit" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex-1">
                            Add User
                        </button>
                        <button type="button" onclick="modalManager.close()" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        modalManager.open(modalHtml);
        
        // Setup role-specific field handling
        this.setupRoleSpecificFields();
        
        // Handle form submission
        document.getElementById('add-user-form').addEventListener('submit', (e) => {
            this.handleAddUserSubmit(e);
        });
    }

    showSchedule() {
        this.showComingSoon('Schedule View');
    }

    setupRoleSpecificFields() {
        const roleSelect = document.getElementById('user-role');
        const roleSpecificFields = document.getElementById('role-specific-fields');
        
        roleSelect.addEventListener('change', (e) => {
            const role = e.target.value;
            roleSpecificFields.innerHTML = '';
            
            if (role === 'student') {
                roleSpecificFields.innerHTML = `
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Student ID</label>
                            <input type="text" class="form-input" id="user-student-id" placeholder="e.g., STU001">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Year</label>
                            <select class="form-input" id="user-year">
                                <option value="">Select year...</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Department</label>
                        <select class="form-input" id="user-department">
                            <option value="">Select department...</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Physics">Physics</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                        </select>
                    </div>
                `;
            } else if (role === 'teacher') {
                roleSpecificFields.innerHTML = `
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Teacher ID</label>
                            <input type="text" class="form-input" id="user-teacher-id" placeholder="e.g., TCH001">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Department</label>
                            <select class="form-input" id="user-department">
                                <option value="">Select department...</option>
                                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                                <option value="Electronics & Communication">Electronics & Communication</option>
                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                <option value="Civil Engineering">Civil Engineering</option>
                                <option value="Electrical Engineering">Electrical Engineering</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                            </select>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    async handleAddUserSubmit(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('user-firstname').value,
            lastName: document.getElementById('user-lastname').value,
            username: document.getElementById('user-username').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            confirmPassword: document.getElementById('user-confirm-password').value,
            role: document.getElementById('user-role').value,
            phone: document.getElementById('user-phone').value
        };
        
        // Add role-specific data
        if (formData.role === 'student') {
            formData.studentId = document.getElementById('user-student-id')?.value;
            formData.year = document.getElementById('user-year')?.value;
            formData.department = document.getElementById('user-department')?.value;
        } else if (formData.role === 'teacher') {
            formData.teacherId = document.getElementById('user-teacher-id')?.value;
            formData.department = document.getElementById('user-department')?.value;
        }
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            console.log('🔐 Creating user with data:', formData);
            console.log('🔑 Using token:', token ? 'Present' : 'Missing');
            
            // Test API connectivity first
            try {
                const testResponse = await fetch('http://localhost:3000/api/auth/test');
                if (!testResponse.ok) {
                    throw new Error('Server is not responding properly');
                }
                console.log('✅ Server connectivity test passed');
            } catch (testError) {
                console.error('❌ Server connectivity test failed:', testError);
                throw new Error('Cannot connect to server at http://localhost:3000');
            }
            
            const response = await fetch('http://localhost:3000/api/auth/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                modalManager.close();
                this.showSuccess(`User ${formData.firstName} ${formData.lastName} added successfully`);
                // Refresh the current page if on users/students page
                this.refreshCurrentPage();
            } else {
                console.error('Server error:', result);
                let errorMessage = result.message || 'Failed to add user';
                
                // Provide more specific error messages
                if (response.status === 401) {
                    errorMessage = 'Authentication failed. Please login again.';
                } else if (response.status === 403) {
                    errorMessage = 'Access denied. Admin privileges required.';
                } else if (response.status === 409) {
                    errorMessage = 'User with this email or username already exists.';
                } else if (response.status === 400) {
                    errorMessage = result.message || 'Invalid input data provided.';
                }
                
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Error adding user:', error);
            
            // More specific error handling
            if (error.name === 'TypeError') {
                if (error.message.includes('fetch')) {
                    this.showError('Unable to connect to server. Please check if the server is running on http://localhost:3000');
                } else if (error.message.includes('NetworkError')) {
                    this.showError('Network error: Cannot reach the server. Please check your connection.');
                } else {
                    this.showError('Network error: ' + error.message);
                }
            } else if (error.name === 'SyntaxError') {
                this.showError('Server returned invalid response. Please check server logs.');
            } else {
                this.showError('Unexpected error: ' + error.message);
            }
        }
    }
    
    refreshCurrentPage() {
        // Get current active nav item
        const activeNav = document.querySelector('.nav-item.nav-active');
        if (activeNav) {
            const currentPage = activeNav.getAttribute('data-page');
            this.handleNavigation(currentPage);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 5000);
    }

    showComingSoon(feature) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 w-full max-w-md mx-4 text-center">
                <div class="mb-4">
                    <i data-lucide="construction" class="h-16 w-16 text-orange-500 mx-auto mb-4"></i>
                    <h3 class="text-xl font-semibold mb-2">Coming Soon!</h3>
                    <p class="text-gray-600 mb-6">${feature} functionality is under development.</p>
                    <button id="close-coming-soon" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Got it
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        if (window.lucide) lucide.createIcons();

        const closeBtn = modal.querySelector('#close-coming-soon');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    setupRoleBasedEventHandlers() {
        // Setup navigation and action handlers
        this.setupNavigationHandlers();
        this.setupActionHandlers();
        console.log(`Event handlers set up for role: ${this.currentRole}`);
    }



    showStudentClasses() {
        // Placeholder for student classes view
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="space-y-6">
                <div>
                    <h1 class="text-3xl font-bold">My Classes</h1>
                    <p class="text-muted-foreground">View your enrolled classes and schedules</p>
                </div>
                
                <div class="grid gap-4">
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-2">CS201 - Data Structures</h3>
                        <p class="text-gray-600 mb-4">Introduction to fundamental data structures and algorithms</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div class="flex items-center">
                                <i data-lucide="calendar" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Mon, Wed, Fri</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="clock" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>09:00-10:30</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="map-pin" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Room 201</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="user" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Dr. Sarah Smith</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold mb-2">CS301 - Database Systems</h3>
                        <p class="text-gray-600 mb-4">Design and implementation of database systems</p>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div class="flex items-center">
                                <i data-lucide="calendar" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Tue, Thu</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="clock" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>14:00-15:30</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="map-pin" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Lab 301</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="user" class="h-4 w-4 mr-2 text-gray-400"></i>
                                <span>Dr. Sarah Smith</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    hasPermission(permission) {
        const config = this.dashboardConfigs[this.currentRole];
        return config && config.permissions.includes(permission);
    }

    getCurrentRole() {
        return this.currentRole;
    }

    refreshDashboard() {
        this.setupRoleBasedDashboard();
    }
}

// Initialize role-based dashboard when auth is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for auth to initialize
    setTimeout(() => {
        window.roleBasedDashboard = new RoleBasedDashboard();
    }, 500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleBasedDashboard;
}