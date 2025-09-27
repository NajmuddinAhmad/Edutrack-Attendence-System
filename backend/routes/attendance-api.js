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

// Get classes for teacher (for attendance marking)
router.get('/classes', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        
        let query = `
            SELECT 
                c.id,
                c.name,
                c.code,
                c.section,
                c.schedule,
                c.room,
                c.capacity,
                COUNT(e.studentId) as enrolled
            FROM classes c
            LEFT JOIN enrollments e ON c.id = e.classId
        `;
        
        const params = [];
        
        // If teacher, only show their classes
        if (req.user.role === 'teacher') {
            query += ' WHERE c.teacherId = ?';
            params.push(req.user.id);
        }
        
        query += ' GROUP BY c.id ORDER BY c.name';
        
        const classes = await db.query(query, params);
        
        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Error fetching teacher classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Get students for a specific class (for attendance marking)
router.get('/class/:classId/students', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        
        const { classId } = req.params;
        const { date } = req.query;
        
        // Get students enrolled in the class
        const studentsQuery = `
            SELECT 
                u.id,
                u.firstName,
                u.lastName,
                s.studentId,
                u.email,
                a.status as attendanceStatus,
                a.notes as attendanceNotes
            FROM users u
            JOIN students s ON u.id = s.userId
            JOIN enrollments e ON u.id = e.studentId
            LEFT JOIN attendance a ON u.id = a.studentId AND a.classId = ? AND DATE(a.date) = ?
            WHERE e.classId = ? AND u.role = 'student'
            ORDER BY u.firstName, u.lastName
        `;
        
        const students = await db.query(studentsQuery, [classId, date || new Date().toISOString().split('T')[0], classId]);
        
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({ error: 'Failed to fetch class students' });
    }
});

