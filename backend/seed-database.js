const db = require('./models/database');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        await db.query('TRUNCATE TABLE attendance');
        await db.query('TRUNCATE TABLE enrollments');
        await db.query('TRUNCATE TABLE classes');
        await db.query('TRUNCATE TABLE teachers');
        await db.query('TRUNCATE TABLE students');
        await db.query('TRUNCATE TABLE users');
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        
        // Hash password for all users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Insert users
        console.log('👥 Creating users...');
        await db.query(`
            INSERT INTO users (email, password, firstName, lastName, role, isActive, createdAt) VALUES
            ('admin@edutrack.com', ?, 'Admin', 'User', 'admin', 1, NOW()),
            ('dr.smith@university.edu', ?, 'Sarah', 'Smith', 'teacher', 1, NOW()),
            ('prof.johnson@university.edu', ?, 'Michael', 'Johnson', 'teacher', 1, NOW()),
            ('prof.davis@university.edu', ?, 'Emily', 'Davis', 'teacher', 1, NOW()),
            ('alex.johnson@student.edu', ?, 'Alex', 'Johnson', 'student', 1, NOW()),
            ('maya.rodriguez@student.edu', ?, 'Maya', 'Rodriguez', 'student', 1, NOW()),
            ('emma.smith@student.edu', ?, 'Emma', 'Smith', 'student', 1, NOW()),
            ('james.wilson@student.edu', ?, 'James', 'Wilson', 'student', 1, NOW()),
            ('sofia.chen@student.edu', ?, 'Sofia', 'Chen', 'student', 1, NOW()),
            ('marcus.davis@student.edu', ?, 'Marcus', 'Davis', 'student', 1, NOW()),
            ('isabella.garcia@student.edu', ?, 'Isabella', 'Garcia', 'student', 1, NOW()),
            ('ryan.thompson@student.edu', ?, 'Ryan', 'Thompson', 'student', 1, NOW()),
            ('olivia.brown@student.edu', ?, 'Olivia', 'Brown', 'student', 1, NOW()),
            ('noah.taylor@student.edu', ?, 'Noah', 'Taylor', 'student', 1, NOW()),
            ('ava.anderson@student.edu', ?, 'Ava', 'Anderson', 'student', 1, NOW()),
            ('liam.martinez@student.edu', ?, 'Liam', 'Martinez', 'student', 1, NOW())
        `, Array(16).fill(hashedPassword));
        
        // Insert students
        console.log('🎓 Creating students...');
        await db.query(`
            INSERT INTO students (userId, studentId, enrollmentDate, semester, year, gpa, phone, address, emergencyContact) VALUES
            (5, 'STU001', '2023-09-01', 'Fall 2024', 'Sophomore', 3.8, '+1 (555) 123-4567', '123 Campus Dr, University City', 'Jane Johnson - (555) 987-6543'),
            (6, 'STU002', '2023-09-01', 'Fall 2024', 'Junior', 3.6, '+1 (555) 234-5678', '456 Oak St, University City', 'Carlos Rodriguez - (555) 876-5432'),
            (7, 'STU003', '2024-01-15', 'Fall 2024', 'Senior', 3.9, '+1 (555) 345-6789', '789 Pine Ave, University City', 'Robert Smith - (555) 765-4321'),
            (8, 'STU004', '2023-09-01', 'Fall 2024', 'Freshman', 3.2, '+1 (555) 456-7890', '321 Elm St, University City', 'Mary Wilson - (555) 654-3210'),
            (9, 'STU005', '2023-09-01', 'Fall 2024', 'Junior', 3.7, '+1 (555) 567-8901', '654 Maple Dr, University City', 'Li Chen - (555) 543-2109'),
            (10, 'STU006', '2024-08-15', 'Fall 2024', 'Freshman', 3.4, '+1 (555) 678-9012', '987 Cedar Ln, University City', 'Angela Davis - (555) 432-1098'),
            (11, 'STU007', '2023-09-01', 'Fall 2024', 'Sophomore', 3.5, '+1 (555) 789-0123', '147 Birch Ave, University City', 'Juan Garcia - (555) 321-0987'),
            (12, 'STU008', '2023-09-01', 'Fall 2024', 'Junior', 3.3, '+1 (555) 890-1234', '258 Willow St, University City', 'Linda Thompson - (555) 210-9876'),
            (13, 'STU009', '2024-01-15', 'Fall 2024', 'Freshman', 3.8, '+1 (555) 901-2345', '369 Spruce Dr, University City', 'David Brown - (555) 109-8765'),
            (14, 'STU010', '2023-09-01', 'Fall 2024', 'Senior', 3.9, '+1 (555) 012-3456', '480 Ash Ln, University City', 'Sarah Taylor - (555) 098-7654'),
            (15, 'STU011', '2023-09-01', 'Fall 2024', 'Junior', 3.6, '+1 (555) 123-4567', '591 Poplar St, University City', 'Mark Anderson - (555) 987-6543'),
            (16, 'STU012', '2024-08-15', 'Fall 2024', 'Sophomore', 3.4, '+1 (555) 234-5678', '602 Hickory Ave, University City', 'Lisa Martinez - (555) 876-5432')
        `);
        
        // Insert teachers
        console.log('👨‍🏫 Creating teachers...');
        await db.query(`
            INSERT INTO teachers (userId, employeeId, department, hireDate, phone, office) VALUES
            (2, 'TCH001', 'Computer Science', '2020-08-15', '+1 (555) 234-5678', 'CS Building, Room 301'),
            (3, 'TCH002', 'Computer Science', '2018-01-10', '+1 (555) 345-6789', 'CS Building, Room 302'),
            (4, 'TCH003', 'Computer Science', '2019-08-20', '+1 (555) 456-7890', 'CS Building, Room 303')
        `);
        
        // Insert classes
        console.log('📚 Creating classes...');
        await db.query(`
            INSERT INTO classes (name, code, section, description, credits, capacity, teacherId, semester, schedule, room, isActive) VALUES
            ('Data Structures', 'CS201', 'A', 'Introduction to fundamental data structures and algorithms', 3, 40, 2, 'Fall 2024', 'Mon,Wed,Fri 09:00-10:30', 'Room 201', 1),
            ('Database Systems', 'CS301', 'B', 'Design and implementation of database systems', 4, 30, 2, 'Fall 2024', 'Tue,Thu 14:00-15:30', 'Lab 301', 1),
            ('Software Engineering', 'CS401', 'A', 'Software development methodologies and project management', 3, 35, 2, 'Fall 2024', 'Mon,Wed 11:00-12:30', 'Room 401', 1),
            ('Computer Networks', 'CS302', 'A', 'Fundamentals of computer networking and protocols', 3, 30, 3, 'Fall 2024', 'Tue,Thu 10:00-11:30', 'Room 302', 1),
            ('Web Development', 'CS203', 'B', 'Modern web development technologies and frameworks', 3, 45, 4, 'Fall 2024', 'Mon,Wed,Fri 13:00-14:30', 'Lab 203', 1)
        `);
        
        // Insert enrollments
        console.log('📝 Creating enrollments...');
        await db.query(`
            INSERT INTO enrollments (studentId, classId, enrollmentDate, status) VALUES
            (5, 1, '2024-08-20', 'enrolled'), (6, 1, '2024-08-20', 'enrolled'), (8, 1, '2024-08-20', 'enrolled'),
            (10, 1, '2024-08-20', 'enrolled'), (11, 1, '2024-08-20', 'enrolled'), (13, 1, '2024-08-20', 'enrolled'),
            (16, 1, '2024-08-20', 'enrolled'), (5, 2, '2024-08-20', 'enrolled'), (7, 2, '2024-08-20', 'enrolled'),
            (9, 2, '2024-08-20', 'enrolled'), (12, 2, '2024-08-20', 'enrolled'), (15, 2, '2024-08-20', 'enrolled'),
            (6, 3, '2024-08-20', 'enrolled'), (7, 3, '2024-08-20', 'enrolled'), (9, 3, '2024-08-20', 'enrolled'),
            (14, 3, '2024-08-20', 'enrolled'), (11, 4, '2024-08-20', 'enrolled'), (14, 4, '2024-08-20', 'enrolled'),
            (15, 4, '2024-08-20', 'enrolled'), (12, 5, '2024-08-20', 'enrolled'), (13, 5, '2024-08-20', 'enrolled'),
            (16, 5, '2024-08-20', 'enrolled')
        `);
        
        // Insert sample attendance records
        console.log('📊 Creating attendance records...');
        await db.query(`
            INSERT INTO attendance (studentId, classId, date, status, markedBy, notes) VALUES
            (5, 1, '2024-09-02', 'present', 2, 'Excellent participation'),
            (6, 1, '2024-09-02', 'present', 2, 'Good understanding'),
            (8, 1, '2024-09-02', 'late', 2, 'Arrived 15 minutes late'),
            (10, 1, '2024-09-02', 'present', 2, 'Attentive student'),
            (11, 1, '2024-09-02', 'present', 2, 'Asked good questions'),
            (13, 1, '2024-09-02', 'absent', 2, 'No excuse provided'),
            (16, 1, '2024-09-02', 'present', 2, 'On time'),
            (5, 1, '2024-09-25', 'present', 2, 'Active participation'),
            (6, 1, '2024-09-25', 'present', 2, 'Great work'),
            (8, 1, '2024-09-25', 'absent', 2, 'Called in sick'),
            (10, 1, '2024-09-25', 'present', 2, 'Good understanding'),
            (11, 1, '2024-09-25', 'present', 2, 'On time today'),
            (13, 1, '2024-09-25', 'present', 2, 'Focused student'),
            (16, 1, '2024-09-25', 'present', 2, 'Consistent'),
            (5, 2, '2024-09-03', 'present', 2, 'Good technical questions'),
            (7, 2, '2024-09-03', 'present', 2, 'Excellent understanding'),
            (9, 2, '2024-09-03', 'present', 2, 'Strong SQL skills'),
            (12, 2, '2024-09-03', 'late', 2, 'Previous lab ran over'),
            (15, 2, '2024-09-03', 'present', 2, 'Good focus')
        `);
        
        console.log('✅ Database seeding completed successfully!');
        console.log('📊 Created:');
        console.log('  - 16 users (1 admin, 3 teachers, 12 students)');
        console.log('  - 12 students with detailed information');
        console.log('  - 3 teachers with department information');
        console.log('  - 5 classes with schedules');
        console.log('  - 22 enrollments');
        console.log('  - 19 attendance records');
        console.log('');
        console.log('🔐 Login credentials (all use password: password123):');
        console.log('  Admin: admin@edutrack.com');
        console.log('  Teacher: dr.smith@university.edu');
        console.log('  Student: alex.johnson@student.edu');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        process.exit(0);
    }
}

seedDatabase();