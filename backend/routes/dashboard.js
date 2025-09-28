const express = require('express');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Mock data with Indian educational context
        const stats = {
            totalStudents: '2,847',
            presentToday: Math.floor(Math.random() * 200 + 2400).toString(),
            lateArrivals: Math.floor(Math.random() * 80 + 30).toString(),
            avgDuration: `${Math.floor(Math.random() * 30 + 75)} min`,
            attendanceRate: (Math.random() * 8 + 84).toFixed(1)
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// Get recent activity
router.get('/activity', async (req, res) => {
    try {
        // Mock data with Indian educational context
        const activities = [
            {
                id: 1,
                initials: 'AP',
                name: 'Arjun Patel',
                class: 'CSE301 - Database Management Systems',
                time: 'checked in at 08:45 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                initials: 'PS',
                name: 'Priya Sharma',
                class: 'CSE205 - Data Structures & Algorithms',
                time: 'checked in at 10:15 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                initials: 'RG',
                name: 'Rahul Gupta',
                class: 'ECE201 - Digital Electronics',
                time: 'checked in at 09:25 AM',
                status: 'late',
                timestamp: new Date().toISOString()
            },
            {
                id: 4,
                initials: 'SS',
                name: 'Sneha Singh',
                class: 'MATH301 - Linear Algebra',
                time: 'checked in at 07:50 AM',
                status: 'early',
                timestamp: new Date().toISOString()
            },
            {
                id: 5,
                initials: 'VK',
                name: 'Vikas Kumar',
                class: 'PHY101 - Classical Mechanics',
                time: 'marked absent',
                status: 'absent',
                timestamp: new Date().toISOString()
            },
            {
                id: 6,
                initials: 'AJ',
                name: 'Anita Joshi',
                class: 'CHEM201 - Organic Chemistry',
                time: 'checked in at 08:30 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            },
            {
                id: 7,
                initials: 'DY',
                name: 'Deepak Yadav',
                class: 'CSE102 - Programming Fundamentals',
                time: 'checked in at 09:45 AM',
                status: 'late',
                timestamp: new Date().toISOString()
            },
            {
                id: 8,
                initials: 'KR',
                name: 'Kavya Reddy',
                class: 'ECE101 - Circuit Analysis',
                time: 'checked in at 08:15 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
});

// Get weekly trends
router.get('/trends', async (req, res) => {
    try {
        // Mock data - replace with actual database queries
        const trends = [
            { day: 'Monday', percentage: Math.floor(Math.random() * 10 + 85) },
            { day: 'Tuesday', percentage: Math.floor(Math.random() * 10 + 85) },
            { day: 'Wednesday', percentage: Math.floor(Math.random() * 10 + 85) },
            { day: 'Thursday', percentage: Math.floor(Math.random() * 10 + 85) },
            { day: 'Friday', percentage: Math.floor(Math.random() * 10 + 80) }
        ];

        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching weekly trends',
            error: error.message
        });
    }
});

module.exports = router;