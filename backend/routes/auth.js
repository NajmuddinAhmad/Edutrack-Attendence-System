const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
        },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

// Helper function to remove password from user object
const sanitizeUser = (user) => {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Login attempt:', { email, password: '***' });

        // Validation
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email in database
        const users = await db.query('SELECT * FROM users WHERE email = ? AND isActive = 1', [email.toLowerCase()]);
        const user = users[0];
        console.log('👤 User found:', user ? `${user.email} (${user.role})` : 'Not found');
        
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ User account is deactivated:', email);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Verify password
        console.log('🔍 Verifying password for:', email);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Password valid:', isPasswordValid);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user);
        console.log('✅ Login successful for:', email, 'Role:', user.role);

        // Return success response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: sanitizeUser(user),
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            phone,
            role,
            department,
            year,
            studentId,
            teacherId
        } = req.body;

        // Validation
        if (!username || !email || !password || !firstName || !lastName || !role) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() || 
            u.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Role-specific validation
        if (role === 'student' && year && (year < 1 || year > 4)) {
            return res.status(400).json({
                success: false,
                message: 'Year must be between 1 and 4'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        // Generate IDs for student/teacher
        let generatedId = null;
        if (role === 'student') {
            const studentCount = users.filter(u => u.role === 'student').length;
            generatedId = studentId || `STU${String(studentCount + 4).padStart(3, '0')}`;
        } else if (role === 'teacher') {
            const teacherCount = users.filter(u => u.role === 'teacher').length;
            generatedId = teacherId || `TCH${String(teacherCount + 3).padStart(3, '0')}`;
        }

        // Create new user
        const newUser = {
            id: users.length + 1,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone: phone || '',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        // Add role-specific fields
        if (role === 'student') {
            newUser.studentId = generatedId;
            newUser.department = department || '';
            newUser.year = parseInt(year) || 1;
        } else if (role === 'teacher') {
            newUser.teacherId = generatedId;
            newUser.department = department || '';
        }

        // Add user to mock database
        users.push(newUser);

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: sanitizeUser(newUser),
                token,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// POST /api/auth/admin/create-user - Admin only endpoint to create users
router.post('/admin/create-user', authenticateToken, authorize('admin'), async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            phone,
            role,
            department,
            year,
            studentId,
            teacherId
        } = req.body;

        console.log('🔐 Admin creating user:', { 
            email, 
            role, 
            firstName, 
            lastName, 
            username: finalUsername,
            hasPassword: !!password,
            department,
            year 
        });

        // Auto-generate username if not provided
        const finalUsername = username || `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
        
        // Validation
        if (!email || !password || !firstName || !lastName || !role) {
            console.log('❌ Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName, role: !!role });
            return res.status(400).json({
                success: false,
                message: 'Email, password, first name, last name, and role are required'
            });
        }

        if (password !== confirmPassword) {
            console.log('❌ Passwords do not match');
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            console.log('❌ Password too short');
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (!['student', 'teacher', 'admin'].includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check if user already exists in database
        const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
        
        if (existingUsers.length > 0) {
            console.log('❌ User already exists:', email);
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Role-specific validation
        if (role === 'student' && year && (year < 1 || year > 4)) {
            console.log('❌ Invalid year:', year);
            return res.status(400).json({
                success: false,
                message: 'Year must be between 1 and 4'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        // Create user in database
        console.log('💾 Creating user in database');
        
        const result = await db.query(
            'INSERT INTO users (email, password, firstName, lastName, role, isActive) VALUES (?, ?, ?, ?, ?, 1)',
            [email.toLowerCase(), hashedPassword, firstName, lastName, role]
        );

        const newUserId = result.insertId;

        // Generate IDs and create role-specific records
        let generatedId = null;
        if (role === 'student') {
            const studentCount = await db.query('SELECT COUNT(*) as count FROM students');
            generatedId = studentId || `STU${String(studentCount[0].count + 1).padStart(3, '0')}`;
            
            await db.query(
                'INSERT INTO students (userId, studentId, enrollmentDate, semester, year, phone) VALUES (?, ?, NOW(), ?, ?, ?)',
                [newUserId, generatedId, 'Fall 2024', parseInt(year) || 1, phone || '']
            );
        } else if (role === 'teacher') {
            const teacherCount = await db.query('SELECT COUNT(*) as count FROM teachers');
            generatedId = teacherId || `TCH${String(teacherCount[0].count + 1).padStart(3, '0')}`;
            
            await db.query(
                'INSERT INTO teachers (userId, employeeId, department, phone) VALUES (?, ?, ?, ?)',
                [newUserId, generatedId, department || '', phone || '']
            );
        }

        // Get the created user from database
        const createdUsers = await db.query('SELECT * FROM users WHERE id = ?', [newUserId]);
        const newUser = createdUsers[0];

        console.log('✅ User created successfully:', newUser.email, 'Role:', newUser.role);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: sanitizeUser(newUser)
            }
        });

    } catch (error) {
        console.error('❌ Admin user creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// GET /api/auth/test - Simple test endpoint
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // In a real application, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const users = await db.query('SELECT * FROM users WHERE id = ? AND isActive = 1', [req.user.id]);
        const user = users[0];
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: sanitizeUser(user)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, department } = req.body;
        
        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user data
        users[userIndex] = {
            ...users[userIndex],
            firstName: firstName || users[userIndex].firstName,
            lastName: lastName || users[userIndex].lastName,
            phone: phone || users[userIndex].phone,
            department: department || users[userIndex].department,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: sanitizeUser(users[userIndex])
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const userIndex = users.findIndex(u => u.id === req.user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
        
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        // Update password
        users[userIndex].password = hashedNewPassword;
        users[userIndex].updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
});

// GET /api/auth/test-users - Get all test users (for development)
router.get('/test-users', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'This endpoint is only available in development mode'
        });
    }

    const testUsers = users.map(user => ({
        email: user.email,
        role: user.role,
        name: `${user.firstName} ${user.lastName}`,
        password: 'password123' // All test users have this password
    }));

    res.json({
        success: true,
        message: 'Test users for development',
        data: testUsers
    });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.user = user;
        next();
    });
}

// Middleware to check user roles
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
}

// Export middleware functions for use in other routes
router.authenticateToken = authenticateToken;
router.authorize = authorize;

module.exports = router;