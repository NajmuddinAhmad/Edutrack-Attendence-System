# EduTrack System Testing Guide

## 🚀 System Status
✅ **Server Running**: http://localhost:3000
✅ **Database**: Populated with comprehensive test data
✅ **Features**: Login, Attendance Marking, Student Management

## 🔐 Test Accounts

### Admin Account
- **Email**: `admin@edutrack.com`
- **Password**: `password123`
- **Access**: Full system admin (Add/Edit/Delete students, view all data)

### Teacher Account
- **Email**: `dr.smith@university.edu`
- **Password**: `password123`
- **Access**: Mark attendance, manage students in their classes

### Student Account
- **Email**: `alex.johnson@student.edu`
- **Password**: `password123`
- **Access**: View personal attendance, class schedules

## 🧪 Testing Steps

### 1. Test Login System
1. Go to http://localhost:3000
2. Click "Login" or go to http://localhost:3000/login
3. Try logging in with any of the accounts above
4. Verify role-based dashboard loads correctly

### 2. Test Teacher Attendance Marking
1. **Login as Teacher**: `dr.smith@university.edu`
2. **Navigate to Attendance**: Click "Attendance" in sidebar OR click "Mark Attendance" quick action button
3. **Select a Class**: You should see available classes (Data Structures, Database Systems, etc.)
4. **Mark Attendance**: 
   - Click on a class card
   - See student list with Present/Late/Absent buttons
   - Mark some students as present, some absent
   - Click "Save Attendance"
   - Should see success message

### 3. Test Admin Student Management
1. **Login as Admin**: `admin@edutrack.com`
2. **Navigate to Students**: Click "Students" in sidebar
3. **View Students**: Should see list of all students with details
4. **Add Student**: Click "Add Student" button
5. **Edit Student**: Click edit button next to any student
6. **Delete Student**: Click delete button (be careful!)

### 4. Test Student View
1. **Login as Student**: `alex.johnson@student.edu`
2. **View Attendance**: Click "My Attendance" in sidebar
3. **Should see**: Personal attendance records and statistics

## 🗄️ Database Data Available

### Students (12 total)
- Alex Johnson (STU001) - Sophomore, GPA 3.8
- Maya Rodriguez (STU002) - Junior, GPA 3.6
- Emma Smith (STU003) - Senior, GPA 3.9
- And 9 more students...

### Classes (5 total)
- CS201 Data Structures (Mon,Wed,Fri 09:00-10:30)
- CS301 Database Systems (Tue,Thu 14:00-15:30)
- CS401 Software Engineering (Mon,Wed 11:00-12:30)
- CS302 Computer Networks (Tue,Thu 10:00-11:30)
- CS203 Web Development (Mon,Wed,Fri 13:00-14:30)

### Teachers (3 total)
- Dr. Sarah Smith (dr.smith@university.edu)
- Prof. Michael Johnson (prof.johnson@university.edu)
- Prof. Emily Davis (prof.davis@university.edu)

## 🔧 Troubleshooting

### If Attendance Marking Doesn't Work:
1. Make sure you're logged in as a teacher
2. Check browser console for any errors (F12 → Console)
3. Verify the attendance navigation item is clicked
4. Try refreshing the page

### If Student Management Doesn't Work:
1. Make sure you're logged in as admin or teacher
2. Click "Students" in the sidebar
3. Check for any console errors
4. Try refreshing the page

### If Login Fails:
1. Verify you're using the exact credentials above
2. Check if server is running (should be at http://localhost:3000)
3. Check console for errors

## 🎯 Expected Results

### ✅ Working Features:
- Login with role-based dashboards
- Teacher attendance marking with database save
- Admin student management (CRUD operations)
- Student attendance viewing
- Real-time statistics and counts
- Navigation between different sections

### 📊 Database Operations:
- Attendance records saved to database
- Student information stored and retrieved
- Real-time updates reflected in UI
- Success/error messaging

## 🚨 If Something Doesn't Work

1. **Check Server**: Make sure http://localhost:3000 is accessible
2. **Check Console**: Press F12 → Console tab for any JavaScript errors
3. **Check Network**: F12 → Network tab to see if API calls are failing
4. **Try Different Browser**: Sometimes caching issues occur
5. **Restart Server**: Stop and start the backend server

The system should now be fully functional with all requested features working!