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
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    setupRoleBasedDashboard() {
        const user = window.auth.getUser();
        if (!user) return;

        this.currentRole = user.role;
        const config = this.dashboardConfigs[this.currentRole];
        
        if (config) {
            this.updateNavigation(config.navigation);
            this.updateDashboardHeader(config.title, config.subtitle);
            this.setupDashboardContent(config.widgets);
            this.setupRoleBasedEventHandlers();
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
        
        // You can implement specific page handling here
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
        this.loadDashboardData();
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
            totalStudents: role === 'student' ? '4' : '1,247',
            presentToday: role === 'student' ? '3' : '1,089',
            lateArrivals: role === 'student' ? '0' : '23',
            avgDuration: '52 min',
            attendanceRate: role === 'student' ? '87.5%' : '87.3%'
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

    showTeachers() {
        this.showComingSoon('Teacher Management');
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
        // Redirect to register page for now
        window.location.href = '/register.html';
    }

    showSchedule() {
        this.showComingSoon('Schedule View');
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