const express = require('express');
const router = express.Router();

// Auth middleware 
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

// Admin middleware
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Get all teachers (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '', 
            department = '',
            status = 'all' 
        } = req.query;
        
        // Build database query with filters
        let query = 'SELECT * FROM users WHERE role = "teacher"';
        const queryParams = [];
        
        // Add search filter
        if (search) {
            query += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR department LIKE ?)';
            const searchTerm = `%${search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        // Add department filter
        if (department && department !== '') {
            query += ' AND department = ?';
            queryParams.push(department);
        }
        
        // Add status filter
        if (status !== 'all') {
            const isActive = status === 'active';
            query += ' AND isActive = ?';
            queryParams.push(isActive);
        }
        
        // Add ordering and pagination
        query += ' ORDER BY firstName, lastName LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        queryParams.push(parseInt(limit), offset);
        
        // Get teachers from database
        const [teachers] = await db.query(query, queryParams);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = "teacher"';
        const countParams = [];
        
        if (search) {
            countQuery += ' AND (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR department LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        
        if (department && department !== '') {
            countQuery += ' AND department = ?';
            countParams.push(department);
        }
        
        if (status !== 'all') {
            const isActive = status === 'active';
            countQuery += ' AND isActive = ?';
            countParams.push(isActive);
        }
        
        const [countResult] = await db.query(countQuery, countParams);
        const totalTeachers = countResult[0].total;
        
        res.json({
            success: true,
            data: {
                teachers: teachers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTeachers / limit),
                    totalTeachers,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// Get teacher by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const teacherId = parseInt(req.params.id);
        
        // Get teacher from database
        const [teachers] = await db.query('SELECT * FROM users WHERE id = ? AND role = "teacher"', [teacherId]);
        
        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        
        res.json({
            success: true,
            data: teachers[0]
        });
        
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// Update teacher status (admin only)
router.patch('/:id/status', auth, adminAuth, async (req, res) => {
    try {
        const teacherId = parseInt(req.params.id);
        const { isActive } = req.body;
        
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value'
            });
        }
        
        // In a real app, update the database
        // For now, return success
        res.json({
            success: true,
            message: `Teacher ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                id: teacherId,
                isActive
            }
        });
        
    } catch (error) {
        console.error('Error updating teacher status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// Get teacher statistics (admin only)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
    try {
        // Mock statistics with Indian educational context
        const stats = {
            totalTeachers: 245,
            activeTeachers: 231,
            inactiveTeachers: 14,
            newThisMonth: 8,
            departments: {
                'Computer Science & Engineering': 42,
                'Electronics & Communication': 38,
                'Mechanical Engineering': 35,
                'Civil Engineering': 32,
                'Mathematics': 28,
                'Physics': 25,
                'Chemistry': 22,
                'Electrical Engineering': 23
            },
            averageExperience: '11.5 years',
            totalClasses: 387,
            totalStudentsTeaching: 12450
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Error fetching teacher statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

module.exports = router;