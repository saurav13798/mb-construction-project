# Admin Portal Setup Guide

## 🔐 Admin Registration & Login System

### **New Admin Registration**

**Registration URL**: `http://localhost:8080/admin-register.html`

**Registration Process**:
1. Open the registration page
2. Fill in the form:
   - **Username**: 3-50 characters (letters, numbers, hyphens, underscores only)
   - **Email**: Valid email address (optional)
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Must match password
   - **Registration Code**: `MB2024ADMIN`
3. Click "Create Admin Account"
4. Upon success, you'll be redirected to login

### **Admin Login**

**Login URL**: `http://localhost:8080/admin.html`

**Login Process**:
1. Enter your username and password
2. Click "Login"
3. Access the admin dashboard

### **Registration Code Security**

- **Current Code**: `MB2024ADMIN`
- **Location**: `backend/.env` as `ADMIN_REGISTRATION_CODE`
- **Production**: Change this code for production environments

### **Admin System Setup**

**Quick Setup**:
```bash
# Run the admin system setup
admin-system-setup.bat

# Or manually
node setup-admin-system.js
node test-admin-system.js
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

### **Admin Dashboard Features**

- 📊 **Analytics**: Contact counts, visit statistics, conversion metrics
- 📋 **Contact Management**: View, mark as read, delete contacts
- 📥 **Export**: CSV export of all contact data
- 🔄 **Real-time Updates**: Auto-refresh dashboard data every 30 seconds
- 📱 **Responsive Design**: Professional glass morphism UI
- 🔐 **Security**: JWT token verification and auto-logout

### **Registration System Features**

- ✅ **Real-time Validation**: Username, email, password validation
- ✅ **Security**: Registration code protection
- ✅ **User Experience**: Professional UI with loading states
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Accessibility**: Keyboard navigation and screen reader support

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
