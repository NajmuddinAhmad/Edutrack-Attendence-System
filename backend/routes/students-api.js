const express = require('express');
const router = express.Router();
const db = require('../models/database');

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

// Get all students with real data
router.get('/real', auth, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = '', 
            status = 'all' 
        } = req.query;
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                u.id,
                u.firstName,
                u.lastName,
                u.email,
                s.studentId,
                s.enrollmentDate,
                s.semester,
                s.year,
                s.gpa,
                s.phone,
                s.address,
                s.emergencyContact,
                u.isActive as status,
                GROUP_CONCAT(DISTINCT c.code) as classes,
                ROUND(AVG(
                    CASE 
                        WHEN a.status = 'present' THEN 100
                        WHEN a.status = 'late' THEN 75
                        ELSE 0
                    END
                ), 1) as attendance
            FROM users u
            JOIN students s ON u.id = s.userId
            LEFT JOIN enrollments e ON u.id = e.studentId
            LEFT JOIN classes c ON e.classId = c.id
            LEFT JOIN attendance a ON u.id = a.studentId AND c.id = a.classId
            WHERE u.role = 'student'
        `;
        
        const params = [];
        
        if (search) {
            query += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR s.studentId LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (status !== 'all') {
            query += ` AND u.isActive = ?`;
            params.push(status === 'active' ? 1 : 0);
        }
        
        query += ` 
            GROUP BY u.id 
            ORDER BY u.firstName, u.lastName 
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), offset);
        
        const students = await db.query(query, params);
        
        // Get total count
        let countQuery = `
            SELECT COUNT(DISTINCT u.id) as total
            FROM users u
            JOIN students s ON u.id = s.userId
            WHERE u.role = 'student'
        `;
        
        const countParams = [];
        if (search) {
            countQuery += ` AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ? OR s.studentId LIKE ?)`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (status !== 'all') {
            countQuery += ` AND u.isActive = ?`;
            countParams.push(status === 'active' ? 1 : 0);
        }
        
        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
            success: true,
            data: {
                students: students.map(student => ({
                    ...student,
                    classes: student.classes ? student.classes.split(',') : [],
                    attendance: student.attendance || 0
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// Get single student by ID with real data
router.get('/real/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const studentQuery = `
            SELECT 
                u.id,
                u.firstName,
                u.lastName,
                u.email,
                s.studentId,
                s.enrollmentDate,
                s.semester,
                s.year,
                s.gpa,
                s.phone,
                s.address,
                s.emergencyContact,
                u.isActive as status
            FROM users u
            JOIN students s ON u.id = s.userId
            WHERE u.id = ? AND u.role = 'student'
        `;
        
        const students = await db.query(studentQuery, [id]);
        if (students.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const student = students[0];
        
        // Get enrolled classes
        const classesQuery = `
            SELECT c.id, c.name, c.code, c.section
            FROM classes c
            JOIN enrollments e ON c.id = e.classId
            WHERE e.studentId = ?
        `;
        const classes = await db.query(classesQuery, [id]);
        
        // Get attendance summary
        const attendanceQuery = `
            SELECT 
                c.code,
                c.name,
                COUNT(a.id) as totalSessions,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
                ROUND(
                    (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) + 
                     SUM(CASE WHEN a.status = 'late' THEN 0.75 ELSE 0 END)) / 
                    NULLIF(COUNT(a.id), 0) * 100, 1
                ) as attendancePercentage
            FROM classes c
            JOIN enrollments e ON c.id = e.classId
            LEFT JOIN attendance a ON c.id = a.classId AND a.studentId = ?
            WHERE e.studentId = ?
            GROUP BY c.id
        `;
        const attendance = await db.query(attendanceQuery, [id, id]);
        
        res.json({
            success: true,
            data: {
                ...student,
                classes,
                attendance
            }
        });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// Create new student (Admin only)
router.post('/real', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        
        const {
            firstName,
            lastName,
            email,
            studentId,
            enrollmentDate,
            semester,
            year,
            gpa,
            phone,
            address,
            emergencyContact,
            password = 'password123' // Default password
        } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !studentId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Check if email or student ID already exists
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const existingStudent = await db.query(
            'SELECT id FROM students WHERE studentId = ?',
            [studentId]
        );
        
        if (existingStudent.length > 0) {
            return res.status(400).json({ error: 'Student ID already exists' });
        }
        
        // Hash password
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Start transaction
        await db.query('START TRANSACTION');
        
        try {
            // Insert user
            const userResult = await db.query(
                'INSERT INTO users (email, password, firstName, lastName, role, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [email, hashedPassword, firstName, lastName, 'student', 1]
            );
            
            const userId = userResult.insertId;
            
            // Insert student details
            await db.query(
                'INSERT INTO students (userId, studentId, enrollmentDate, semester, year, gpa, phone, address, emergencyContact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, studentId, enrollmentDate || new Date(), semester || 'Fall 2024', year || 'Freshman', gpa || 0.0, phone, address, emergencyContact]
            );
            
            await db.query('COMMIT');
            
            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: { studentId: userId }
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// Update student (Admin only)
router.put('/real/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        
        const { id } = req.params;
        const {
            firstName,
            lastName,
            email,
            studentId,
            enrollmentDate,
            semester,
            year,
            gpa,
            phone,
            address,
            emergencyContact,
            isActive
        } = req.body;
        
        // Check if student exists
        const existingStudent = await db.query(
            'SELECT u.id FROM users u JOIN students s ON u.id = s.userId WHERE u.id = ? AND u.role = "student"',
            [id]
        );
        
        if (existingStudent.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Start transaction
        await db.query('START TRANSACTION');
        
        try {
            // Update user table
            await db.query(
                'UPDATE users SET firstName = ?, lastName = ?, email = ?, isActive = ?, updatedAt = NOW() WHERE id = ?',
                [firstName, lastName, email, isActive ? 1 : 0, id]
            );
            
            // Update student table
            await db.query(
                'UPDATE students SET studentId = ?, enrollmentDate = ?, semester = ?, year = ?, gpa = ?, phone = ?, address = ?, emergencyContact = ? WHERE userId = ?',
                [studentId, enrollmentDate, semester, year, gpa, phone, address, emergencyContact, id]
            );
            
            await db.query('COMMIT');
            
            res.json({ 
                success: true,
                message: 'Student updated successfully' 
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// Delete student (Admin only)
router.delete('/real/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        
        const { id } = req.params;
        
        // Check if student exists
        const existingStudent = await db.query(
            'SELECT u.id FROM users u JOIN students s ON u.id = s.userId WHERE u.id = ? AND u.role = "student"',
            [id]
        );
        
        if (existingStudent.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Start transaction
        await db.query('START TRANSACTION');
        
        try {
            // Delete attendance records
            await db.query('DELETE FROM attendance WHERE studentId = ?', [id]);
            
            // Delete enrollments
            await db.query('DELETE FROM enrollments WHERE studentId = ?', [id]);
            
            // Delete student record
            await db.query('DELETE FROM students WHERE userId = ?', [id]);
            
            // Delete user record
            await db.query('DELETE FROM users WHERE id = ?', [id]);
            
            await db.query('COMMIT');
            
            res.json({ 
                success: true,
                message: 'Student deleted successfully' 
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

module.exports = router;