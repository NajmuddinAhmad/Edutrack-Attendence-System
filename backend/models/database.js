const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'edutrack_db',
    charset: 'utf8mb4',
    timezone: '+00:00'
};

// Create connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Database utility functions
class Database {
    static async getConnection() {
        return await pool.getConnection();
    }

    static async query(sql, params = []) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    static async transaction(callback) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }

    static async closePool() {
        try {
            await pool.end();
            console.log('Database pool closed');
        } catch (error) {
            console.error('Error closing database pool:', error);
        }
    }

    // Common query methods
    static async findById(table, id, columns = '*') {
        const sql = `SELECT ${columns} FROM ${table} WHERE id = ? LIMIT 1`;
        const rows = await this.query(sql, [id]);
        return rows[0] || null;
    }

    static async findOne(table, conditions = {}, columns = '*') {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        
        if (keys.length === 0) {
            const sql = `SELECT ${columns} FROM ${table} LIMIT 1`;
            const rows = await this.query(sql);
            return rows[0] || null;
        }
        
        const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
        const sql = `SELECT ${columns} FROM ${table} WHERE ${whereClause} LIMIT 1`;
        const rows = await this.query(sql, values);
        return rows[0] || null;
    }

    static async findMany(table, conditions = {}, options = {}) {
        const {
            columns = '*',
            orderBy = 'id',
            order = 'ASC',
            limit,
            offset = 0
        } = options;

        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        
        let sql = `SELECT ${columns} FROM ${table}`;
        
        if (keys.length > 0) {
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }
        
        sql += ` ORDER BY ${orderBy} ${order}`;
        
        if (limit) {
            sql += ` LIMIT ${limit} OFFSET ${offset}`;
        }
        
        return await this.query(sql, values);
    }

    static async create(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await this.query(sql, values);
        
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        };
    }

    static async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
        
        const result = await this.query(sql, [...values, id]);
        return result.affectedRows > 0;
    }

    static async delete(table, id) {
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        const result = await this.query(sql, [id]);
        return result.affectedRows > 0;
    }

    static async count(table, conditions = {}) {
        const keys = Object.keys(conditions);
        const values = Object.values(conditions);
        
        let sql = `SELECT COUNT(*) as count FROM ${table}`;
        
        if (keys.length > 0) {
            const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }
        
        const rows = await this.query(sql, values);
        return rows[0].count;
    }

    // Specialized methods for attendance system
    static async getStudentAttendance(studentId, classId = null, startDate = null, endDate = null) {
        let sql = `
            SELECT 
                a.*,
                cs.session_date,
                cs.start_time,
                cs.end_time,
                c.class_code,
                co.course_name
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.id
            JOIN classes c ON cs.class_id = c.id
            JOIN courses co ON c.course_id = co.id
            WHERE a.student_id = ?
        `;
        
        const params = [studentId];
        
        if (classId) {
            sql += ' AND c.id = ?';
            params.push(classId);
        }
        
        if (startDate) {
            sql += ' AND cs.session_date >= ?';
            params.push(startDate);
        }
        
        if (endDate) {
            sql += ' AND cs.session_date <= ?';
            params.push(endDate);
        }
        
        sql += ' ORDER BY cs.session_date DESC, cs.start_time DESC';
        
        return await this.query(sql, params);
    }

    static async getClassAttendance(classId, sessionDate = null) {
        let sql = `
            SELECT 
                a.*,
                s.student_id,
                u.first_name,
                u.last_name,
                cs.session_date,
                cs.start_time,
                cs.topic
            FROM class_sessions cs
            LEFT JOIN attendance a ON cs.id = a.session_id
            LEFT JOIN students s ON a.student_id = s.id
            LEFT JOIN users u ON s.user_id = u.id
            WHERE cs.class_id = ?
        `;
        
        const params = [classId];
        
        if (sessionDate) {
            sql += ' AND cs.session_date = ?';
            params.push(sessionDate);
        }
        
        sql += ' ORDER BY cs.session_date DESC, u.last_name, u.first_name';
        
        return await this.query(sql, params);
    }

    static async getAttendanceStats(classId = null, startDate = null, endDate = null) {
        let sql = `
            SELECT 
                COUNT(*) as total_records,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as excused_count,
                ROUND(
                    (SUM(CASE WHEN a.status IN ('present', 'late') THEN 1 ELSE 0 END) * 100.0) / 
                    NULLIF(COUNT(*), 0), 2
                ) as attendance_rate
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.id
        `;
        
        const params = [];
        const conditions = [];
        
        if (classId) {
            conditions.push('cs.class_id = ?');
            params.push(classId);
        }
        
        if (startDate) {
            conditions.push('cs.session_date >= ?');
            params.push(startDate);
        }
        
        if (endDate) {
            conditions.push('cs.session_date <= ?');
            params.push(endDate);
        }
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        const rows = await this.query(sql, params);
        return rows[0];
    }

    // Audit logging
    static async logAction(userId, action, tableName, recordId, oldValues = null, newValues = null, ipAddress = null) {
        const data = {
            user_id: userId,
            action,
            table_name: tableName,
            record_id: recordId,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            ip_address: ipAddress
        };
        
        return await this.create('audit_logs', data);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await Database.closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await Database.closePool();
    process.exit(0);
});

module.exports = Database;