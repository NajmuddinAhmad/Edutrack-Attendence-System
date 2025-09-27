const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');

// Auth middleware to check authentication
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

// Get all students with pagination and search
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', department = '', year = '' } = req.query;
        
        let filteredStudents = students;
        
        // Apply search filter
        if (search) {
            filteredStudents = filteredStudents.filter(student => 
                student.firstName.toLowerCase().includes(search.toLowerCase()) ||
                student.lastName.toLowerCase().includes(search.toLowerCase()) ||
                student.studentId.toLowerCase().includes(search.toLowerCase()) ||
                student.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply department filter
        if (department) {
            filteredStudents = filteredStudents.filter(student => 
                student.department === department
            );
        }
        
        // Apply year filter
        if (year) {
            filteredStudents = filteredStudents.filter(student => 
                student.year === parseInt(year)
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                students: paginatedStudents,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredStudents.length / limit),
                    total: filteredStudents.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching students',
            error: error.message
        });
    }
});

// Get single student
router.get('/:id', async (req, res) => {
    try {
        const student = students.find(s => s.id === parseInt(req.params.id));
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching student',
            error: error.message
        });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        const {
            studentId,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            department,
            year
        } = req.body;
        
        // Validation
        if (!studentId || !firstName || !lastName || !email || !department || !year) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Check if student ID already exists
        const existingStudent = students.find(s => s.studentId === studentId);
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student ID already exists'
            });
        }
        
        // Create new student
        const newStudent = {
            id: students.length + 1,
            studentId,
            firstName,
            lastName,
            email,
            phone: phone || '',
            dateOfBirth: dateOfBirth || '',
            department,
            year: parseInt(year),
            status: 'active',
            attendanceRate: 0,
            createdAt: new Date().toISOString()
        };
        
        students.push(newStudent);
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: newStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating student',
            error: error.message
        });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
        
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const updatedStudent = {
            ...students[studentIndex],
            ...req.body,
            id: students[studentIndex].id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        
        students[studentIndex] = updatedStudent;
        
        res.json({
            success: true,
            message: 'Student updated successfully',
            data: updatedStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating student',
            error: error.message
        });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const studentIndex = students.findIndex(s => s.id === parseInt(req.params.id));
        
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        const deletedStudent = students.splice(studentIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Student deleted successfully',
            data: deletedStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting student',
            error: error.message
        });
    }
});

module.exports = router;