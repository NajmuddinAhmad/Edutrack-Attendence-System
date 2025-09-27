const express = require('express');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        // Mock data - replace with actual database queries
        const stats = {
            totalStudents: '1,247',
            presentToday: Math.floor(Math.random() * 100 + 1000).toString(),
            lateArrivals: Math.floor(Math.random() * 50 + 10).toString(),
            avgDuration: `${Math.floor(Math.random() * 20 + 45)} min`,
            attendanceRate: (Math.random() * 10 + 85).toFixed(1)
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
        // Mock data - replace with actual database queries
        const activities = [
            {
                id: 1,
                initials: 'AJ',
                name: 'Alex Johnson',
                class: 'CS101',
                time: 'checked in at 08:45 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                initials: 'MR',
                name: 'Maya Rodriguez',
                class: 'MATH201',
                time: 'checked in at 10:15 AM',
                status: 'present',
                timestamp: new Date().toISOString()
            },
            {
                id: 3,
                initials: 'ES',
                name: 'Emma Smith',
                class: 'ENG102',
                time: 'checked in at 09:25 AM',
                status: 'late',
                timestamp: new Date().toISOString()
            },
            {
                id: 4,
                initials: 'DK',
                name: 'David Kim',
                class: 'PHY301',
                time: 'checked in at 07:50 AM',
                status: 'early',
                timestamp: new Date().toISOString()
            },
            {
                id: 5,
                initials: 'LC',
                name: 'Lisa Chen',
                class: 'BIO201',
                time: 'marked absent',
                status: 'absent',
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