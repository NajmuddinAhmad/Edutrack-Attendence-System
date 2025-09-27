-- Simplified EduTrack Database Schema
-- Compatible with the API routes

USE edutrack_db;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;

-- Users table (for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE NOT NULL,
    studentId VARCHAR(20) UNIQUE NOT NULL,
    enrollmentDate DATE NOT NULL,
    semester VARCHAR(20) NOT NULL,
    year VARCHAR(20) NOT NULL,
    gpa DECIMAL(3,2),
    phone VARCHAR(20),
    address TEXT,
    emergencyContact TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Teachers table
CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT UNIQUE NOT NULL,
    employeeId VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(100),
    hireDate DATE,
    phone VARCHAR(20),
    office VARCHAR(100),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Classes table
CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    section VARCHAR(10),
    description TEXT,
    credits INT DEFAULT 3,
    capacity INT DEFAULT 30,
    teacherId INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    schedule VARCHAR(100),
    room VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- Enrollments table
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    classId INT NOT NULL,
    enrollmentDate DATE NOT NULL,
    status ENUM('enrolled', 'dropped', 'completed') DEFAULT 'enrolled',
    grade VARCHAR(2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (studentId, classId),
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    classId INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    markedBy INT NOT NULL,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (studentId, classId, date),
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (markedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON students(userId);
CREATE INDEX idx_teachers_user_id ON teachers(userId);
CREATE INDEX idx_classes_teacher_id ON classes(teacherId);
CREATE INDEX idx_enrollments_student_id ON enrollments(studentId);
CREATE INDEX idx_enrollments_class_id ON enrollments(classId);
CREATE INDEX idx_attendance_student_id ON attendance(studentId);
CREATE INDEX idx_attendance_class_id ON attendance(classId);
CREATE INDEX idx_attendance_date ON attendance(date);