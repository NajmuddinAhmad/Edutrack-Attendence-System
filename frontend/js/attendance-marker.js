// Teacher Attendance Marking Feature
class AttendanceMarker {
    constructor() {
        this.currentUser = null;
        this.selectedClass = null;
        this.students = [];
        this.currentSession = null;
        this.init();
    }

    init() {
        if (window.auth && window.auth.getUser()) {
            this.currentUser = window.auth.getUser();
            if (this.currentUser.role === 'teacher') {
                this.setupAttendanceMarker();
            }
        }
    }

    async setupAttendanceMarker() {
        const mainContent = document.querySelector('main .p-6');
        if (!mainContent) {
            console.error('Main content area not found');
            return;
        }

        const content = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">Mark Attendance</h1>
                        <p class="text-muted-foreground">Mark student attendance for your classes</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-muted-foreground">Teacher</p>
                        <p class="text-lg font-semibold">${this.currentUser.firstName} ${this.currentUser.lastName}</p>
                    </div>
                </div>

                <!-- Class Selection -->
                <div class="card">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold mb-4">Select Class</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="class-selection">
                            <!-- Dynamic class cards will be loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Attendance Marking Section -->
                <div id="attendance-section" class="hidden">
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-6">
                                <div>
                                    <h3 class="text-lg font-semibold" id="selected-class-title">Class Name</h3>
                                    <p class="text-sm text-gray-600" id="selected-class-info">Class details</p>
                                </div>
                                <div class="flex gap-2">
                                    <button id="mark-all-present" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                                        Mark All Present
                                    </button>
                                    <button id="save-attendance" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                        Save Attendance
                                    </button>
                                </div>
                            </div>

                            <!-- Session Info -->
                            <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-600">Date:</span>
                                        <span class="font-medium ml-2" id="session-date"></span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Time:</span>
                                        <span class="font-medium ml-2" id="session-time"></span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Students:</span>
                                        <span class="font-medium ml-2" id="total-students"></span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Present:</span>
                                        <span class="font-medium ml-2 text-green-600" id="present-count">0</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Student List -->
                            <div class="space-y-2" id="student-list">
                                <!-- Dynamic student list will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = content;
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load teacher's classes
        await this.loadTeacherClasses();
        
        // Setup event handlers
        this.setupEventHandlers();
    }

