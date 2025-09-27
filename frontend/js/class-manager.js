// Class Management System for Admin and Teachers
class ClassManager {
    constructor() {
        this.currentUser = null;
        this.classes = [];
        this.selectedClass = null;
        this.init();
    }

    init() {
        if (window.auth && window.auth.getUser()) {
            this.currentUser = window.auth.getUser();
            if (this.currentUser.role === 'admin' || this.currentUser.role === 'teacher') {
                this.setupClassManager();
            }
        }
    }

    async setupClassManager() {
        const content = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">Class Management</h1>
                        <p class="text-muted-foreground">Manage classes, schedules, and enrollments</p>
                    </div>
                    <div class="flex gap-2">
                        ${this.currentUser.role === 'admin' ? `
                            <button id="create-class" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
                                <i data-lucide="plus" class="h-4 w-4"></i>
                                Create Class
                            </button>
                        ` : ''}
                        <button id="export-schedule" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
                            <i data-lucide="download" class="h-4 w-4"></i>
                            Export Schedule
                        </button>
                    </div>
                </div>

                <!-- Class Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100 mr-4">
                                    <i data-lucide="book-open" class="h-6 w-6 text-blue-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Classes</p>
                                    <p class="text-2xl font-bold" id="total-classes-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100 mr-4">
                                    <i data-lucide="users" class="h-6 w-6 text-green-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Students</p>
                                    <p class="text-2xl font-bold text-green-600" id="total-enrolled-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100 mr-4">
                                    <i data-lucide="calendar" class="h-6 w-6 text-purple-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Active This Week</p>
                                    <p class="text-2xl font-bold text-purple-600" id="active-classes-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-yellow-100 mr-4">
                                    <i data-lucide="clock" class="h-6 w-6 text-yellow-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Avg Class Size</p>
                                    <p class="text-2xl font-bold text-yellow-600" id="avg-class-size">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Schedule View -->
                <div class="card">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold">Weekly Schedule</h3>
                            <div class="flex gap-2">
                                <button id="prev-week" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                                    <i data-lucide="chevron-left" class="h-4 w-4"></i>
                                </button>
                                <span id="current-week" class="px-4 py-1 text-sm font-medium"></span>
                                <button id="next-week" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                                    <i data-lucide="chevron-right" class="h-4 w-4"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <div class="grid grid-cols-6 gap-1 min-w-[800px]">
                                <!-- Time column -->
                                <div class="p-2">
                                    <div class="text-xs font-medium text-gray-600 h-8"></div>
                                    <div class="space-y-1">
                                        <div class="h-12 flex items-center text-xs text-gray-600">8:00 AM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">9:00 AM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">10:00 AM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">11:00 AM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">12:00 PM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">1:00 PM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">2:00 PM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">3:00 PM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">4:00 PM</div>
                                        <div class="h-12 flex items-center text-xs text-gray-600">5:00 PM</div>
                                    </div>
                                </div>
                                
                                <!-- Day columns -->
                                <div class="p-2" id="monday-schedule">
                                    <div class="text-xs font-medium text-center p-2 bg-gray-100 rounded mb-1">Monday</div>
                                    <div class="space-y-1 h-[480px]" data-day="monday"></div>
                                </div>
                                <div class="p-2" id="tuesday-schedule">
                                    <div class="text-xs font-medium text-center p-2 bg-gray-100 rounded mb-1">Tuesday</div>
                                    <div class="space-y-1 h-[480px]" data-day="tuesday"></div>
                                </div>
                                <div class="p-2" id="wednesday-schedule">
                                    <div class="text-xs font-medium text-center p-2 bg-gray-100 rounded mb-1">Wednesday</div>
                                    <div class="space-y-1 h-[480px]" data-day="wednesday"></div>
                                </div>
                                <div class="p-2" id="thursday-schedule">
                                    <div class="text-xs font-medium text-center p-2 bg-gray-100 rounded mb-1">Thursday</div>
                                    <div class="space-y-1 h-[480px]" data-day="thursday"></div>
                                </div>
                                <div class="p-2" id="friday-schedule">
                                    <div class="text-xs font-medium text-center p-2 bg-gray-100 rounded mb-1">Friday</div>
                                    <div class="space-y-1 h-[480px]" data-day="friday"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Class List -->
                <div class="card">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">All Classes</h3>
                            <div class="flex gap-2">
                                <select id="semester-filter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="all">All Semesters</option>
                                    <option value="fall2024" selected>Fall 2024</option>
                                    <option value="spring2024">Spring 2024</option>
                                </select>
                                <select id="department-filter" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="all">All Departments</option>
                                    <option value="cs">Computer Science</option>
                                    <option value="math">Mathematics</option>
                                    <option value="eng">Engineering</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid gap-4" id="class-list">
                            <!-- Dynamic class cards will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Class Detail Modal -->
            <div id="class-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Class Details</h3>
                            <button id="close-class-modal" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="h-6 w-6"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6" id="class-modal-content">
                        <!-- Dynamic class details will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    async loadClasses() {
        // Mock class data with comprehensive information
        const mockClasses = [
            {
                id: 1,
                name: "Data Structures",
                code: "CS201",
                section: "A",
                instructor: "Dr. Sarah Smith",
                semester: "Fall 2024",
                credits: 3,
                enrolled: 35,
                capacity: 40,
                schedule: {
                    days: ["monday", "wednesday", "friday"],
                    time: "09:00-10:30",
                    room: "Room 201"
                },
                description: "Introduction to fundamental data structures and algorithms",
                status: "active"
            },
            {
                id: 2,
                name: "Database Systems", 
                code: "CS301",
                section: "B",
                instructor: "Dr. Sarah Smith", 
                semester: "Fall 2024",
                credits: 4,
                enrolled: 28,
                capacity: 30,
                schedule: {
                    days: ["tuesday", "thursday"],
                    time: "14:00-15:30",
                    room: "Lab 301"
                },
                description: "Design and implementation of database systems",
                status: "active"
            },
            {
                id: 3,
                name: "Software Engineering",
                code: "CS401", 
                section: "A",
                instructor: "Dr. Sarah Smith",
                semester: "Fall 2024",
                credits: 3,
                enrolled: 32,
                capacity: 35,
                schedule: {
                    days: ["monday", "wednesday"],
                    time: "11:00-12:30",
                    room: "Room 401"
                },
                description: "Software development methodologies and project management",
                status: "active"
            },
            {
                id: 4,
                name: "Computer Networks",
                code: "CS302",
                section: "A", 
                instructor: "Prof. Michael Johnson",
                semester: "Fall 2024",
                credits: 3,
                enrolled: 25,
                capacity: 30,
                schedule: {
                    days: ["tuesday", "thursday"],
                    time: "10:00-11:30", 
                    room: "Room 302"
                },
                description: "Fundamentals of computer networking and protocols",
                status: "active"
            },
            {
                id: 5,
                name: "Web Development",
                code: "CS203",
                section: "B",
                instructor: "Prof. Emily Davis",
                semester: "Fall 2024", 
                credits: 3,
                enrolled: 42,
                capacity: 45,
                schedule: {
                    days: ["monday", "wednesday", "friday"],
                    time: "13:00-14:30",
                    room: "Lab 203"
                },
                description: "Modern web development technologies and frameworks",
                status: "active"
            }
        ];

        this.classes = mockClasses;
        this.updateStatistics();
        this.renderSchedule();
        this.renderClassList();
        this.setupEventHandlers();
    }

    updateStatistics() {
        const totalClasses = this.classes.length;
        const totalEnrolled = this.classes.reduce((sum, cls) => sum + cls.enrolled, 0);
        const activeThisWeek = this.classes.filter(cls => cls.status === 'active').length;
        const avgClassSize = Math.round(totalEnrolled / totalClasses);

        document.getElementById('total-classes-count').textContent = totalClasses;
        document.getElementById('total-enrolled-count').textContent = totalEnrolled;
        document.getElementById('active-classes-count').textContent = activeThisWeek;
        document.getElementById('avg-class-size').textContent = avgClassSize;
    }

    renderSchedule() {
        // Clear existing schedule
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
            const dayElement = document.querySelector(`[data-day="${day}"]`);
            if (dayElement) {
                dayElement.innerHTML = '';
            }
        });

