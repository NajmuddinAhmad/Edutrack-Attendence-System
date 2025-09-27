// Student Attendance Feature
class StudentAttendanceViewer {
    constructor() {
        this.currentUser = null;
        this.attendanceData = [];
        this.init();
    }

    init() {
        if (window.auth && window.auth.getUser()) {
            this.currentUser = window.auth.getUser();
            if (this.currentUser.role === 'student') {
                this.setupAttendanceViewer();
            }
        }
    }

    async setupAttendanceViewer() {
        // Create the attendance viewer interface
        const content = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">My Attendance</h1>
                        <p class="text-muted-foreground">Track your attendance across all enrolled classes</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-muted-foreground">Student ID</p>
                        <p class="text-lg font-semibold">${this.currentUser.studentId || 'N/A'}</p>
                    </div>
                </div>

                <!-- Attendance Overview Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="card">
                        <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 class="text-sm font-medium text-muted-foreground">Overall Attendance</h3>
                            <i data-lucide="calendar-check" class="h-4 w-4 text-muted-foreground"></i>
                        </div>
                        <div class="px-6 pb-6">
                            <div class="text-2xl font-bold" id="overall-attendance">87.5%</div>
                            <p class="text-xs text-green-600">+2.1% from last month</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 class="text-sm font-medium text-muted-foreground">Classes Enrolled</h3>
                            <i data-lucide="book-open" class="h-4 w-4 text-muted-foreground"></i>
                        </div>
                        <div class="px-6 pb-6">
                            <div class="text-2xl font-bold" id="total-classes">6</div>
                            <p class="text-xs text-blue-600">Active this semester</p>
                        </div>
                    </div>

                    <div class="card">
                        <div class="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 class="text-sm font-medium text-muted-foreground">This Week</h3>
                            <i data-lucide="clock" class="h-4 w-4 text-muted-foreground"></i>
                        </div>
                        <div class="px-6 pb-6">
                            <div class="text-2xl font-bold" id="week-attendance">12/14</div>
                            <p class="text-xs text-green-600">85.7% attendance</p>
                        </div>
                    </div>
                </div>

                <!-- Attendance by Class -->
                <div class="card">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold mb-4">Attendance by Class</h3>
                        <div id="class-attendance-list" class="space-y-4">
                            <!-- Dynamic content will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Recent Attendance -->
                <div class="card">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold mb-4">Recent Attendance Records</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b">
                                        <th class="text-left py-2">Date</th>
                                        <th class="text-left py-2">Class</th>
                                        <th class="text-left py-2">Time</th>
                                        <th class="text-left py-2">Status</th>
                                        <th class="text-left py-2">Notes</th>
                                    </tr>
                                </thead>
                                <tbody id="recent-attendance-table">
                                    <!-- Dynamic content will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    async loadAttendanceData() {
        // Mock data for demonstration
        const mockData = {
            classes: [
                {
                    id: 1,
                    name: "Data Structures",
                    code: "CS201",
                    teacher: "Dr. Smith",
                    totalSessions: 24,
                    attendedSessions: 21,
                    percentage: 87.5
                },
                {
                    id: 2,
                    name: "Database Systems",
                    code: "CS301",
                    teacher: "Prof. Johnson", 
                    totalSessions: 20,
                    attendedSessions: 18,
                    percentage: 90.0
                },
                {
                    id: 3,
                    name: "Software Engineering",
                    code: "CS401",
                    teacher: "Dr. Williams",
                    totalSessions: 22,
                    attendedSessions: 19,
                    percentage: 86.4
                }
            ],
            recentRecords: [
                {
                    date: "2025-09-27",
                    class: "CS201",
                    time: "09:00 AM",
                    status: "Present",
                    notes: ""
                },
                {
                    date: "2025-09-26",
                    class: "CS301", 
                    time: "02:00 PM",
                    status: "Present",
                    notes: ""
                },
                {
                    date: "2025-09-25",
                    class: "CS401",
                    time: "11:00 AM",
                    status: "Late",
                    notes: "Arrived 10 minutes late"
                },
                {
                    date: "2025-09-24",
                    class: "CS201",
                    time: "09:00 AM",
                    status: "Absent",
                    notes: "Medical leave"
                }
            ]
        };

        this.attendanceData = mockData;
        this.renderClassAttendance();
        this.renderRecentAttendance();
    }

    renderClassAttendance() {
        const container = document.getElementById('class-attendance-list');
        if (!container) return;

        let html = '';
        this.attendanceData.classes.forEach(cls => {
            const statusColor = cls.percentage >= 80 ? 'text-green-600' : cls.percentage >= 70 ? 'text-yellow-600' : 'text-red-600';
            const bgColor = cls.percentage >= 80 ? 'bg-green-50' : cls.percentage >= 70 ? 'bg-yellow-50' : 'bg-red-50';
            
            html += `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg ${bgColor}">
                    <div class="flex-1">
                        <h4 class="font-semibold">${cls.name}</h4>
                        <p class="text-sm text-gray-600">${cls.code} • ${cls.teacher}</p>
                    </div>
                    <div class="text-center mr-4">
                        <div class="text-sm text-gray-600">Sessions</div>
                        <div class="font-semibold">${cls.attendedSessions}/${cls.totalSessions}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm text-gray-600">Attendance</div>
                        <div class="font-bold ${statusColor}">${cls.percentage}%</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderRecentAttendance() {
        const tbody = document.getElementById('recent-attendance-table');
        if (!tbody) return;

        let html = '';
        this.attendanceData.recentRecords.forEach(record => {
            const statusColor = {
                'Present': 'text-green-600 bg-green-50',
                'Late': 'text-yellow-600 bg-yellow-50',
                'Absent': 'text-red-600 bg-red-50',
                'Excused': 'text-blue-600 bg-blue-50'
            }[record.status] || 'text-gray-600';

            html += `
                <tr class="border-b">
                    <td class="py-3">${new Date(record.date).toLocaleDateString()}</td>
                    <td class="py-3">${record.class}</td>
                    <td class="py-3">${record.time}</td>
                    <td class="py-3">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${record.status}
                        </span>
                    </td>
                    <td class="py-3 text-sm text-gray-600">${record.notes || '-'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    async showAttendanceViewer() {
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const content = await this.setupAttendanceViewer();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load data
        await this.loadAttendanceData();
    }

    async showStudentAttendance() {
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) {
            console.error('Main content area not found');
            return;
        }

        const content = await this.setupAttendanceViewer();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load attendance data
        await this.loadAttendanceData();
    }

    showCheckInInterface() {
        // Quick check-in interface for students
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        mainContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center">
                    <h1 class="text-3xl font-bold mb-4">Quick Check-In</h1>
                    <p class="text-muted-foreground mb-8">Check in to your current class</p>
                    
                    <div class="max-w-md mx-auto">
                        <div class="card p-8">
                            <div class="mb-6">
                                <i data-lucide="clock" class="h-16 w-16 mx-auto text-blue-500 mb-4"></i>
                                <h3 class="text-xl font-semibold mb-2">Current Time</h3>
                                <p class="text-2xl font-bold" id="current-time">${new Date().toLocaleTimeString()}</p>
                            </div>
                            
                            <button id="check-in-btn" class="w-full gradient-btn text-primary-foreground py-3 rounded-lg text-lg font-semibold">
                                Check In Now
                            </button>
                            
                            <p class="text-sm text-muted-foreground mt-4">
                                Make sure you're in the correct classroom
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Setup check-in functionality
        const checkInBtn = document.getElementById('check-in-btn');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', () => {
                this.performCheckIn();
            });
        }

        // Update time every second
        setInterval(() => {
            const timeEl = document.getElementById('current-time');
            if (timeEl) {
                timeEl.textContent = new Date().toLocaleTimeString();
            }
        }, 1000);
    }

    performCheckIn() {
        // Mock check-in functionality
        const checkInBtn = document.getElementById('check-in-btn');
        if (checkInBtn) {
            checkInBtn.textContent = 'Checking In...';
            checkInBtn.disabled = true;
            
            setTimeout(() => {
                checkInBtn.textContent = '✅ Checked In Successfully!';
                checkInBtn.className = 'w-full bg-green-500 text-white py-3 rounded-lg text-lg font-semibold';
                
                setTimeout(() => {
                    this.showStudentAttendance();
                }, 2000);
            }, 1500);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentAttendanceViewer;
} else {
    window.StudentAttendanceViewer = StudentAttendanceViewer;
}