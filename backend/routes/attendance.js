const express = require('express');
const router = express.Router();

// Mock attendance data
let attendanceRecords = [
    {
        id: 1,
        studentId: 1,
        classId: 1,
        date: new Date().toISOString().split('T')[0],
        time: '09:00:00',
        status: 'present',
        checkInTime: '08:55:00',
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        studentId: 2,
        classId: 1,
        date: new Date().toISOString().split('T')[0],
        time: '09:00:00',
        status: 'late',
        checkInTime: '09:15:00',
        createdAt: new Date().toISOString()
    }
];

// Mark attendance
router.post('/', async (req, res) => {
    try {
        const {
            studentId,
            classId,
            date,
            time,
            status = 'present',
            checkInTime
        } = req.body;
        
        // Validation
        if (!studentId || !classId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: studentId, classId, and date'
            });
        }
        
        // Check if attendance already exists for this student, class, and date
        const existingAttendance = attendanceRecords.find(record => 
            record.studentId === parseInt(studentId) && 
            record.classId === parseInt(classId) && 
            record.date === date
        );
        
        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Attendance already marked for this student today'
            });
        }
        
        // Create new attendance record
        const newAttendance = {
            id: attendanceRecords.length + 1,
            studentId: parseInt(studentId),
            classId: parseInt(classId),
            date,
            time: time || new Date().toTimeString().split(' ')[0],
            status,
            checkInTime: checkInTime || new Date().toTimeString().split(' ')[0],
            createdAt: new Date().toISOString()
        };
        
        attendanceRecords.push(newAttendance);
        
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: newAttendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
});

// Get attendance records
router.get('/', async (req, res) => {
    try {
        const { classId, date, studentId, page = 1, limit = 10 } = req.query;
        
        let filteredRecords = attendanceRecords;
        
        // Apply filters
        if (classId) {
            filteredRecords = filteredRecords.filter(record => 
                record.classId === parseInt(classId)
            );
        }
        
        if (date) {
            filteredRecords = filteredRecords.filter(record => 
                record.date === date
            );
        }
        
        if (studentId) {
            filteredRecords = filteredRecords.filter(record => 
                record.studentId === parseInt(studentId)
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                records: paginatedRecords,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredRecords.length / limit),
                    total: filteredRecords.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records',
            error: error.message
        });
    }
});

// Get attendance for specific class and date
router.get('/class/:classId/date/:date', async (req, res) => {
    try {
        const { classId, date } = req.params;
        
        const records = attendanceRecords.filter(record => 
            record.classId === parseInt(classId) && 
            record.date === date
        );
        
        // Get attendance statistics
        const totalStudents = 45; // This should come from the class data
        const presentCount = records.filter(r => r.status === 'present').length;
        const lateCount = records.filter(r => r.status === 'late').length;
        const absentCount = totalStudents - presentCount - lateCount;
        
        const statistics = {
            totalStudents,
            present: presentCount,
            late: lateCount,
            absent: absentCount,
            attendanceRate: ((presentCount + lateCount) / totalStudents * 100).toFixed(1)
        };
        
        res.json({
            success: true,
            data: {
                records,
                statistics
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching class attendance',
            error: error.message
        });
    }
});

// Update attendance record
router.put('/:id', async (req, res) => {
    try {
        const recordIndex = attendanceRecords.findIndex(r => r.id === parseInt(req.params.id));
        
        if (recordIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        
        const updatedRecord = {
            ...attendanceRecords[recordIndex],
            ...req.body,
            id: attendanceRecords[recordIndex].id, // Ensure ID doesn't change
            updatedAt: new Date().toISOString()
        };
        
        attendanceRecords[recordIndex] = updatedRecord;
        
        res.json({
            success: true,
            message: 'Attendance record updated successfully',
            data: updatedRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating attendance record',
            error: error.message
        });
    }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
    try {
        const recordIndex = attendanceRecords.findIndex(r => r.id === parseInt(req.params.id));
        
        if (recordIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        
        const deletedRecord = attendanceRecords.splice(recordIndex, 1)[0];
        
        res.json({
            success: true,
            message: 'Attendance record deleted successfully',
            data: deletedRecord
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting attendance record',
            error: error.message
        });
    }
});

// Bulk mark attendance
router.post('/bulk', async (req, res) => {
    try {
        const { classId, date, attendanceData } = req.body;
        
        if (!classId || !date || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: classId, date, and attendanceData array'
            });
        }
        
        const newRecords = [];
        
        for (const record of attendanceData) {
            const { studentId, status, checkInTime } = record;
            
            // Check if attendance already exists
            const existingRecord = attendanceRecords.find(r => 
                r.studentId === parseInt(studentId) && 
                r.classId === parseInt(classId) && 
                r.date === date
            );
            
            if (!existingRecord) {
                const newRecord = {
                    id: attendanceRecords.length + newRecords.length + 1,
                    studentId: parseInt(studentId),
                    classId: parseInt(classId),
                    date,
                    time: new Date().toTimeString().split(' ')[0],
                    status: status || 'present',
                    checkInTime: checkInTime || new Date().toTimeString().split(' ')[0],
                    createdAt: new Date().toISOString()
                };
                
                attendanceRecords.push(newRecord);
                newRecords.push(newRecord);
            }
        }
        
        res.status(201).json({
            success: true,
            message: `${newRecords.length} attendance records created successfully`,
            data: newRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking bulk attendance',
            error: error.message
        });
    }
});

module.exports = router;