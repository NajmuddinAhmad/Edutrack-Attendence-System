const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const studentRoutes = require('./routes/students');
const studentsApiRoutes = require('./routes/students-api');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const attendanceApiRoutes = require('./routes/attendance-api');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/students-real', studentsApiRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance-real', attendanceApiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve specific HTML files
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    // Check if it's a file request (has extension)
    if (path.extname(req.path)) {
        res.status(404).send('File not found');
    } else {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Frontend is available at the same URL`);
});

module.exports = app;