// Mark attendance for multiple students
router.post('/mark-class', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        
        const { classId, date, attendanceData } = req.body;
        
        if (!classId || !date || !attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Verify teacher has access to this class
        if (req.user.role === 'teacher') {
            const classCheck = await db.query(
                'SELECT id FROM classes WHERE id = ? AND teacherId = ?',
                [classId, req.user.id]
            );
            
            if (classCheck.length === 0) {
                return res.status(403).json({ error: 'Access denied. You can only mark attendance for your classes.' });
            }
        }
        
        // Start transaction
        await db.query('START TRANSACTION');
        
        try {
            // Delete existing attendance for this class and date
            await db.query(
                'DELETE FROM attendance WHERE classId = ? AND DATE(date) = ?',
                [classId, date]
            );
            
            // Insert new attendance records
            for (const record of attendanceData) {
                const { studentId, status, notes } = record;
                
                await db.query(
                    'INSERT INTO attendance (studentId, classId, date, status, markedBy, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                    [studentId, classId, date, status, req.user.id, notes || '']
                );
            }
            
            await db.query('COMMIT');
            
            res.json({
                success: true,
                message: 'Attendance marked successfully',
                data: {
                    classId,
                    date,
                    studentsMarked: attendanceData.length
                }
            });
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// Get attendance records for a class
router.get('/class/:classId', auth, async (req, res) => {
    try {
        const { classId } = req.params;
        const { startDate, endDate, page = 1, limit = 50 } = req.query;
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                a.id,
                a.date,
                a.status,
                a.notes,
                a.createdAt,
                u.firstName,
                u.lastName,
                s.studentId,
                c.name as className,
                c.code as classCode,
                teacher.firstName as teacherFirstName,
                teacher.lastName as teacherLastName
            FROM attendance a
            JOIN users u ON a.studentId = u.id
            JOIN students s ON u.id = s.userId
            JOIN classes c ON a.classId = c.id
            LEFT JOIN users teacher ON a.markedBy = teacher.id
            WHERE a.classId = ?
        `;
        
        const params = [classId];
        
        if (startDate) {
            query += ' AND DATE(a.date) >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND DATE(a.date) <= ?';
            params.push(endDate);
        }
        
        query += ` 
            ORDER BY a.date DESC, u.firstName, u.lastName
            LIMIT ? OFFSET ?
        `;
        params.push(parseInt(limit), offset);
        
        const attendance = await db.query(query, params);
        
        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Get attendance for a specific student
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, classId } = req.query;
        
        // Check if user can access this student's data
        if (req.user.role === 'student' && req.user.id !== parseInt(studentId)) {
            return res.status(403).json({ error: 'Access denied. You can only view your own attendance.' });
        }
        
        let query = `
            SELECT 
                a.id,
                a.date,
                a.status,
                a.notes,
                c.name as className,
                c.code as classCode,
                c.section,
                teacher.firstName as teacherFirstName,
                teacher.lastName as teacherLastName
            FROM attendance a
            JOIN classes c ON a.classId = c.id
            LEFT JOIN users teacher ON a.markedBy = teacher.id
            WHERE a.studentId = ?
        `;
        
        const params = [studentId];
        
        if (classId) {
            query += ' AND a.classId = ?';
            params.push(classId);
        }
        
        if (startDate) {
            query += ' AND DATE(a.date) >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND DATE(a.date) <= ?';
            params.push(endDate);
        }
        
        query += ' ORDER BY a.date DESC, c.name';
        
        const attendance = await db.query(query, params);
        
        // Get attendance summary
        const summaryQuery = `
            SELECT 
                c.id as classId,
                c.name as className,
                c.code as classCode,
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
            ORDER BY c.name
        `;
        
        const summary = await db.query(summaryQuery, [studentId, studentId]);
        
        res.json({
            success: true,
            data: {
                records: attendance,
                summary: summary
            }
        });
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ error: 'Failed to fetch student attendance' });
    }
});

// Update attendance record (Teachers only)
router.put('/:attendanceId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Teachers only.' });
        }
        
        const { attendanceId } = req.params;
        const { status, notes } = req.body;
        
        // Verify teacher has access to this attendance record
        if (req.user.role === 'teacher') {
            const attendanceCheck = await db.query(`
                SELECT a.id 
                FROM attendance a
                JOIN classes c ON a.classId = c.id
                WHERE a.id = ? AND c.teacherId = ?
            `, [attendanceId, req.user.id]);
            
            if (attendanceCheck.length === 0) {
                return res.status(403).json({ error: 'Access denied. You can only modify attendance for your classes.' });
            }
        }
        
        await db.query(
            'UPDATE attendance SET status = ?, notes = ?, updatedAt = NOW() WHERE id = ?',
            [status, notes || '', attendanceId]
        );
        
        res.json({
            success: true,
            message: 'Attendance updated successfully'
        });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

// Get attendance statistics
router.get('/stats/overview', auth, async (req, res) => {
    try {
        const { startDate, endDate, classId } = req.query;
        
        let baseQuery = 'FROM attendance a JOIN classes c ON a.classId = c.id';
        let whereClause = ' WHERE 1=1';
        const params = [];
        
        // Add teacher filter if not admin
        if (req.user.role === 'teacher') {
            whereClause += ' AND c.teacherId = ?';
            params.push(req.user.id);
        }
        
        if (classId) {
            whereClause += ' AND a.classId = ?';
            params.push(classId);
        }
        
        if (startDate) {
            whereClause += ' AND DATE(a.date) >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            whereClause += ' AND DATE(a.date) <= ?';
            params.push(endDate);
        }
        
        // Get overall statistics
        const statsQuery = `
            SELECT 
                COUNT(*) as totalRecords,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
                ROUND(
                    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / 
                    COUNT(*) * 100, 1
                ) as overallAttendanceRate
            ${baseQuery}${whereClause}
        `;
        
        const stats = await db.query(statsQuery, params);
        
        res.json({
            success: true,
            data: stats[0]
        });
    } catch (error) {
        console.error('Error fetching attendance stats:', error);
        res.status(500).json({ error: 'Failed to fetch attendance statistics' });
    }
});

module.exports = router;