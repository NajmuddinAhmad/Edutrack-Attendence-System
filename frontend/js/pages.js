// Students page functionality
function loadStudentsPage() {
    const mainContent = document.querySelector('main .p-6');
    if (!mainContent) return;

    const studentsPageHtml = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold">Students Management</h1>
                    <p class="text-muted-foreground">
                        Manage student records and view attendance history.
                    </p>
                </div>
                <button onclick="showAddStudentModal()" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                    <i data-lucide="user-plus" class="h-4 w-4"></i>
                    Add Student
                </button>
            </div>

            <!-- Search and Filters -->
            <div class="card p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <input type="text" placeholder="Search students..." class="form-input" id="student-search">
                    </div>
                    <div>
                        <select class="form-input" id="department-filter">
                            <option value="">All Departments</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Physics">Physics</option>
                            <option value="Biology">Biology</option>
                        </select>
                    </div>
                    <div>
                        <select class="form-input" id="year-filter">
                            <option value="">All Years</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                        </select>
                    </div>
                    <div>
                        <button class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md w-full">
                            <i data-lucide="filter" class="h-4 w-4 inline mr-2"></i>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <!-- Students List -->
            <div class="card">
                <div class="p-6">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-border">
                                    <th class="text-left py-3 px-4">Student</th>
                                    <th class="text-left py-3 px-4">ID</th>
                                    <th class="text-left py-3 px-4">Department</th>
                                    <th class="text-left py-3 px-4">Year</th>
                                    <th class="text-left py-3 px-4">Attendance Rate</th>
                                    <th class="text-left py-3 px-4">Status</th>
                                    <th class="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="students-table-body">
                                <!-- Students will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = studentsPageHtml;
    lucide.createIcons();
    
    // Load students data
    loadStudentsData();
}

// Classes page functionality
function loadClassesPage() {
    const mainContent = document.querySelector('main .p-6');
    if (!mainContent) return;

    const classesPageHtml = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold">Classes Management</h1>
                    <p class="text-muted-foreground">
                        Manage class schedules and monitor attendance.
                    </p>
                </div>
                <button onclick="showScheduleClassModal()" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                    <i data-lucide="calendar-plus" class="h-4 w-4"></i>
                    Schedule Class
                </button>
            </div>

            <!-- Today's Classes -->
            <div class="card">
                <div class="p-6">
                    <h3 class="text-lg font-semibold mb-4">Today's Classes</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="todays-classes">
                        <!-- Today's classes will be loaded here -->
                    </div>
                </div>
            </div>

            <!-- All Classes -->
            <div class="card">
                <div class="p-6">
                    <h3 class="text-lg font-semibold mb-4">All Classes</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-border">
                                    <th class="text-left py-3 px-4">Class</th>
                                    <th class="text-left py-3 px-4">Subject</th>
                                    <th class="text-left py-3 px-4">Instructor</th>
                                    <th class="text-left py-3 px-4">Schedule</th>
                                    <th class="text-left py-3 px-4">Students</th>
                                    <th class="text-left py-3 px-4">Attendance Rate</th>
                                    <th class="text-left py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="classes-table-body">
                                <!-- Classes will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = classesPageHtml;
    lucide.createIcons();
    
    // Load classes data
    loadClassesData();
}