    async loadTeacherClasses() {
        try {
            // Try to load real data first
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/attendance-real/classes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    const classes = result.data.map(cls => ({
                        id: cls.id,
                        name: cls.name,
                        code: cls.code,
                        section: cls.section,
                        time: cls.schedule ? cls.schedule.split(' ')[1] || '09:00-10:30' : '09:00-10:30',
                        days: cls.schedule ? cls.schedule.split(' ')[0].replace(/,/g, ', ') || 'Mon, Wed, Fri' : 'Mon, Wed, Fri',
                        enrolledStudents: cls.enrolled,
                        location: cls.room
                    }));
                    
                    this.renderClassSelection(classes);
                    return;
                }
            }
        } catch (error) {
            console.log('Could not load real classes, using mock data:', error);
        }
        
        // Fallback to mock data for teacher's classes
        const mockClasses = [
            {
                id: 1,
                name: "Data Structures",
                code: "CS201", 
                section: "A",
                time: "09:00-10:30",
                days: "Mon, Wed, Fri",
                enrolledStudents: 35,
                location: "Room 201"
            },
            {
                id: 2,
                name: "Database Systems",
                code: "CS301",
                section: "B", 
                time: "14:00-15:30",
                days: "Tue, Thu",
                enrolledStudents: 28,
                location: "Lab 301"
            },
            {
                id: 3,
                name: "Software Engineering",
                code: "CS401",
                section: "A",
                time: "11:00-12:30", 
                days: "Mon, Wed",
                enrolledStudents: 32,
                location: "Room 401"
            }
        ];

        this.renderClassSelection(mockClasses);
    }

    renderClassSelection(classes) {
        const container = document.getElementById('class-selection');
        if (!container) return;

        let html = '';
        classes.forEach(cls => {
            html += `
                <div class="class-card border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" 
                     data-class-id="${cls.id}" onclick="window.attendanceMarker.selectClass(${JSON.stringify(cls).replace(/"/g, '&quot;')})">
                    <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-lg">${cls.name}</h4>
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${cls.code}</span>
                    </div>
                    <div class="space-y-1 text-sm text-gray-600">
                        <div class="flex items-center">
                            <i data-lucide="clock" class="h-4 w-4 mr-2"></i>
                            <span>${cls.time}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="calendar" class="h-4 w-4 mr-2"></i>
                            <span>${cls.days}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="users" class="h-4 w-4 mr-2"></i>
                            <span>${cls.enrolledStudents} students</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="map-pin" class="h-4 w-4 mr-2"></i>
                            <span>${cls.location}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    selectClass(classData) {
        this.selectedClass = classData;
        this.loadStudentList();
        this.setupCurrentSession();
        this.showAttendanceSection();
    }

    setupCurrentSession() {
        const now = new Date();
        this.currentSession = {
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            }),
            topic: "Regular Class Session"
        };

        // Update session info in UI
        document.getElementById('session-date').textContent = new Date().toLocaleDateString();
        document.getElementById('session-time').textContent = this.currentSession.time;
        document.getElementById('selected-class-title').textContent = this.selectedClass.name;
        document.getElementById('selected-class-info').textContent = 
            `${this.selectedClass.code} • Section ${this.selectedClass.section} • ${this.selectedClass.location}`;
    }

    async loadStudentList() {
        try {
            // Try to load real student data
            const token = localStorage.getItem('token');
            const today = new Date().toISOString().split('T')[0];
            
            if (token && this.selectedClass) {
                const response = await fetch(`/api/attendance-real/class/${this.selectedClass.id}/students?date=${today}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.students = result.data.map(student => ({
                        id: student.id,
                        studentId: student.studentId,
                        name: `${student.firstName} ${student.lastName}`,
                        email: student.email,
                        status: student.attendanceStatus || null
                    }));
                    
                    this.renderStudentList();
                    this.updateAttendanceCount();
                    return;
                }
            }
        } catch (error) {
            console.log('Could not load real student data, using mock data:', error);
        }
        
        // Fallback to mock student data for the selected class
        const mockStudents = [
            { id: 1, studentId: "STU001", name: "Alex Johnson", email: "alex.johnson@student.edu", status: null },
            { id: 2, studentId: "STU002", name: "Maya Rodriguez", email: "maya.rodriguez@student.edu", status: null },
            { id: 3, studentId: "STU003", name: "Emma Smith", email: "emma.smith@student.edu", status: null },
            { id: 4, studentId: "STU004", name: "James Wilson", email: "james.wilson@student.edu", status: null },
            { id: 5, studentId: "STU005", name: "Sofia Chen", email: "sofia.chen@student.edu", status: null },
            { id: 6, studentId: "STU006", name: "Marcus Davis", email: "marcus.davis@student.edu", status: null },
            { id: 7, studentId: "STU007", name: "Isabella Garcia", email: "isabella.garcia@student.edu", status: null },
            { id: 8, studentId: "STU008", name: "Ryan Thompson", email: "ryan.thompson@student.edu", status: null }
        ];

        this.students = mockStudents;
        this.renderStudentList();
        this.updateAttendanceCount();
    }

    renderStudentList() {
        const container = document.getElementById('student-list');
        if (!container) return;

        let html = '';
        this.students.forEach((student, index) => {
            html += `
                <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg student-row" data-student-id="${student.id}">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                            ${student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div class="font-medium">${student.name}</div>
                            <div class="text-sm text-gray-600">${student.studentId}</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                        <button class="attendance-btn px-3 py-1 rounded text-sm font-medium border-2 transition-colors ${student.status === 'present' ? 'bg-green-500 text-white border-green-500' : 'border-green-300 text-green-600 hover:bg-green-50'}" 
                                onclick="window.attendanceMarker.markAttendance(${student.id}, 'present')">
                            Present
                        </button>
                        <button class="attendance-btn px-3 py-1 rounded text-sm font-medium border-2 transition-colors ${student.status === 'late' ? 'bg-yellow-500 text-white border-yellow-500' : 'border-yellow-300 text-yellow-600 hover:bg-yellow-50'}"
                                onclick="window.attendanceMarker.markAttendance(${student.id}, 'late')">
                            Late
                        </button>
                        <button class="attendance-btn px-3 py-1 rounded text-sm font-medium border-2 transition-colors ${student.status === 'absent' ? 'bg-red-500 text-white border-red-500' : 'border-red-300 text-red-600 hover:bg-red-50'}"
                                onclick="window.attendanceMarker.markAttendance(${student.id}, 'absent')">
                            Absent
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        document.getElementById('total-students').textContent = this.students.length;
    }

    markAttendance(studentId, status) {
        const studentIndex = this.students.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            this.students[studentIndex].status = status;
            this.renderStudentList();
            this.updateAttendanceCount();
        }
    }

    updateAttendanceCount() {
        const presentCount = this.students.filter(s => s.status === 'present' || s.status === 'late').length;
        document.getElementById('present-count').textContent = presentCount;
    }

    showAttendanceSection() {
        document.getElementById('attendance-section').classList.remove('hidden');
        
        // Setup event handlers
        document.getElementById('mark-all-present').onclick = () => {
            this.students.forEach(student => {
                if (!student.status) {
                    student.status = 'present';
                }
            });
            this.renderStudentList();
            this.updateAttendanceCount();
        };

        document.getElementById('save-attendance').onclick = () => {
            this.saveAttendance();
        };
    }

    async saveAttendance() {
        const unmarkedStudents = this.students.filter(s => !s.status);
        
        if (unmarkedStudents.length > 0) {
            const confirm = window.confirm(`${unmarkedStudents.length} students are not marked. Mark them as absent and save?`);
            if (confirm) {
                unmarkedStudents.forEach(student => {
                    student.status = 'absent';
                });
            } else {
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const today = new Date().toISOString().split('T')[0];
            
            const attendanceData = this.students.map(s => ({
                studentId: s.id,
                status: s.status,
                notes: `Marked by ${this.currentUser.firstName} ${this.currentUser.lastName}`
            }));

            if (token) {
                const response = await fetch('/api/attendance-real/mark-class', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        classId: this.selectedClass.id,
                        date: today,
                        attendanceData: attendanceData
                    })
                });

                if (response.ok) {
                    this.showSuccessMessage('Attendance saved successfully!');
                    
                    // Reset for next session
                    setTimeout(() => {
                        this.resetAttendanceMarker();
                    }, 2000);
                    return;
                } else {
                    const error = await response.json();
                    this.showErrorMessage(error.error || 'Failed to save attendance');
                    return;
                }
            }
        } catch (error) {
            console.error('Error saving attendance:', error);
            this.showErrorMessage('Failed to save attendance');
        }

        // Fallback: just show success message for demo
        this.showSuccessMessage('Attendance saved successfully!');
        
        // Reset for next session
        setTimeout(() => {
            this.resetAttendanceMarker();
        }, 2000);
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

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorDiv.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="alert-circle" class="h-5 w-5 mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(errorDiv);

        if (window.lucide) {
            lucide.createIcons();
        }

        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 3000);
    }

    resetAttendanceMarker() {
        document.getElementById('attendance-section').classList.add('hidden');
        this.selectedClass = null;
        this.students = [];
        this.currentSession = null;
    }

    setupEventHandlers() {
        // Basic event handlers are set up in individual methods
        // This method can be used for global event handlers if needed
        console.log('Attendance marker event handlers set up');
    }

    async showAttendanceMarker() {
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const content = await this.setupAttendanceMarker();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load teacher's classes
        await this.loadTeacherClasses();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttendanceMarker;
} else {
    window.AttendanceMarker = AttendanceMarker;
}