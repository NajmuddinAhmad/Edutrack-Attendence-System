// Dashboard specific functionality
class Dashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.isLoading = false;
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Refresh button (if added)
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Real-time updates simulation
        this.simulateRealTimeUpdates();
    }

    async refreshDashboard() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentActivity(),
                this.loadWeeklyTrends()
            ]);
            
            showSuccess('Dashboard refreshed successfully');
        } catch (error) {
            console.error('Dashboard refresh failed:', error);
            showError('Failed to refresh dashboard');
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    async loadStats() {
        try {
            const stats = await this.fetchDashboardStats();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activities = await this.fetchRecentActivity();
            this.displayRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    }

    async loadWeeklyTrends() {
        try {
            const trends = await this.fetchWeeklyTrends();
            this.displayWeeklyTrends(trends);
        } catch (error) {
            console.error('Error loading weekly trends:', error);
        }
    }

    // Mock data functions (replace with actual API calls)
    async fetchDashboardStats() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    totalStudents: '1,247',
                    presentToday: Math.floor(Math.random() * 100 + 1000).toLocaleString(),
                    lateArrivals: Math.floor(Math.random() * 50 + 10),
                    avgDuration: `${Math.floor(Math.random() * 20 + 45)} min`,
                    attendanceRate: (Math.random() * 10 + 85).toFixed(1)
                });
            }, 500);
        });
    }

    async fetchRecentActivity() {
        const names = [
            { name: 'Alex Johnson', initials: 'AJ', class: 'CS101' },
            { name: 'Maya Rodriguez', initials: 'MR', class: 'MATH201' },
            { name: 'Emma Smith', initials: 'ES', class: 'ENG102' },
            { name: 'David Kim', initials: 'DK', class: 'PHY301' },
            { name: 'Lisa Chen', initials: 'LC', class: 'BIO201' },
            { name: 'John Doe', initials: 'JD', class: 'HIST101' },
            { name: 'Sarah Wilson', initials: 'SW', class: 'CHEM201' },
            { name: 'Mike Johnson', initials: 'MJ', class: 'ART101' }
        ];

        const statuses = ['present', 'late', 'early', 'absent'];
        const times = ['08:45 AM', '09:15 AM', '10:30 AM', '11:00 AM', '07:50 AM'];

        return new Promise(resolve => {
            setTimeout(() => {
                const activities = [];
                for (let i = 0; i < 5; i++) {
                    const student = names[Math.floor(Math.random() * names.length)];
                    const status = statuses[Math.floor(Math.random() * statuses.length)];
                    const time = times[Math.floor(Math.random() * times.length)];
                    
                    activities.push({
                        ...student,
                        time: status === 'absent' ? 'marked absent' : `checked in at ${time}`,
                        status
                    });
                }
                resolve(activities);
            }, 300);
        });
    }

    async fetchWeeklyTrends() {
        return new Promise(resolve => {
            setTimeout(() => {
                const trends = [
                    { day: 'Monday', percentage: Math.floor(Math.random() * 10 + 85) },
                    { day: 'Tuesday', percentage: Math.floor(Math.random() * 10 + 85) },
                    { day: 'Wednesday', percentage: Math.floor(Math.random() * 10 + 85) },
                    { day: 'Thursday', percentage: Math.floor(Math.random() * 10 + 85) },
                    { day: 'Friday', percentage: Math.floor(Math.random() * 10 + 80) }
                ];
                resolve(trends);
            }, 200);
        });
    }

    updateStatsDisplay(stats) {
        const elements = {
            'total-students': stats.totalStudents,
            'present-today': stats.presentToday,
            'late-arrivals': stats.lateArrivals,
            'avg-duration': stats.avgDuration
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // Add animation effect
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.textContent = value;
                    element.style.opacity = '1';
                }, 200);
            }
        });

        // Update attendance rate
        const attendanceRateElement = document.getElementById('attendance-rate');
        if (attendanceRateElement && stats.attendanceRate) {
            attendanceRateElement.style.opacity = '0.5';
            setTimeout(() => {
                attendanceRateElement.textContent = `${stats.attendanceRate}% attendance rate`;
                attendanceRateElement.style.opacity = '1';
            }, 200);
        }
    }

    displayRecentActivity(activities) {
        const container = document.getElementById('recent-activity');
        if (!container) return;

        // Add fade out effect
        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.innerHTML = activities.map(activity => this.createActivityItem(activity)).join('');
            container.style.opacity = '1';
            
            // Re-initialize Lucide icons for new content
            lucide.createIcons();
        }, 300);
    }

    createActivityItem(activity) {
        const statusClass = this.getStatusClass(activity.status);
        const statusIcon = this.getStatusIcon(activity.status);
        
        return `
            <div class="flex items-center space-x-4 animate-fade-in">
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

    getStatusClass(status) {
        switch(status.toLowerCase()) {
            case 'present':
                return 'bg-muted text-muted-foreground';
            case 'late':
                return 'badge-destructive';
            case 'early':
                return 'badge-success';
            case 'absent':
                return 'border border-border';
            default:
                return 'bg-muted text-muted-foreground';
        }
    }

    getStatusIcon(status) {
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

    displayWeeklyTrends(trends) {
        const container = document.getElementById('weekly-trends');
        if (!container) return;

        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.innerHTML = trends.map(trend => this.createTrendItem(trend)).join('');
            container.style.opacity = '1';
        }, 200);
    }

    createTrendItem(trend) {
        return `
            <div class="flex items-center justify-between animate-fade-in">
                <span class="text-xs">${trend.day}</span>
                <div class="flex items-center space-x-2">
                    <div class="w-24 bg-muted rounded-full h-2">
                        <div class="bg-primary h-2 rounded-full transition-all duration-500" style="width: ${trend.percentage}%"></div>
                    </div>
                    <span class="text-xs font-medium">${trend.percentage}%</span>
                </div>
            </div>
        `;
    }

    simulateRealTimeUpdates() {
        // Simulate periodic updates every 30 seconds
        setInterval(() => {
            if (this.currentPage === 'dashboard' && !this.isLoading) {
                this.loadStats();
            }
        }, 30000);

        // Simulate new activity every 45 seconds
        setInterval(() => {
            if (this.currentPage === 'dashboard' && !this.isLoading) {
                this.loadRecentActivity();
            }
        }, 45000);
    }

    startAutoRefresh() {
        // Auto refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.refreshDashboard();
            }
        }, 300000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoadingState() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '0.7';
            mainContent.style.pointerEvents = 'none';
        }
    }

    hideLoadingState() {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.style.opacity = '1';
            mainContent.style.pointerEvents = 'auto';
        }
    }

    destroy() {
        this.stopAutoRefresh();
    }
}

// Initialize dashboard when DOM is loaded
let dashboardInstance;

document.addEventListener('DOMContentLoaded', function() {
    dashboardInstance = new Dashboard();
});

// Clean up when page is unloaded
window.addEventListener('beforeunload', function() {
    if (dashboardInstance) {
        dashboardInstance.destroy();
    }
});