        // Add classes to schedule
        this.classes.forEach(cls => {
            cls.schedule.days.forEach(day => {
                const dayElement = document.querySelector(`[data-day="${day}"]`);
                if (dayElement) {
                    const [startTime] = cls.schedule.time.split('-');
                    const startHour = parseInt(startTime.split(':')[0]);
                    const position = (startHour - 8) * 48; // 48px per hour slot
                    
                    const classBlock = document.createElement('div');
                    classBlock.className = 'absolute w-full bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-xs cursor-pointer hover:bg-blue-200';
                    classBlock.style.top = `${position}px`;
                    classBlock.style.height = '90px'; // 1.5 hour slot
                    classBlock.innerHTML = `
                        <div class="font-medium text-blue-800">${cls.code}</div>
                        <div class="text-blue-600">${cls.name}</div>
                        <div class="text-blue-500">${cls.schedule.room}</div>
                    `;
                    classBlock.onclick = () => this.viewClass(cls.id);
                    
                    dayElement.style.position = 'relative';
                    dayElement.appendChild(classBlock);
                }
            });
        });

        // Update current week display
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 5));
        
        document.getElementById('current-week').textContent = 
            `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
    }

    renderClassList() {
        const container = document.getElementById('class-list');
        if (!container) return;

        let html = '';
        this.classes.forEach(cls => {
            const enrollmentPercentage = Math.round((cls.enrolled / cls.capacity) * 100);
            const enrollmentColor = enrollmentPercentage >= 90 ? 'text-red-600' : 
                                  enrollmentPercentage >= 75 ? 'text-yellow-600' : 'text-green-600';

            html += `
                <div class="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
                     onclick="window.classManager.viewClass(${cls.id})">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <h4 class="text-lg font-semibold">${cls.name}</h4>
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${cls.code}</span>
                                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Section ${cls.section}</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${cls.description}</p>
                            <div class="flex items-center text-sm text-gray-600">
                                <i data-lucide="user" class="h-4 w-4 mr-1"></i>
                                <span>${cls.instructor}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-sm font-medium ${enrollmentColor}">
                                ${cls.enrolled}/${cls.capacity} students
                            </div>
                            <div class="text-xs text-gray-500">${enrollmentPercentage}% full</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div class="flex items-center">
                            <i data-lucide="calendar" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="clock" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.schedule.time}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="map-pin" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.schedule.room}</span>
                        </div>
                        <div class="flex items-center">
                            <i data-lucide="book" class="h-4 w-4 mr-2 text-gray-400"></i>
                            <span>${cls.credits} Credits</span>
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

    setupEventHandlers() {
        // Modal close handler
        const closeModal = document.getElementById('close-class-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeClassModal();
            });
        }

        // Click outside modal to close
        const modal = document.getElementById('class-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeClassModal();
                }
            });
        }

        // Filter handlers
        const semesterFilter = document.getElementById('semester-filter');
        if (semesterFilter) {
            semesterFilter.addEventListener('change', () => {
                this.renderClassList();
            });
        }

        // Export schedule handler
        const exportBtn = document.getElementById('export-schedule');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSchedule();
            });
        }
    }

    viewClass(classId) {
        const cls = this.classes.find(c => c.id === classId);
        if (!cls) return;

        const modalContent = document.getElementById('class-modal-content');
        const modal = document.getElementById('class-modal');

        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <h3 class="text-2xl font-bold">${cls.name}</h3>
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">${cls.code}</span>
                            <span class="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded">Section ${cls.section}</span>
                        </div>
                        <p class="text-gray-600 mb-4">${cls.description}</p>
                        <div class="flex items-center text-gray-600">
                            <i data-lucide="user" class="h-4 w-4 mr-2"></i>
                            <span>${cls.instructor}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-600">Enrollment</div>
                        <div class="text-2xl font-bold ${cls.enrolled / cls.capacity >= 0.9 ? 'text-red-600' : cls.enrolled / cls.capacity >= 0.75 ? 'text-yellow-600' : 'text-green-600'}">
                            ${cls.enrolled}/${cls.capacity}
                        </div>
                        <div class="text-sm text-gray-500">${Math.round((cls.enrolled / cls.capacity) * 100)}% full</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-900">Class Information</h4>
                        <div class="space-y-3 text-sm">
                            <div class="flex items-center">
                                <i data-lucide="calendar" class="h-4 w-4 mr-3 text-gray-400"></i>
                                <span class="font-medium mr-2">Days:</span>
                                <span>${cls.schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="clock" class="h-4 w-4 mr-3 text-gray-400"></i>
                                <span class="font-medium mr-2">Time:</span>
                                <span>${cls.schedule.time}</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="map-pin" class="h-4 w-4 mr-3 text-gray-400"></i>
                                <span class="font-medium mr-2">Location:</span>
                                <span>${cls.schedule.room}</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="book" class="h-4 w-4 mr-3 text-gray-400"></i>
                                <span class="font-medium mr-2">Credits:</span>
                                <span>${cls.credits}</span>
                            </div>
                            <div class="flex items-center">
                                <i data-lucide="calendar-days" class="h-4 w-4 mr-3 text-gray-400"></i>
                                <span class="font-medium mr-2">Semester:</span>
                                <span>${cls.semester}</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-900">Quick Stats</h4>
                        <div class="space-y-3">
                            <div class="bg-gray-50 p-3 rounded">
                                <div class="text-xs text-gray-600 mb-1">Enrollment Progress</div>
                                <div class="w-full bg-gray-200 rounded-full h-2 mb-1">
                                    <div class="h-2 rounded-full bg-blue-500" style="width: ${(cls.enrolled / cls.capacity) * 100}%"></div>
                                </div>
                                <div class="text-xs text-gray-600">${cls.enrolled} of ${cls.capacity} students enrolled</div>
                            </div>
                            <div class="bg-green-50 p-3 rounded">
                                <div class="text-xs text-green-600 mb-1">Available Spots</div>
                                <div class="text-lg font-bold text-green-700">${cls.capacity - cls.enrolled}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-900">Class Actions</h4>
                    <div class="flex flex-wrap gap-2">
                        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-2">
                            <i data-lucide="users" class="h-4 w-4"></i>
                            View Students
                        </button>
                        <button class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm flex items-center gap-2">
                            <i data-lucide="check-square" class="h-4 w-4"></i>
                            Take Attendance
                        </button>
                        <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm flex items-center gap-2">
                            <i data-lucide="bar-chart" class="h-4 w-4"></i>
                            View Analytics
                        </button>
                        ${this.currentUser.role === 'admin' ? `
                            <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-2">
                                <i data-lucide="edit" class="h-4 w-4"></i>
                                Edit Class
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    closeClassModal() {
        const modal = document.getElementById('class-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    exportSchedule() {
        // Mock export functionality
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Class Code,Class Name,Instructor,Days,Time,Room,Enrolled,Capacity\n"
            + this.classes.map(cls => 
                `${cls.code},"${cls.name}","${cls.instructor}","${cls.schedule.days.join(', ')}","${cls.schedule.time}","${cls.schedule.room}",${cls.enrolled},${cls.capacity}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "class_schedule.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successDiv.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="download" class="h-5 w-5 mr-2"></i>
                <span>Schedule exported successfully!</span>
            </div>
        `;
        document.body.appendChild(successDiv);

        if (window.lucide) {
            lucide.createIcons();
        }

        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }

    async showClassManager() {
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const content = await this.setupClassManager();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load classes data
        await this.loadClasses();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClassManager;
} else {
    window.ClassManager = ClassManager;
}