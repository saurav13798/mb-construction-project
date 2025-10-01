# Admin Portal Setup Guide

## 🔐 Admin Registration & Login

### **Default Admin Account**

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@test.com`

### **Creating New Admin Accounts**

#### **Registration Code**

- **Current Registration Code**: `MB2024ADMIN`
- **Location**: Set in `backend/.env` as `ADMIN_REGISTRATION_CODE`
- **Security**: Change this code for production environments

#### **Registration Process**

1. Navigate to admin portal: `http://localhost:3000/admin.html`
2. Click "Need an account? Register here"
3. Fill in the registration form:
   - **Username**: Minimum 3 characters
   - **Email**: Valid email address
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Must match password
   - **Registration Code**: `MB2024ADMIN`
4. Click "Create Admin Account"
5. Upon success, you'll be redirected to login

#### **Login Process**

1. Navigate to admin portal: `http://localhost:3000/admin.html`
2. Enter your username and password
3. Click "Access Dashboard"

### **Setting Up First Admin (Development)**

If no admin exists, run the seeder:

```bash
# From project root
npm run db:seed

# Or from backend directory
node utils/test-seeder.js
```

### **Environment Configuration**

Required environment variables in `backend/.env`:

```env
# Admin Registration Code
ADMIN_REGISTRATION_CODE=MB2024ADMIN

# JWT Configuration
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRE=30d

# Database
MONGODB_URI=mongodb://localhost:27017/mb_construction
```

### **Security Notes**

#### **For Production:**

1. **Change Registration Code**: Update `ADMIN_REGISTRATION_CODE` in `.env`
2. **Secure JWT Secret**: Use a cryptographically secure random string
3. **Remove Default Admin**: Delete or change default admin credentials
4. **HTTPS Only**: Ensure admin portal is only accessible via HTTPS
5. **IP Restrictions**: Consider restricting admin access to specific IP ranges

#### **Password Requirements:**

- Minimum 6 characters
- Passwords are hashed using bcrypt with 12 rounds
- JWT tokens expire after 30 days (configurable)

### **Features**

#### **Admin Dashboard Includes:**

- 📊 Site visit analytics
- 📋 Service inquiry management
- ⚡ Quick statistics overview
- 🔧 System status monitoring
- 📨 Recent inquiries table
- 📥 Export functionality

#### **Registration Features:**

- ✅ Real-time password validation
- ✅ Password confirmation matching
- ✅ Form validation and error handling
- ✅ Success/error messaging
- ✅ Smooth transitions between login/register

### **Troubleshooting**

#### **Common Issues:**

1. **"Invalid registration code"**: Check `ADMIN_REGISTRATION_CODE` in `.env`
2. **"Username already taken"**: Choose a different username
3. **Database connection errors**: Ensure MongoDB is running
4. **JWT errors**: Check `JWT_SECRET` is set in `.env`

#### **Reset Admin Password:**

```bash
# From backend directory
node -e "
const Admin = require('./models/Admin');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await Admin.findOne({ username: 'admin' });
  if (admin) {
    admin.passwordHash = await Admin.hashPassword('newpassword123');
    await admin.save();
    console.log('Password updated');
  }
  mongoose.disconnect();
});
"
```

### **API Endpoints**

- `POST /api/admin/register` - Create new admin account
- `POST /api/admin/login` - Admin login
- `GET /api/admin/contacts` - Get contact analytics (requires auth)
- `GET /api/admin/visits` - Get visit analytics (requires auth)

### **File Structure**

```
frontend/public/
├── admin.html              # Admin portal page
├── admin-dashboard.js      # Admin functionality
└── style.css              # Includes admin styles

backend/
├── controllers/adminController.js  # Admin auth logic
├── models/Admin.js                # Admin user model
└── utils/test-seeder.js           # Creates default admin
```
