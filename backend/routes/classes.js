const express = require('express');
const router = express.Router();
const db = require('../models/database');

// Get all classes
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, instructor = '', subject = '' } = req.query;
        
        let filteredClasses = classes;
        
        // Apply instructor filter
        if (instructor) {
            filteredClasses = filteredClasses.filter(cls => 
                cls.instructor.toLowerCase().includes(instructor.toLowerCase())
            );
        }
        
        // Apply subject filter
        if (subject) {
            filteredClasses = filteredClasses.filter(cls => 
                cls.subject.toLowerCase().includes(subject.toLowerCase())
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                classes: paginatedClasses,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredClasses.length / limit),
                    total: filteredClasses.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching classes',
            error: error.message
        });
    }
});

// Get single class
router.get('/:id', async (req, res) => {
    try {
        const classItem = classes.find(c => c.id === parseInt(req.params.id));
        
        if (!classItem) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        res.json({
            success: true,
            data: classItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching class',
            error: error.message
        });
    }
});

// Create new class
router.post('/', async (req, res) => {
    try {
        const {
            classCode,
            subject,
            instructor,
            schedule,
            duration,
            location
        } = req.body;
        
        // Validation
        if (!classCode || !subject || !instructor || !schedule) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Check if class code already exists
        const existingClass = classes.find(c => c.classCode === classCode);
        if (existingClass) {
            return res.status(400).json({
                success: false,
                message: 'Class code already exists'
            });
        }
        
        // Create new class
        const newClass = {
            id: classes.length + 1,
            classCode,
            subject,
            instructor,
            schedule,
            duration: parseInt(duration) || 60,
            location: location || '',
            students: [],
            totalStudents: 0,
            attendanceRate: 0,
            createdAt: new Date().toISOString()
        };
        
        classes.push(newClass);
        
        res.status(201).json({
            success: true,
            message: 'Class created successfully',
            data: newClass
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating class',
            error: error.message
        });
    }
});

// Update class
router.put('/:id', async (req, res) => {
    try {
        const classIndex = classes.findIndex(c => c.id === parseInt(req.params.id));
        
        if (classIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        const updatedClass = {
            ...classes[classIndex],
            ...req.body,
            id: classes[classIndex].id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        
        classes[classIndex] = updatedClass;
        
        res.json({
            success: true,
            message: 'Class updated successfully',
            data: updatedClass
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating class',
            error: error.message
        });
    }
});

// Delete class
router.delete('/:id', async (req, res) => {
    try {
        const classIndex = classes.findIndex(c => c.id === parseInt(req.params.id));
        
        if (classIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        const deletedClass = classes.splice(classIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Class deleted successfully',
            data: deletedClass
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting class',
            error: error.message
        });
    }
});

// Get today's classes
router.get('/today/schedule', async (req, res) => {
    try {
        // Mock today's classes
        const todayClasses = [
            {
                id: 1,
                classCode: 'CS101',
                time: '9:00 AM',
                instructor: 'Dr. Smith',
                location: 'Room 101',
                totalStudents: 45,
                status: 'In Progress'
            },
            {
                id: 2,
                classCode: 'MATH201',
                time: '10:30 AM',
                instructor: 'Prof. Johnson',
                location: 'Room 202',
                totalStudents: 38,
                status: 'Upcoming'
            },
            {
                id: 3,
                classCode: 'ENG102',
                time: '2:00 PM',
                instructor: 'Dr. Wilson',
                location: 'Room 105',
                totalStudents: 42,
                status: 'Upcoming'
            }
        ];
        
        res.json({
            success: true,
            data: todayClasses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s classes',
            error: error.message
        });
    }
});

module.exports = router;