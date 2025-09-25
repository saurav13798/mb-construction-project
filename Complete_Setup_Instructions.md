# MB Construction Website - Complete Setup Guide

## 📁 STEP 1: Create Project Folder Structure

Create the following folders and files on your computer:

```
mb-construction-project/
├── frontend/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   ├── images/
│   │   └── uploads/
│   └── package.json
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   │   ├── projects/
│   │   ├── documents/
│   │   └── general/
│   └── package.json
├── .env
├── .env.example
├── .gitignore
├── README.md
└── docker-compose.yml (optional)
```

## 📝 STEP 2: Frontend Files

### 2.1 Create `frontend/public/index.html`

[Content from the generated website - HTML file]

### 2.2 Create `frontend/public/css/style.css`

[Content from the generated website - CSS file]

### 2.3 Create `frontend/public/js/app.js`

[Content from the generated website - JavaScript file]

### 2.4 Create `frontend/package.json`

```json
{
  "name": "mb-construction-frontend",
  "version": "1.0.0",
  "description": "Frontend for MB Construction website",
  "main": "index.html",
  "scripts": {
    "start": "live-server public",
    "build": "echo \"Frontend build complete\"",
    "dev": "live-server public --port=8080"
  },
  "devDependencies": {
    "live-server": "^1.2.2"
  },
  "keywords": ["construction", "website", "frontend"],
  "author": "MB Construction",
  "license": "ISC"
}
```

## 🔧 STEP 3: Backend Files

### 3.1 Backend Package.json

Create `backend/package.json` and copy the content from the generated file.

### 3.2 Main Server File

Create `backend/server.js` and copy the content from the generated file.

### 3.3 Database Configuration

Create `backend/config/database.js` and copy the content from the generated file.

### 3.4 Models

Create these files in `backend/models/`:

- `Contact.js` - Copy content from generated Contact model
- `Project.js` - Copy content from generated Project model
- `Service.js` - Copy content from generated Service model

### 3.5 Controllers

Create these files in `backend/controllers/`:

- `contactController.js` - Copy content from generated file
- `projectController.js` - Copy content from generated file

### 3.6 Routes

Create these files in `backend/routes/`:

- `contact.js` - Copy content from generated contact routes
- `projects.js` - Copy content from generated project routes
- `api.js` - Copy content from generated API routes

### 3.7 Middleware

Create these files in `backend/middleware/`:

- `auth.js` - Copy content from generated auth middleware
- `validation.js` - Copy content from generated validation middleware
- `upload.js` - Copy content from generated upload middleware
- `errorHandler.js` - Copy content from generated error middleware

### 3.8 Utilities

Create these files in `backend/utils/`:

- `email.js` - Copy content from generated email utility
- `seeder.js` - Copy content from generated database seeder

## 🔑 STEP 4: Environment Configuration

### 4.1 Create `.env` file (root directory)

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mb_construction

# JWT Configuration
JWT_SECRET=mb-construction-super-secret-key-2024
JWT_EXPIRE=30d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="MB Construction" <noreply@mbconstruction.com>
ADMIN_EMAIL=admin@mbconstruction.com

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp,pdf,doc,docx
```

### 4.2 Create `.gitignore` file (root directory)

```
# Dependencies
node_modules/
npm-debug.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# Uploads
uploads/
*.log

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# MongoDB
*.db
data/
```

## 🚀 STEP 5: Installation & Setup

### 5.1 Install Backend Dependencies

```bash
cd backend
npm install
```

### 5.2 Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5.3 Setup MongoDB

Make sure MongoDB is installed and running:

```bash
# Start MongoDB service (Linux/Mac)
sudo systemctl start mongod

# Or start MongoDB (Windows)
net start MongoDB
```

### 5.4 Seed Sample Data (Optional)

```bash
cd backend
node utils/seeder.js
```

## ▶️ STEP 6: Run the Application

### Option 1: Quick Start (Windows)

```bash
# Double-click start.bat file or run:
start.bat
```

### Option 2: Using Root Package.json

```bash
# Install all dependencies
npm run install-all

# Start both servers
npm start
```

### Option 3: Manual Start

**Terminal 1 - Backend Server:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend Server:**

```bash
cd frontend
npm start
```

## 🌐 STEP 7: Access the Website

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 📧 STEP 8: Email Configuration (Optional)

To enable email notifications:

1. Create a Gmail App Password:

   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

2. Update `.env` file:
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

## 🗄️ STEP 9: Database Collections

Your MongoDB will have these collections:

- `contacts` - Contact form submissions
- `projects` - Project portfolio
- `services` - Service offerings

## 📊 STEP 10: API Endpoints

### Contact API:

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (admin)

### Projects API:

- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects
- `POST /api/projects` - Create project (admin)

### General API:

- `GET /api/stats` - Get dashboard statistics
- `GET /api/search` - Search functionality

## 🛡️ Security Features

✅ Input validation and sanitization
✅ Rate limiting
✅ CORS protection
✅ Helmet.js security headers
✅ File upload restrictions
✅ MongoDB injection prevention

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**:

   ```bash
   sudo systemctl status mongod
   sudo systemctl start mongod
   ```

2. **Port Already in Use**:

   ```bash
   lsof -ti:3000
   kill -9 [PID]
   ```

3. **Email Not Sending**:

   - Check Gmail app password
   - Verify SMTP settings
   - Check firewall/antivirus

4. **Frontend Not Loading**:
   - Clear browser cache
   - Check console for errors
   - Verify file paths

This setup provides you with a complete, production-ready website with MongoDB backend!
