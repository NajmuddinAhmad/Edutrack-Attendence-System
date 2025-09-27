// Enhanced Error Handling and Debugging for EduTrack
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.setupGlobalErrorHandling();
        this.setupConsoleDebugging();
    }

    setupGlobalErrorHandling() {
        // Catch all JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error,
                timestamp: new Date().toISOString()
            });
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupConsoleDebugging() {
        // Add debugging for specific functions
        this.debugFunctionCalls();
    }

    logError(errorInfo) {
        this.errors.push(errorInfo);
        console.error('EduTrack Error:', errorInfo);
        
        // Show user-friendly error message
        this.showErrorNotification(errorInfo);
    }

    showErrorNotification(errorInfo) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
        notification.innerHTML = `
            <div class="flex items-start">
                <i data-lucide="alert-circle" class="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"></i>
                <div>
                    <div class="font-semibold">Error Detected</div>
                    <div class="text-sm opacity-90">${errorInfo.message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }

    debugFunctionCalls() {
        // Monitor critical function calls
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            console.log('API Call:', args[0], args[1]);
            try {
                const response = await originalFetch.apply(this, args);
                console.log('API Response:', response.status, response.statusText);
                return response;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        };
    }

    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            errors: this.errors,
            browser: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }

    clearErrors() {
        this.errors = [];
    }

    // Test specific functionality
    testDashboardFunctionality() {
        const tests = [];
        
        // Test 1: Check if role dashboard exists
        tests.push({
            name: 'Role Dashboard Initialization',
            passed: window.roleBasedDashboard instanceof RoleBasedDashboard,
            error: !window.roleBasedDashboard ? 'RoleBasedDashboard not found' : null
        });

        // Test 2: Check if user is authenticated
        tests.push({
            name: 'User Authentication',
            passed: window.auth && window.auth.getUser(),
            error: !window.auth ? 'Auth not initialized' : !window.auth.getUser() ? 'User not logged in' : null
        });

        // Test 3: Check if student manager exists
        tests.push({
            name: 'Student Manager',
            passed: window.studentManager instanceof StudentManager,
            error: !window.studentManager ? 'StudentManager not found' : null
        });

        // Test 4: Check if attendance marker exists
        tests.push({
            name: 'Attendance Marker',
            passed: window.attendanceMarker instanceof AttendanceMarker,
            error: !window.attendanceMarker ? 'AttendanceMarker not found' : null
        });

        // Test 5: Check navigation elements
        const navItems = document.querySelectorAll('.nav-item');
        tests.push({
            name: 'Navigation Elements',
            passed: navItems.length > 0,
            error: navItems.length === 0 ? 'No navigation items found' : null
        });

        // Test 6: Check if student attendance viewer is properly initialized
        const dashboard = window.roleBasedDashboard;
        tests.push({
            name: 'Student Attendance Viewer',
            passed: dashboard && dashboard.studentAttendanceViewer,
            error: !dashboard ? 'No dashboard' : !dashboard.studentAttendanceViewer ? 'StudentAttendanceViewer not initialized' : null
        });

        return tests;
    }

    runDiagnostics() {
        console.log('🔍 Running EduTrack Diagnostics...');
        
        const tests = this.testDashboardFunctionality();
        
        console.log('\n📊 Test Results:');
        tests.forEach((test, index) => {
            const status = test.passed ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${test.name}`);
            if (!test.passed && test.error) {
                console.log(`   Error: ${test.error}`);
            }
        });

        const passedTests = tests.filter(t => t.passed).length;
        const totalTests = tests.length;
        
        console.log(`\n📈 Summary: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests < totalTests) {
            console.log('\n🔧 Recommended Actions:');
            tests.filter(t => !t.passed).forEach(test => {
                console.log(`- Fix: ${test.name} - ${test.error}`);
            });
        }

        return {
            passed: passedTests,
            total: totalTests,
            tests: tests
        };
    }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();

// Add diagnostic command to console
window.runDiagnostics = () => window.errorHandler.runDiagnostics();

console.log('🛠️ EduTrack Error Handler loaded. Run "runDiagnostics()" in console for system check.');