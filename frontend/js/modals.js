// Modal functionality for the application
class Modal {
    constructor() {
        this.isOpen = false;
        this.currentModal = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.close();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    open(modalHtml) {
        if (this.isOpen) {
            this.close();
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                ${modalHtml}
            </div>
        `;

        document.body.appendChild(modalOverlay);
        document.body.style.overflow = 'hidden';
        
        this.currentModal = modalOverlay;
        this.isOpen = true;

        // Re-initialize Lucide icons in modal
        lucide.createIcons();

        // Focus management
        const firstFocusable = modalOverlay.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    close() {
        if (!this.isOpen || !this.currentModal) return;

        this.currentModal.remove();
        this.currentModal = null;
        this.isOpen = false;
        document.body.style.overflow = '';
    }
}

// Initialize modal manager
const modalManager = new Modal();
window.modalManager = modalManager;

// Mark Attendance Modal
function showMarkAttendanceModal() {
    const modalHtml = `
        <div class="w-full max-w-md">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold">Mark Attendance</h2>
                <button onclick="modalManager.close()" class="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
            
            <form id="attendance-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-2">Select Class</label>
                    <select class="form-input" id="class-select" required>
                        <option value="">Choose a class...</option>
                        <option value="CS101">CS101 - Computer Science</option>
                        <option value="MATH201">MATH201 - Advanced Mathematics</option>
                        <option value="ENG102">ENG102 - English Literature</option>
                        <option value="PHY301">PHY301 - Physics</option>
                        <option value="BIO201">BIO201 - Biology</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Date</label>
                    <input type="date" class="form-input" id="attendance-date" required value="${new Date().toISOString().split('T')[0]}">
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Time</label>
                    <input type="time" class="form-input" id="attendance-time" required value="${new Date().toTimeString().slice(0,5)}">
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button type="submit" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex-1">
                        Mark Attendance
                    </button>
                    <button type="button" onclick="modalManager.close()" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    modalManager.open(modalHtml);

    // Handle form submission
    document.getElementById('attendance-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            classId: document.getElementById('class-select').value,
            date: document.getElementById('attendance-date').value,
            time: document.getElementById('attendance-time').value
        };

        // Simulate API call
        setTimeout(() => {
            modalManager.close();
            showSuccess(`Attendance marked for ${formData.classId} on ${formData.date}`);
            
            // Refresh dashboard data
            if (typeof dashboardInstance !== 'undefined') {
                dashboardInstance.loadRecentActivity();
                dashboardInstance.loadStats();
            }
        }, 1000);
    });
}

// Schedule Class Modal
function showScheduleClassModal() {
    const modalHtml = `
        <div class="w-full max-w-lg">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold">Schedule Class</h2>
                <button onclick="modalManager.close()" class="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
            
            <form id="schedule-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Class Name</label>
                        <input type="text" class="form-input" id="class-name" placeholder="e.g., CS101" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Subject</label>
                        <input type="text" class="form-input" id="class-subject" placeholder="e.g., Computer Science" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Instructor</label>
                    <input type="text" class="form-input" id="class-instructor" placeholder="Instructor name" required>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Date</label>
                        <input type="date" class="form-input" id="schedule-date" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Time</label>
                        <input type="time" class="form-input" id="schedule-time" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Duration (minutes)</label>
                    <select class="form-input" id="class-duration" required>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60" selected>60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120">120 minutes</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Room/Location</label>
                    <input type="text" class="form-input" id="class-location" placeholder="e.g., Room 101" required>
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button type="submit" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex-1">
                        Schedule Class
                    </button>
                    <button type="button" onclick="modalManager.close()" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    modalManager.open(modalHtml);

    // Set minimum date to today
    document.getElementById('schedule-date').min = new Date().toISOString().split('T')[0];

    // Handle form submission
    document.getElementById('schedule-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('class-name').value,
            subject: document.getElementById('class-subject').value,
            instructor: document.getElementById('class-instructor').value,
            date: document.getElementById('schedule-date').value,
            time: document.getElementById('schedule-time').value,
            duration: document.getElementById('class-duration').value,
            location: document.getElementById('class-location').value
        };

        // Simulate API call
        setTimeout(() => {
            modalManager.close();
            showSuccess(`Class ${formData.name} scheduled for ${formData.date} at ${formData.time}`);
        }, 1000);
    });
}

// Add Student Modal
function showAddStudentModal() {
    const modalHtml = `
        <div class="w-full max-w-lg">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold">Add New Student</h2>
                <button onclick="modalManager.close()" class="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
            
            <form id="student-form" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">First Name</label>
                        <input type="text" class="form-input" id="student-firstname" placeholder="First name" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Last Name</label>
                        <input type="text" class="form-input" id="student-lastname" placeholder="Last name" required>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Student ID</label>
                    <input type="text" class="form-input" id="student-id" placeholder="e.g., STU001" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Email</label>
                    <input type="email" class="form-input" id="student-email" placeholder="student@example.com" required>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Phone</label>
                        <input type="tel" class="form-input" id="student-phone" placeholder="Phone number">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">Date of Birth</label>
                        <input type="date" class="form-input" id="student-dob">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Department/Major</label>
                    <select class="form-input" id="student-department" required>
                        <option value="">Select department...</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="English">English</option>
                        <option value="Physics">Physics</option>
                        <option value="Biology">Biology</option>
                        <option value="Chemistry">Chemistry</option>
                        <option value="History">History</option>
                        <option value="Art">Art</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-2">Year/Grade</label>
                    <select class="form-input" id="student-year" required>
                        <option value="">Select year...</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                    </select>
                </div>
                
                <div class="flex space-x-3 pt-4">
                    <button type="submit" class="gradient-btn text-primary-foreground px-4 py-2 rounded-md flex-1">
                        Add Student
                    </button>
                    <button type="button" onclick="modalManager.close()" class="border border-border bg-card hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    modalManager.open(modalHtml);

    // Handle form submission
    document.getElementById('student-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('student-firstname').value,
            lastName: document.getElementById('student-lastname').value,
            studentId: document.getElementById('student-id').value,
            email: document.getElementById('student-email').value,
            phone: document.getElementById('student-phone').value,
            dateOfBirth: document.getElementById('student-dob').value,
            department: document.getElementById('student-department').value,
            year: document.getElementById('student-year').value
        };

        // Simulate API call
        setTimeout(() => {
            modalManager.close();
            showSuccess(`Student ${formData.firstName} ${formData.lastName} added successfully`);
            
            // Update total students count
            if (typeof dashboardInstance !== 'undefined') {
                dashboardInstance.loadStats();
            }
        }, 1000);
    });
}

// Export modal functions
window.showMarkAttendanceModal = showMarkAttendanceModal;
window.showScheduleClassModal = showScheduleClassModal;
window.showAddStudentModal = showAddStudentModal;