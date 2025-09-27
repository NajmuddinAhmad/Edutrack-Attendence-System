# EduTrack - Student Attendance Management System

A complete, modern web-based student attendance management system designed for educational institutions. The system provides real-time attendance tracking, analytics, and comprehensive reporting features.

## 🚀 Features

### Frontend
- **Modern Dashboard**: Real-time statistics and interactive charts
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Student Management**: Add, edit, and manage student records
- **Class Management**: Schedule classes and track attendance
- **Analytics**: Detailed attendance reports and trends
- **User-Friendly Interface**: Intuitive navigation with collapsible sidebar

### Backend
- **RESTful API**: Complete REST API with proper error handling
- **Authentication**: Secure user authentication and authorization
- **Database Integration**: MySQL database with comprehensive schema
- **Real-time Updates**: Mock real-time data updates
- **Scalable Architecture**: Modular design for easy maintenance

### Database
- **Comprehensive Schema**: Well-designed database structure
- **Data Integrity**: Foreign key relationships and constraints
- **Performance Optimized**: Proper indexing and views
- **Audit Trails**: Complete logging of all system activities

## 📁 Project Structure

```
SIH PROJECT/
├── frontend/
│   ├── index.html              # Main application page
│   ├── css/
│   │   └── styles.css          # Custom styles and animations
│   ├── js/
│   │   ├── main.js             # Core application logic
│   │   ├── api.js              # API integration functions
│   │   ├── dashboard.js        # Dashboard functionality
│   │   ├── modals.js           # Modal dialogs and forms
│   │   └── pages.js            # Page navigation and content
│   └── README.md               # Frontend documentation
├── backend/
│   ├── server.js               # Express server setup
│   ├── package.json            # Node.js dependencies
│   ├── .env.example            # Environment variables template
│   ├── routes/
│   │   ├── dashboard.js        # Dashboard API endpoints
│   │   ├── students.js         # Student management APIs
│   │   ├── classes.js          # Class management APIs
│   │   ├── attendance.js       # Attendance tracking APIs
│   │   └── analytics.js        # Analytics and reporting APIs
│   ├── models/
│   │   └── database.js         # Database connection and utilities
│   └── controllers/            # (Ready for expansion)
└── database/
    ├── schema.sql              # Complete database schema
    ├── seed.sql                # Sample data for testing
    └── README.md               # Database documentation
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with custom properties and animations
- **JavaScript (ES6+)**: Interactive functionality and DOM manipulation
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database management system
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing and security

### Development Tools
- **Git**: Version control system
- **npm**: Package manager
- **dotenv**: Environment variable management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Git
- A modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "SIH PROJECT"
   ```

2. **Set up the database**
   ```bash
   # Create MySQL database
   mysql -u root -p < database/schema.sql
   
   # Insert sample data (optional)
   mysql -u root -p < database/seed.sql
   ```

3. **Configure the backend**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Copy environment configuration
   cp .env.example .env
   
   # Edit .env file with your database credentials
   nano .env
   ```

4. **Start the application**
   ```bash
   # Start the backend server
   npm run dev
   
   # The application will be available at http://localhost:3000
   ```

### Environment Configuration

Edit the `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=edutrack_db
DB_USER=root
DB_PASSWORD=your_password

# Application Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your_secret_key
```

## 📊 Database Schema

The system uses a comprehensive MySQL database with the following main tables:

- **users**: System users (students, teachers, admins)
- **students**: Student-specific information
- **teachers**: Teacher-specific information
- **departments**: Academic departments
- **courses**: Course catalog
- **classes**: Class instances
- **class_sessions**: Individual class meetings
- **attendance**: Attendance records
- **notifications**: System notifications
- **audit_logs**: System activity logs

## 🔗 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/trends` - Get weekly attendance trends

### Students
- `GET /api/students` - Get all students (with pagination)
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get single class
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance record

### Analytics
- `GET /api/analytics` - Get general analytics
- `GET /api/analytics/student/:id` - Get student analytics
- `GET /api/analytics/class/:id` - Get class analytics

## 🎨 Frontend Features

### Dashboard
- Real-time attendance statistics
- Interactive charts and graphs
- Recent activity feed
- Quick action buttons
- Weekly attendance trends

### Student Management
- Comprehensive student database
- Advanced search and filtering
- Bulk operations support
- Attendance history tracking

### Class Management
- Class scheduling system
- Attendance marking interface
- Session management
- Real-time updates

### Analytics
- Detailed attendance reports
- Performance metrics
- Trend analysis
- Export capabilities

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- SQL injection prevention
- XSS protection
- CORS configuration
- Input validation
- Audit logging

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🧪 Testing

### Sample Data
The system includes comprehensive sample data for testing:
- 5 users (1 admin, 3 teachers, 5 students)
- Multiple departments and courses
- Class schedules and attendance records
- Realistic attendance patterns

### Test Credentials
- **Admin**: admin@edutrack.com / password123
- **Teacher**: dr.smith@university.edu / password123
- **Student**: alex.johnson@student.edu / password123

## 🔧 Development

### Adding New Features
1. **Frontend**: Add new pages in `js/pages.js` and update navigation
2. **Backend**: Create new routes in the `routes/` directory
3. **Database**: Add new tables or modify existing schema

### Code Structure
- Follow MVC architecture pattern
- Use async/await for database operations
- Implement proper error handling
- Add JSDoc comments for functions
- Follow consistent naming conventions

## 📈 Performance Optimization

- Database query optimization with indexes
- Connection pooling for database
- Efficient DOM manipulation
- Lazy loading of content
- Caching of frequently accessed data
- Minimized external dependencies

## 🔄 Future Enhancements

### Planned Features
- [ ] Real-time WebSocket integration
- [ ] Mobile app development
- [ ] Biometric attendance
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline support
- [ ] API documentation with Swagger
- [ ] Unit testing implementation

### Scalability Improvements
- [ ] Microservices architecture
- [ ] Redis caching
- [ ] Load balancing
- [ ] Database sharding
- [ ] CDN integration

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on port 3000

3. **Module Not Found**
   - Run `npm install` in backend directory
   - Check Node.js version compatibility

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Frontend Development**: Modern responsive UI/UX
- **Backend Development**: RESTful API and database design
- **Database Design**: Comprehensive schema and optimization
- **Project Management**: Overall architecture and coordination

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

## 🙏 Acknowledgments

- Thanks to all team members for their contributions
- Educational institutions for requirements gathering
- Open source community for tools and libraries

---

**EduTrack** - Making attendance management simple and efficient for educational institutions worldwide.