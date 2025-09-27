// Student Management System for Admin and Teachers
class StudentManager {
    constructor() {
        this.currentUser = null;
        this.students = [];
        this.selectedStudent = null;
        this.searchTerm = '';
        this.filterBy = 'all';
        this.init();
    }

    init() {
        if (window.auth && window.auth.getUser()) {
            this.currentUser = window.auth.getUser();
            if (this.currentUser.role === 'admin' || this.currentUser.role === 'teacher') {
                this.setupStudentManager();
            }
        }
    }

    async setupStudentManager() {
        const content = `
            <div class="space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-3xl font-bold">Student Management</h1>
                        <p class="text-muted-foreground">Manage and view student information</p>
                    </div>
                    <div class="flex gap-2">
                        ${this.currentUser.role === 'admin' ? `
                            <button id="import-students" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
                                <i data-lucide="upload" class="h-4 w-4"></i>
                                Import Students
                            </button>
                            <button id="add-student" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2">
                                <i data-lucide="user-plus" class="h-4 w-4"></i>
                                Add Student
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="card">
                    <div class="p-6">
                        <div class="flex flex-col md:flex-row gap-4">
                            <div class="flex-1">
                                <div class="relative">
                                    <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        id="student-search"
                                        placeholder="Search students by name, ID, or email..." 
                                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <select id="class-filter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Classes</option>
                                    <option value="cs201">CS201 - Data Structures</option>
                                    <option value="cs301">CS301 - Database Systems</option>
                                    <option value="cs401">CS401 - Software Engineering</option>
                                </select>
                                <select id="status-filter" class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Students</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Student Statistics -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-blue-100 mr-4">
                                    <i data-lucide="users" class="h-6 w-6 text-blue-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Students</p>
                                    <p class="text-2xl font-bold" id="total-students-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-green-100 mr-4">
                                    <i data-lucide="user-check" class="h-6 w-6 text-green-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Active Students</p>
                                    <p class="text-2xl font-bold text-green-600" id="active-students-count">0</p>
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
                                    <p class="text-sm font-medium text-gray-600">Avg Attendance</p>
                                    <p class="text-2xl font-bold text-yellow-600" id="avg-attendance">0%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="p-6">
                            <div class="flex items-center">
                                <div class="p-3 rounded-full bg-purple-100 mr-4">
                                    <i data-lucide="graduation-cap" class="h-6 w-6 text-purple-600"></i>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">New This Month</p>
                                    <p class="text-2xl font-bold text-purple-600" id="new-students-count">0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Student List -->
                <div class="card">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Students</h3>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                                <span>Showing</span>
                                <span id="showing-count">0</span>
                                <span>of</span>
                                <span id="total-count">0</span>
                                <span>students</span>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="border-b border-gray-200">
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Student ID</th>
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Class</th>
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Attendance</th>
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                        <th class="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="student-table-body">
                                    <!-- Dynamic student rows will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Student Detail Modal -->
            <div id="student-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                <div class="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold">Student Details</h3>
                            <button id="close-student-modal" class="text-gray-400 hover:text-gray-600">
                                <i data-lucide="x" class="h-6 w-6"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6" id="student-modal-content">
                        <!-- Dynamic student details will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    async loadStudents() {
        try {
            // Try to load real data first
            const token = localStorage.getItem('token');
            if (token) {
                const response = await fetch('/api/students-real/real', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    this.students = result.data.students.map(student => ({
                        id: student.id,
                        studentId: student.studentId,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        phone: student.phone,
                        enrollmentDate: student.enrollmentDate,
                        status: student.status ? 'active' : 'inactive',
                        classes: student.classes || [],
                        attendance: student.attendance || 0,
                        semester: student.semester,
                        year: student.year,
                        gpa: student.gpa,
                        address: student.address,
                        emergencyContact: student.emergencyContact
                    }));
                    
                    this.updateStatistics();
                    this.renderStudentTable();
                    this.setupEventHandlers();
                    return;
                }
            }
        } catch (error) {
            console.log('Could not load real data, using mock data:', error);
        }
        
        // Fallback to mock student data with comprehensive information
        const mockStudents = [
            {
                id: 1,
                studentId: "STU001",
                firstName: "Alex",
                lastName: "Johnson", 
                email: "alex.johnson@student.edu",
                phone: "+1 (555) 123-4567",
                enrollmentDate: "2023-09-01",
                status: "active",
                classes: ["CS201", "CS301"],
                attendance: 92,
                semester: "Fall 2024",
                year: "Sophomore",
                gpa: 3.8,
                address: "123 Campus Dr, University City",
                emergencyContact: "Jane Johnson - (555) 987-6543"
            },
            {
                id: 2,
                studentId: "STU002", 
                firstName: "Maya",
                lastName: "Rodriguez",
                email: "maya.rodriguez@student.edu",
                phone: "+1 (555) 234-5678",
                enrollmentDate: "2023-09-01",
                status: "active",
                classes: ["CS201", "CS401"],
                attendance: 88,
                semester: "Fall 2024",
                year: "Junior", 
                gpa: 3.6,
                address: "456 Oak St, University City",
                emergencyContact: "Carlos Rodriguez - (555) 876-5432"
            },
            {
                id: 3,
                studentId: "STU003",
                firstName: "Emma",
                lastName: "Smith",
                email: "emma.smith@student.edu", 
                phone: "+1 (555) 345-6789",
                enrollmentDate: "2024-01-15",
                status: "active",
                classes: ["CS301", "CS401"],
                attendance: 95,
                semester: "Fall 2024",
                year: "Senior",
                gpa: 3.9,
                address: "789 Pine Ave, University City",
                emergencyContact: "Robert Smith - (555) 765-4321"
            },
            {
                id: 4,
                studentId: "STU004",
                firstName: "James",
                lastName: "Wilson",
                email: "james.wilson@student.edu",
                phone: "+1 (555) 456-7890",
                enrollmentDate: "2023-09-01", 
                status: "active",
                classes: ["CS201"],
                attendance: 78,
                semester: "Fall 2024",
                year: "Freshman",
                gpa: 3.2,
                address: "321 Elm St, University City",
                emergencyContact: "Mary Wilson - (555) 654-3210"
            },
            {
                id: 5,
                studentId: "STU005",
                firstName: "Sofia",
                lastName: "Chen",
                email: "sofia.chen@student.edu",
                phone: "+1 (555) 567-8901",
                enrollmentDate: "2023-09-01",
                status: "active", 
                classes: ["CS301", "CS401"],
                attendance: 91,
                semester: "Fall 2024",
                year: "Junior",
                gpa: 3.7,
                address: "654 Maple Dr, University City",
                emergencyContact: "Li Chen - (555) 543-2109"
            },
            {
                id: 6,
                studentId: "STU006",
                firstName: "Marcus",
                lastName: "Davis",
                email: "marcus.davis@student.edu",
                phone: "+1 (555) 678-9012",
                enrollmentDate: "2024-08-15",
                status: "active",
                classes: ["CS201"],
                attendance: 85,
                semester: "Fall 2024", 
                year: "Freshman",
                gpa: 3.4,
                address: "987 Cedar Ln, University City",
                emergencyContact: "Angela Davis - (555) 432-1098"
            }
        ];

        this.students = mockStudents;
        this.updateStatistics();
        this.renderStudentTable();
        this.setupEventHandlers();
    }

    updateStatistics() {
        const totalStudents = this.students.length;
        const activeStudents = this.students.filter(s => s.status === 'active').length;
        const avgAttendance = Math.round(this.students.reduce((sum, s) => sum + s.attendance, 0) / totalStudents);
        const newThisMonth = this.students.filter(s => {
            const enrollDate = new Date(s.enrollmentDate);
            const thisMonth = new Date();
            return enrollDate.getMonth() === thisMonth.getMonth() && 
                   enrollDate.getFullYear() === thisMonth.getFullYear();
        }).length;

        document.getElementById('total-students-count').textContent = totalStudents;
        document.getElementById('active-students-count').textContent = activeStudents;
        document.getElementById('avg-attendance').textContent = `${avgAttendance}%`;
        document.getElementById('new-students-count').textContent = newThisMonth;
    }

    renderStudentTable() {
        const tbody = document.getElementById('student-table-body');
        if (!tbody) return;

        let filteredStudents = this.students;

        // Apply search filter
        if (this.searchTerm) {
            filteredStudents = filteredStudents.filter(student =>
                student.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                student.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                student.studentId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        if (statusFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => student.status === statusFilter);
        }

        let html = '';
        filteredStudents.forEach(student => {
            const attendanceColor = student.attendance >= 90 ? 'text-green-600' : 
                                  student.attendance >= 75 ? 'text-yellow-600' : 'text-red-600';
            const statusColor = student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

            html += `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="py-3 px-4">
                        <div class="flex items-center">
                            <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                ${student.firstName[0]}${student.lastName[0]}
                            </div>
                            <div>
                                <div class="font-medium">${student.firstName} ${student.lastName}</div>
                                <div class="text-sm text-gray-600">${student.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4 font-mono text-sm">${student.studentId}</td>
                    <td class="py-3 px-4">
                        <div class="flex flex-wrap gap-1">
                            ${student.classes.map(cls => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">${cls}</span>`).join('')}
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="font-medium ${attendanceColor}">${student.attendance}%</span>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                            ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex gap-2">
                            <button onclick="window.studentManager.viewStudent(${student.id})" 
                                    class="text-blue-600 hover:text-blue-800 text-sm">
                                View
                            </button>
                            ${this.currentUser.role === 'admin' ? `
                                <button onclick="window.studentManager.editStudent(${student.id})" 
                                        class="text-green-600 hover:text-green-800 text-sm mr-2">
                                    Edit
                                </button>
                                <button onclick="window.studentManager.deleteStudent(${student.id})" 
                                        class="text-red-600 hover:text-red-800 text-sm">
                                    Delete
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        
        // Update counts
        document.getElementById('showing-count').textContent = filteredStudents.length;
        document.getElementById('total-count').textContent = this.students.length;
    }

    setupEventHandlers() {
        // Search functionality
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.renderStudentTable();
            });
        }

        // Filter functionality
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.renderStudentTable();
            });
        }

        const classFilter = document.getElementById('class-filter');
        if (classFilter) {
            classFilter.addEventListener('change', () => {
                this.renderStudentTable();
            });
        }

        // Modal close handler
        const closeModal = document.getElementById('close-student-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeStudentModal();
            });
        }

        // Click outside modal to close
        const modal = document.getElementById('student-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeStudentModal();
                }
            });
        }
    }

    viewStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const modalContent = document.getElementById('student-modal-content');
        const modal = document.getElementById('student-modal');

        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="flex items-center space-x-4">
                    <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold">
                        ${student.firstName[0]}${student.lastName[0]}
                    </div>
                    <div>
                        <h3 class="text-xl font-bold">${student.firstName} ${student.lastName}</h3>
                        <p class="text-gray-600">${student.studentId}</p>
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-900">Personal Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">Email:</span> ${student.email}</div>
                            <div><span class="font-medium">Phone:</span> ${student.phone}</div>
                            <div><span class="font-medium">Address:</span> ${student.address}</div>
                            <div><span class="font-medium">Emergency Contact:</span> ${student.emergencyContact}</div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-900">Academic Information</h4>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-medium">Year:</span> ${student.year}</div>
                            <div><span class="font-medium">Semester:</span> ${student.semester}</div>
                            <div><span class="font-medium">GPA:</span> ${student.gpa}</div>
                            <div><span class="font-medium">Enrolled:</span> ${new Date(student.enrollmentDate).toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-900">Current Classes</h4>
                    <div class="flex flex-wrap gap-2">
                        ${student.classes.map(cls => `<span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">${cls}</span>`).join('')}
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="font-semibold text-gray-900">Attendance Overview</h4>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium">Overall Attendance</span>
                            <span class="text-lg font-bold ${student.attendance >= 90 ? 'text-green-600' : student.attendance >= 75 ? 'text-yellow-600' : 'text-red-600'}">${student.attendance}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="h-2 rounded-full ${student.attendance >= 90 ? 'bg-green-500' : student.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}" 
                                 style="width: ${student.attendance}%"></div>
                        </div>
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

    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        // Create edit modal
        const editModal = document.createElement('div');
        editModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        editModal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">Edit Student</h3>
                        <button id="close-edit-modal" class="text-gray-400 hover:text-gray-600">
                            <i data-lucide="x" class="h-6 w-6"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <form id="edit-student-form" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input type="text" name="firstName" value="${student.firstName}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input type="text" name="lastName" value="${student.lastName}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value="${student.email}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input type="text" name="studentId" value="${student.studentId}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" name="phone" value="${student.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <select name="year" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="Freshman" ${student.year === 'Freshman' ? 'selected' : ''}>Freshman</option>
                                    <option value="Sophomore" ${student.year === 'Sophomore' ? 'selected' : ''}>Sophomore</option>
                                    <option value="Junior" ${student.year === 'Junior' ? 'selected' : ''}>Junior</option>
                                    <option value="Senior" ${student.year === 'Senior' ? 'selected' : ''}>Senior</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                                <input type="number" name="gpa" value="${student.gpa || ''}" step="0.1" min="0" max="4.0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <input type="text" name="semester" value="${student.semester || 'Fall 2024'}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea name="address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${student.address || ''}</textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
                            <input type="text" name="emergencyContact" value="${student.emergencyContact || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" name="isActive" ${student.status === 'active' ? 'checked' : ''} class="mr-2">
                            <label class="text-sm font-medium text-gray-700">Active Student</label>
                        </div>
                        
                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="cancel-edit" class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Update Student</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(editModal);

        // Handle form submission
        document.getElementById('edit-student-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const studentData = Object.fromEntries(formData.entries());
            studentData.isActive = formData.has('isActive');

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/students-real/real/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(studentData)
                });

                if (response.ok) {
                    this.showSuccessMessage('Student updated successfully!');
                    document.body.removeChild(editModal);
                    await this.loadStudents(); // Reload data
                } else {
                    const error = await response.json();
                    this.showErrorMessage(error.error || 'Failed to update student');
                }
            } catch (error) {
                console.error('Error updating student:', error);
                this.showErrorMessage('Failed to update student');
            }
        });

        // Handle modal close
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            document.body.removeChild(editModal);
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(editModal);
        });

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                document.body.removeChild(editModal);
            }
        });

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    async deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        if (!confirm(`Are you sure you want to delete student ${student.firstName} ${student.lastName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/students-real/real/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.showSuccessMessage('Student deleted successfully!');
                await this.loadStudents(); // Reload data
            } else {
                const error = await response.json();
                this.showErrorMessage(error.error || 'Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            this.showErrorMessage('Failed to delete student');
        }
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

    closeStudentModal() {
        const modal = document.getElementById('student-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async showStudentManager() {
        const mainContent = document.querySelector('main .p-6.space-y-6');
        if (!mainContent) return;

        const content = await this.setupStudentManager();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Load students data
        await this.loadStudents();
    }

    async loadStudentsPage() {
        // Find main content area more generically
        const mainContent = document.querySelector('main .p-6') || document.querySelector('main .p-6.space-y-6');
        if (!mainContent) {
            console.error('Main content area not found');
            return;
        }

        const content = await this.setupStudentManager();
        mainContent.innerHTML = content;

        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Setup event handlers and load data
        this.setupEventHandlers();
        await this.loadStudents();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudentManager;
} else {
    window.StudentManager = StudentManager;
}