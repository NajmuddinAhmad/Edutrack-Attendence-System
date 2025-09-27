const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock users database (in production, this would be in MySQL)
let users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@edutrack.com',
        password: '$2b$12$Ydy1uCsI5/Wy/CEuJehO.u8o4XDBG0nRzvW1rU4OMpFZp0mj9NcOi', // password123
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        username: 'dr.smith',
        email: 'dr.smith@university.edu',
        password: '$2b$12$GM9cHt0uaAuC3dPaUIgceOTNQ6c/jjjCkhQMAlisfx7AKnAjMIeDm', // password123
        role: 'teacher',
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567891',
        department: 'Computer Science',
        teacherId: 'TCH001',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 3,
        username: 'prof.johnson',
        email: 'prof.johnson@university.edu',
        password: '$2b$12$6Q0JNun.9KLhCePNLLZS5u0uGXz1CjXOg3ZvlE0qR91K3TOctgaYm', // password123
        role: 'teacher',
        firstName: 'Mary',
        lastName: 'Johnson',
        phone: '+1234567892',
        department: 'Mathematics',
        teacherId: 'TCH002',
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 4,
        username: 'alex.johnson',
        email: 'alex.johnson@student.edu',
        password: '$2b$12$Ydy1uCsI5/Wy/CEuJehO.u8o4XDBG0nRzvW1rU4OMpFZp0mj9NcOi', // password123
        role: 'student',
        firstName: 'Alex',
        lastName: 'Johnson',
        phone: '+1234567894',
        studentId: 'STU001',
        department: 'Computer Science',
        year: 3,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 5,
        username: 'maya.rodriguez',
        email: 'maya.rodriguez@student.edu',
        password: '$2b$12$GM9cHt0uaAuC3dPaUIgceOTNQ6c/jjjCkhQMAlisfx7AKnAjMIeDm', // password123
        role: 'student',
        firstName: 'Maya',
        lastName: 'Rodriguez',
        phone: '+1234567895',
        studentId: 'STU002',
        department: 'Mathematics',
        year: 2,
        isActive: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 6,
        username: 'emma.smith',
        email: 'emma.smith@student.edu',
        password: '$2b$12$6Q0JNun.9KLhCePNLLZS5u0uGXz1CjXOg3ZvlE0qR91K3TOctgaYm', // password123
        role: 'student',
        firstName: 'Emma',
        lastName: 'Smith',
        phone: '+1234567896',
        studentId: 'STU003',
        department: 'English Literature',
        year: 4,
        isActive: true,
        createdAt: new Date().toISOString()
    }
];

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

        // Find user by email
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // In a real application, you might want to blacklist the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// GET /api/auth/me - Get current user profile
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.id);
        
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