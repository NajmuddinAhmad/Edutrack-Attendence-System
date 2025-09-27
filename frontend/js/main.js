// Main application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Set current date
    updateCurrentDate();

    // Initialize sidebar functionality
    initializeSidebar();

    // Initialize navigation
    initializeNavigation();

    // Initialize quick actions
    initializeQuickActions();

    // Load dashboard data
    loadDashboardData();
});

// Update current date display
function updateCurrentDate() {
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        currentDateElement.textContent = new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Initialize sidebar toggle functionality
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarBrand = document.getElementById('sidebar-brand');
    const userInfo = document.getElementById('user-info');
    const navTexts = document.querySelectorAll('.nav-text');
    const navIcons = document.querySelectorAll('.nav-icon');

    let isCollapsed = false;

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            isCollapsed = !isCollapsed;
            
            if (isCollapsed) {
                sidebar.classList.remove('sidebar-expanded');
                sidebar.classList.add('sidebar-collapsed');
                sidebarBrand.style.display = 'none';
                userInfo.style.display = 'none';
                navTexts.forEach(text => text.style.display = 'none');
                navIcons.forEach(icon => icon.classList.remove('mr-3'));
            } else {
                sidebar.classList.remove('sidebar-collapsed');
                sidebar.classList.add('sidebar-expanded');
                sidebarBrand.style.display = 'flex';
                userInfo.style.display = 'block';
                navTexts.forEach(text => text.style.display = 'inline');
                navIcons.forEach(icon => icon.classList.add('mr-3'));
            }
        });
    }
}

// Initialize navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => {
                nav.classList.remove('nav-active');
                nav.classList.add('nav-inactive');
            });
            
            // Add active class to clicked item
            item.classList.remove('nav-inactive');
            item.classList.add('nav-active');
            
            // Handle page switching
            const page = item.getAttribute('data-page');
            switchPage(page);
        });
    });
}

// Initialize quick action buttons
function initializeQuickActions() {
    const actionButtons = document.querySelectorAll('[data-action]');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
}

// Handle page switching - now delegated to role-based dashboard
function switchPage(page) {
    console.log('Page switching delegated to role-based dashboard:', page);
    // Role-based dashboard handles all navigation now
}

// Handle quick actions
function handleQuickAction(action) {
    switch(action) {
        case 'mark-attendance':
            showMarkAttendanceModal();
            break;
        case 'schedule-class':
            showScheduleClassModal();
            break;
        case 'add-student':
            showAddStudentModal();
            break;
        case 'view-analytics':
            switchPage('analytics');
            break;
        default:
            console.warn('Unknown action:', action);
    }
}

// Load dashboard data
function loadDashboardData() {
    // Load stats
    loadDashboardStats();
    
    // Load recent activity
    loadRecentActivity();
    
    // Load weekly trends
    loadWeeklyTrends();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const stats = await fetchDashboardStats();
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

// Update stats display
function updateStatsDisplay(stats) {
    const elements = {
        'total-students': stats.totalStudents,
        'present-today': stats.presentToday,
        'late-arrivals': stats.lateArrivals,
        'avg-duration': stats.avgDuration
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });

    // Update attendance rate
    const attendanceRateElement = document.getElementById('attendance-rate');
    if (attendanceRateElement && stats.attendanceRate) {
        attendanceRateElement.textContent = `${stats.attendanceRate}% attendance rate`;
    }
}

// Load recent activity
async function loadRecentActivity() {
    try {
        const activities = await fetchRecentActivity();
        displayRecentActivity(activities);
    } catch (error) {
        console.error('Error loading recent activity:', error);
        showError('Failed to load recent activity');
    }
}

// Display recent activity
function displayRecentActivity(activities) {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    container.innerHTML = activities.map(activity => createActivityItem(activity)).join('');
}

// Create activity item HTML
function createActivityItem(activity) {
    const statusClass = getStatusClass(activity.status);
    const statusIcon = getStatusIcon(activity.status);
    
    return `
        <div class="flex items-center space-x-4">
            <div class="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span class="text-sm font-medium">${activity.initials}</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">${activity.name} - ${activity.class}</p>
                <p class="text-xs text-muted-foreground">${activity.time}</p>
            </div>
            <span class="inline-flex items-center rounded-full ${statusClass} px-2 py-1 text-xs font-medium gap-1">
                <i data-lucide="${statusIcon}" class="h-3 w-3"></i>
                ${activity.status}
            </span>
        </div>
    `;
}

// Get status class for activity items
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'present':
            return 'bg-muted text-muted-foreground';
        case 'late':
            return 'badge-destructive';
        case 'early':
            return 'badge-secondary';
        case 'absent':
            return 'border border-border';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

// Get status icon for activity items
function getStatusIcon(status) {
    switch(status.toLowerCase()) {
        case 'present':
            return 'check-circle';
        case 'late':
            return 'x-circle';
        case 'early':
            return 'check-circle';
        case 'absent':
            return 'user-x';
        default:
            return 'check-circle';
    }
}

// Load weekly trends
async function loadWeeklyTrends() {
    try {
        const trends = await fetchWeeklyTrends();
        displayWeeklyTrends(trends);
    } catch (error) {
        console.error('Error loading weekly trends:', error);
        showError('Failed to load weekly trends');
    }
}

// Display weekly trends
function displayWeeklyTrends(trends) {
    const container = document.getElementById('weekly-trends');
    if (!container) return;

    container.innerHTML = trends.map(trend => createTrendItem(trend)).join('');
}

// Create trend item HTML
function createTrendItem(trend) {
    return `
        <div class="flex items-center justify-between">
            <span class="text-xs">${trend.day}</span>
            <div class="flex items-center space-x-2">
                <div class="w-24 bg-muted rounded-full h-2">
                    <div class="bg-primary h-2 rounded-full" style="width: ${trend.percentage}%"></div>
                </div>
                <span class="text-xs font-medium">${trend.percentage}%</span>
            </div>
        </div>
    `;
}

// Show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('loading');
    }
}

// Hide loading state
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('loading');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.textContent = message;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('main .p-6');
    if (mainContent) {
        mainContent.insertBefore(errorDiv, mainContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.textContent = message;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('main .p-6');
    if (mainContent) {
        mainContent.insertBefore(successDiv, mainContent.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 5000);
    }
}

// Modal functions now handled by modals.js and role-based dashboard
function showMarkAttendanceModal() {
    // Delegate to role-based dashboard
    if (window.roleBasedDashboard) {
        window.roleBasedDashboard.showAttendanceMarking();
    }
}

function showScheduleClassModal() {
    // Delegate to modals system
    if (window.showScheduleClassModal) {
        window.showScheduleClassModal();
    }
}

function showAddStudentModal() {
    // Delegate to modals system  
    if (window.showAddStudentModal) {
        window.showAddStudentModal();
    }
}

// Page loading functions (to be implemented)
function loadStudentsPage() {
    console.log('Loading students page');
    // Implementation will be added
}

function loadClassesPage() {
    console.log('Loading classes page');
    // Implementation will be added
}

function loadAnalyticsPage() {
    console.log('Loading analytics page');
    // Implementation will be added
}

function loadSettingsPage() {
    console.log('Loading settings page');
    // Implementation will be added
}