// Analytics page functionality
function loadAnalyticsPage() {
    const mainContent = document.querySelector('main .p-6');
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
                    <button class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                        Export Report
                    </button>
                    <button class="gradient-btn text-primary-foreground px-4 py-2 rounded-md">
                        Generate Report
                    </button>
                </div>
            </div>

            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">Attendance Trends</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm">This Week</span>
                            <span class="text-sm font-medium">89.5%</span>
                        </div>
                        <div class="progress-bar h-2">
                            <div class="progress-fill" style="width: 89.5%"></div>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Last Week</span>
                            <span class="text-sm font-medium">92.1%</span>
                        </div>
                        <div class="progress-bar h-2">
                            <div class="progress-fill" style="width: 92.1%"></div>
                        </div>
                    </div>
                </div>

                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">Top Performing Classes</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm">PHY301</span>
                            <span class="text-sm font-medium">96.8%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">MATH201</span>
                            <span class="text-sm font-medium">94.2%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">CS101</span>
                            <span class="text-sm font-medium">91.5%</span>
                        </div>
                    </div>
                </div>

                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">Department Overview</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span class="text-sm">Computer Science</span>
                            <span class="text-sm font-medium">88.9%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Mathematics</span>
                            <span class="text-sm font-medium">92.3%</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm">Physics</span>
                            <span class="text-sm font-medium">90.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detailed Chart -->
            <div class="card p-6">
                <h3 class="text-lg font-semibold mb-4">Monthly Attendance Chart</h3>
                <div class="h-64 flex items-end justify-center space-x-2">
                    <div class="bg-primary/20 h-32 w-8 rounded-t"></div>
                    <div class="bg-primary/40 h-40 w-8 rounded-t"></div>
                    <div class="bg-primary/60 h-36 w-8 rounded-t"></div>
                    <div class="bg-primary/80 h-48 w-8 rounded-t"></div>
                    <div class="bg-primary h-44 w-8 rounded-t"></div>
                    <div class="bg-primary/70 h-52 w-8 rounded-t"></div>
                    <div class="bg-primary/90 h-38 w-8 rounded-t"></div>
                </div>
                <div class="flex justify-center space-x-8 mt-4 text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                </div>
            </div>
        </div>
    `;

    mainContent.innerHTML = analyticsPageHtml;
    lucide.createIcons();
}

// Settings page functionality
function loadSettingsPage() {
    const mainContent = document.querySelector('main .p-6');
    if (!mainContent) return;

    const settingsPageHtml = `
        <div class="space-y-6">
            <!-- Header -->
            <div>
                <h1 class="text-3xl font-bold">Settings</h1>
                <p class="text-muted-foreground">
                    Configure your attendance system preferences.
                </p>
            </div>

            <!-- Settings Sections -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- General Settings -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">General Settings</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">School/Institution Name</label>
                            <input type="text" class="form-input" value="University of Excellence">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Academic Year</label>
                            <select class="form-input">
                                <option>2024-2025</option>
                                <option>2025-2026</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Default Attendance Threshold</label>
                            <input type="number" class="form-input" value="75" min="0" max="100">
                            <p class="text-xs text-muted-foreground mt-1">Minimum attendance percentage required</p>
                        </div>
                    </div>
                </div>

                <!-- Notification Settings -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">Notifications</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium">Email Notifications</p>
                                <p class="text-xs text-muted-foreground">Receive updates via email</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium">Low Attendance Alerts</p>
                                <p class="text-xs text-muted-foreground">Alert when attendance drops below threshold</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- User Profile -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">User Profile</h3>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4">
                            <div class="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span class="text-lg font-medium text-primary">DS</span>
                            </div>
                            <div>
                                <p class="font-medium">Dr. Smith</p>
                                <p class="text-sm text-muted-foreground">Professor</p>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Full Name</label>
                            <input type="text" class="form-input" value="Dr. John Smith">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" class="form-input" value="dr.smith@university.edu">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Department</label>
                            <input type="text" class="form-input" value="Computer Science">
                        </div>
                    </div>
                </div>

                <!-- System Settings -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold mb-4">System Settings</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Time Zone</label>
                            <select class="form-input">
                                <option>UTC-5 (Eastern Time)</option>
                                <option>UTC-6 (Central Time)</option>
                                <option>UTC-7 (Mountain Time)</option>
                                <option>UTC-8 (Pacific Time)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Date Format</label>
                            <select class="form-input">
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                                <option>YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium">Dark Mode</p>
                                <p class="text-xs text-muted-foreground">Toggle dark theme</p>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" class="sr-only peer">
                                <div class="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Button -->
            <div class="flex justify-end">
                <button class="gradient-btn text-primary-foreground px-6 py-2 rounded-md">
                    Save Settings
                </button>
            </div>
        </div>
    `;

    mainContent.innerHTML = settingsPageHtml;
    lucide.createIcons();
}

// Mock data loading functions
function loadStudentsData() {
    const tableBody = document.getElementById('students-table-body');
    if (!tableBody) return;

    const students = [
        { name: 'Alex Johnson', id: 'STU001', department: 'Computer Science', year: '3', attendance: '92.5%', status: 'Active' },
        { name: 'Maya Rodriguez', id: 'STU002', department: 'Mathematics', year: '2', attendance: '88.3%', status: 'Active' },
        { name: 'Emma Smith', id: 'STU003', department: 'English', year: '4', attendance: '95.1%', status: 'Active' },
        { name: 'David Kim', id: 'STU004', department: 'Physics', year: '1', attendance: '87.9%', status: 'Active' },
        { name: 'Lisa Chen', id: 'STU005', department: 'Biology', year: '3', attendance: '91.2%', status: 'Active' }
    ];

    tableBody.innerHTML = students.map(student => `
        <tr class="border-b border-border hover:bg-accent/50">
            <td class="py-3 px-4">
                <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span class="text-xs font-medium">${student.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span class="font-medium">${student.name}</span>
                </div>
            </td>
            <td class="py-3 px-4">${student.id}</td>
            <td class="py-3 px-4">${student.department}</td>
            <td class="py-3 px-4">${student.year}</td>
            <td class="py-3 px-4">${student.attendance}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
                    ${student.status}
                </span>
            </td>
            <td class="py-3 px-4">
                <div class="flex space-x-2">
                    <button class="text-primary hover:text-primary/80">
                        <i data-lucide="eye" class="h-4 w-4"></i>
                    </button>
                    <button class="text-muted-foreground hover:text-foreground">
                        <i data-lucide="edit" class="h-4 w-4"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function loadClassesData() {
    const tableBody = document.getElementById('classes-table-body');
    const todaysClasses = document.getElementById('todays-classes');
    
    if (tableBody) {
        const classes = [
            { name: 'CS101', subject: 'Computer Science', instructor: 'Dr. Smith', schedule: 'Mon, Wed, Fri 9:00 AM', students: '45', attendance: '89.2%' },
            { name: 'MATH201', subject: 'Advanced Mathematics', instructor: 'Prof. Johnson', schedule: 'Tue, Thu 10:30 AM', students: '38', attendance: '92.1%' },
            { name: 'ENG102', subject: 'English Literature', instructor: 'Dr. Wilson', schedule: 'Mon, Wed 2:00 PM', students: '42', attendance: '87.5%' },
            { name: 'PHY301', subject: 'Physics', instructor: 'Prof. Brown', schedule: 'Tue, Thu 11:00 AM', students: '35', attendance: '94.3%' }
        ];

        tableBody.innerHTML = classes.map(cls => `
            <tr class="border-b border-border hover:bg-accent/50">
                <td class="py-3 px-4 font-medium">${cls.name}</td>
                <td class="py-3 px-4">${cls.subject}</td>
                <td class="py-3 px-4">${cls.instructor}</td>
                <td class="py-3 px-4">${cls.schedule}</td>
                <td class="py-3 px-4">${cls.students}</td>
                <td class="py-3 px-4">${cls.attendance}</td>
                <td class="py-3 px-4">
                    <div class="flex space-x-2">
                        <button class="text-primary hover:text-primary/80" onclick="showMarkAttendanceModal()">
                            <i data-lucide="user-check" class="h-4 w-4"></i>
                        </button>
                        <button class="text-muted-foreground hover:text-foreground">
                            <i data-lucide="edit" class="h-4 w-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    if (todaysClasses) {
        const todayClasses = [
            { name: 'CS101', time: '9:00 AM', instructor: 'Dr. Smith', students: 45, status: 'In Progress' },
            { name: 'MATH201', time: '10:30 AM', instructor: 'Prof. Johnson', students: 38, status: 'Upcoming' },
            { name: 'ENG102', time: '2:00 PM', instructor: 'Dr. Wilson', students: 42, status: 'Upcoming' }
        ];

        todaysClasses.innerHTML = todayClasses.map(cls => `
            <div class="card p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold">${cls.name}</h4>
                    <span class="text-xs px-2 py-1 rounded-full ${cls.status === 'In Progress' ? 'badge-success' : 'bg-muted text-muted-foreground'}">
                        ${cls.status}
                    </span>
                </div>
                <p class="text-sm text-muted-foreground">${cls.instructor}</p>
                <p class="text-sm text-muted-foreground">${cls.time} • ${cls.students} students</p>
                <div class="mt-3">
                    <button onclick="showMarkAttendanceModal()" class="gradient-btn text-primary-foreground px-3 py-1 text-xs rounded-md">
                        Mark Attendance
                    </button>
                </div>
            </div>
        `).join('');
    }

    lucide.createIcons();
}