// API configuration and functions
const API_BASE_URL = 'http://localhost:3000/api';

// API endpoints
const API_ENDPOINTS = {
    DASHBOARD_STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/activity',
    WEEKLY_TRENDS: '/dashboard/trends',
    STUDENTS: '/students',
    CLASSES: '/classes',
    ATTENDANCE: '/attendance',
    ANALYTICS: '/analytics'
};

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add authentication header if available
    if (window.auth && window.auth.getToken()) {
        defaultOptions.headers['Authorization'] = `Bearer ${window.auth.getToken()}`;
    }

    const config = { ...defaultOptions, ...options };
    // Merge headers properly
    if (options.headers) {
        config.headers = { ...defaultOptions.headers, ...options.headers };
    }

    try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
            // Check for authentication errors
            if (response.status === 401 || response.status === 403) {
                if (window.auth) {
                    window.auth.logout();
                }
                throw new Error('Authentication required');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Dashboard API functions
async function fetchDashboardStats() {
    try {
        const data = await apiRequest(API_ENDPOINTS.DASHBOARD_STATS);
        return data;
    } catch (error) {
        // Return mock data if API fails
        console.warn('Using mock data for dashboard stats');
        return {
            totalStudents: '2,847',
            presentToday: '2,456',
            lateArrivals: '47',
            avgDuration: '85 min',
            attendanceRate: '86.3'
        };
    }
}

async function fetchRecentActivity() {
    try {
        const data = await apiRequest(API_ENDPOINTS.RECENT_ACTIVITY);
        return data;
    } catch (error) {
        // Return mock data if API fails
        console.warn('Using mock data for recent activity');
        return [
            {
                initials: 'AP',
                name: 'Arjun Patel',
                class: 'CSE301 - Database Systems',
                time: 'checked in at 08:45 AM',
                status: 'present'
            },
            {
                initials: 'PS',
                name: 'Priya Sharma',
                class: 'CSE205 - Data Structures',
                time: 'checked in at 10:15 AM',
                status: 'present'
            },
            {
                initials: 'RG',
                name: 'Rahul Gupta',
                class: 'ECE201 - Digital Electronics',
                time: 'checked in at 09:25 AM',
                status: 'late'
            },
            {
                initials: 'DK',
                name: 'David Kim',
                class: 'PHY301',
                time: 'checked in at 07:50 AM',
                status: 'early'
            },
            {
                initials: 'LC',
                name: 'Lisa Chen',
                class: 'BIO201',
                time: 'marked absent',
                status: 'absent'
            }
        ];
    }
}

async function fetchWeeklyTrends() {
    try {
        const data = await apiRequest(API_ENDPOINTS.WEEKLY_TRENDS);
        return data;
    } catch (error) {
        // Return mock data if API fails
        console.warn('Using mock data for weekly trends');
        return [
            { day: 'Monday', percentage: 89 },
            { day: 'Tuesday', percentage: 92 },
            { day: 'Wednesday', percentage: 87 },
            { day: 'Thursday', percentage: 94 },
            { day: 'Friday', percentage: 85 }
        ];
    }
}

// Student API functions
async function fetchStudents(page = 1, limit = 10, search = '') {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            search
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.STUDENTS}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
}

async function createStudent(studentData) {
    try {
        const data = await apiRequest(API_ENDPOINTS.STUDENTS, {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
        return data;
    } catch (error) {
        console.error('Error creating student:', error);
        throw error;
    }
}

async function updateStudent(studentId, studentData) {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.STUDENTS}/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData)
        });
        return data;
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
}

async function deleteStudent(studentId) {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.STUDENTS}/${studentId}`, {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        console.error('Error deleting student:', error);
        throw error;
    }
}

// Class API functions
async function fetchClasses(page = 1, limit = 10) {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.CLASSES}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching classes:', error);
        throw error;
    }
}

async function createClass(classData) {
    try {
        const data = await apiRequest(API_ENDPOINTS.CLASSES, {
            method: 'POST',
            body: JSON.stringify(classData)
        });
        return data;
    } catch (error) {
        console.error('Error creating class:', error);
        throw error;
    }
}

async function updateClass(classId, classData) {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.CLASSES}/${classId}`, {
            method: 'PUT',
            body: JSON.stringify(classData)
        });
        return data;
    } catch (error) {
        console.error('Error updating class:', error);
        throw error;
    }
}

async function deleteClass(classId) {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.CLASSES}/${classId}`, {
            method: 'DELETE'
        });
        return data;
    } catch (error) {
        console.error('Error deleting class:', error);
        throw error;
    }
}

// Attendance API functions
async function markAttendance(attendanceData) {
    try {
        const data = await apiRequest(API_ENDPOINTS.ATTENDANCE, {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
        return data;
    } catch (error) {
        console.error('Error marking attendance:', error);
        throw error;
    }
}

async function fetchAttendance(classId, date) {
    try {
        const queryParams = new URLSearchParams({
            classId: classId.toString(),
            date
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.ATTENDANCE}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }
}

async function updateAttendance(attendanceId, attendanceData) {
    try {
        const data = await apiRequest(`${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`, {
            method: 'PUT',
            body: JSON.stringify(attendanceData)
        });
        return data;
    } catch (error) {
        console.error('Error updating attendance:', error);
        throw error;
    }
}

// Analytics API functions
async function fetchAnalytics(startDate, endDate, classId = null) {
    try {
        const queryParams = new URLSearchParams({
            startDate,
            endDate
        });
        
        if (classId) {
            queryParams.append('classId', classId.toString());
        }
        
        const data = await apiRequest(`${API_ENDPOINTS.ANALYTICS}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
}

async function fetchStudentAnalytics(studentId, startDate, endDate) {
    try {
        const queryParams = new URLSearchParams({
            startDate,
            endDate
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.ANALYTICS}/student/${studentId}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching student analytics:', error);
        throw error;
    }
}

async function fetchClassAnalytics(classId, startDate, endDate) {
    try {
        const queryParams = new URLSearchParams({
            startDate,
            endDate
        });
        
        const data = await apiRequest(`${API_ENDPOINTS.ANALYTICS}/class/${classId}?${queryParams}`);
        return data;
    } catch (error) {
        console.error('Error fetching class analytics:', error);
        throw error;
    }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchDashboardStats,
        fetchRecentActivity,
        fetchWeeklyTrends,
        fetchStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        fetchClasses,
        createClass,
        updateClass,
        deleteClass,
        markAttendance,
        fetchAttendance,
        updateAttendance,
        fetchAnalytics,
        fetchStudentAnalytics,
        fetchClassAnalytics
    };
}