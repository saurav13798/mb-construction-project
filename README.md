# MB Construction Website

A professional, responsive website for MB Construction company specializing in building redevelopment, government contract maintenance, and manpower supply services.

## 🏗️ Features

### Frontend
- **Responsive Design**: Mobile-first approach with seamless adaptation to all screen sizes
- **Modern UI/UX**: Clean, professional design with smooth animations and transitions
- **Single Page Application**: Smooth scrolling navigation between sections
- **Contact Form**: Integrated form with real-time validation and backend submission
- **Project Gallery**: Showcase of completed projects with high-quality images
- **Service Sections**: Detailed presentation of core business services
- **Performance Optimized**: Fast loading times with lazy loading and optimized assets

### Backend
- **RESTful API**: Built with Node.js and Express.js
- **MongoDB Integration**: Robust database for contact management and project storage
- **Security Features**: Rate limiting, CORS protection, input validation, and sanitization
- **File Upload Support**: Secure image and document upload functionality
- **Authentication**: JWT-based authentication for admin features
- **Email Integration**: Automated email notifications for contact form submissions

### Core Services Highlighted
1. **Building Redevelopment**: Complete renovation and modernization services
2. **Government Contract Maintenance**: Road and building maintenance for government projects
3. **Manpower Supply**: Skilled workforce from engineers to laborers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Community Edition)

### ⚡ **Super Easy Setup (Recommended)**

**First Time Setup:**
```bash
# Double-click or run:
setup.bat
```

**Alternative Setup Methods:**
```bash
# NPM script method
npm run setup

# Manual method
npm run install-all
npm run db:init
npm run db:seed
```

### 🎮 **Daily Usage**

**Start Full Application:**
```bash
# Interactive menu
start.bat  # optimized: detects deps, logs to logs/ folder
# Select option 1

# Or direct command
start.bat full
```

**Development Mode:**
```bash
# Backend only
start.bat backend

# Frontend only  
start.bat frontend

# Database operations
start.bat db
```

### 🌐 **Access Points**
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 🧾 Logs
- Backend logs: `logs/backend.log`
- Frontend logs: `logs/frontend.log`

## 📁 Project Structure

```
mb-construction-website/
├── frontend/
│   ├── public/
│   │   ├── index.html      # Main HTML file
│   │   ├── style.css       # Styles and responsive design
│   │   └── app.js          # Frontend JavaScript
│   └── package.json        # Frontend dependencies
├── backend/
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── uploads/            # File upload directory
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── Complete_Setup_Instructions.md  # Detailed setup guide
├── MongoDB_Windows_Setup.md       # MongoDB installation guide
├── test-project.js                 # Comprehensive test suite
├── verify-setup.js                 # Setup verification script
├── package.json                    # Root package configuration
└── README.md                       # This file
```

## 🧪 Testing & Verification

### Run API Tests (Backend)
```bash
cd backend
npm install
npm test
```

### Verify Project Setup
```bash
npm run verify
```

### Manual Testing
- Test contact form submission
- Verify mobile responsiveness
- Check API endpoints
- Validate input sanitization

## 📊 API Endpoints

### Public Endpoints
- `GET /health` - Health check
- `POST /api/contact` - Submit contact form
- `GET /api/projects` - Get public projects

### Admin Endpoints (Authentication Required)
- `GET /api/contact` - Get all contacts
- `PUT /api/contact/:id/status` - Update contact status
- `POST /api/contact/:id/notes` - Add internal notes
- `DELETE /api/contact/:id` - Delete contact

## 🛡️ Security Features

- **Input Validation**: Express-validator for all user inputs
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configured for specific origins
- **Helmet.js**: Security headers protection
- **File Upload Security**: Type and size restrictions
- **XSS Prevention**: Input sanitization
- **JWT Authentication**: Secure admin access

## 📱 Mobile Optimization

- **Responsive Grid System**: Adapts to all screen sizes
- **Touch-Friendly Interface**: Optimized for mobile interactions
- **Mobile Navigation**: Hamburger menu for small screens
- **Performance**: Optimized for mobile networks
- **Accessibility**: WCAG compliant design

## 🔧 Environment Configuration

### Development
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mb_construction
JWT_SECRET=your-development-secret
FRONTEND_URL=http://localhost:8080
```

### Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-uri
JWT_SECRET=your-super-secure-production-secret
FRONTEND_URL=https://yourdomain.com
```

## 📈 Performance Features

- **Image Lazy Loading**: Improved page load times
- **CSS Variables**: Efficient theming system
- **Modular JavaScript**: Clean, maintainable code
- **Database Indexing**: Optimized query performance
- **Browser Caching**: Static asset caching
- **Compression Ready**: Gzip compression configured

## 🚀 Deployment Options

### Traditional Hosting
1. Upload files to server
2. Install Node.js and MongoDB
3. Configure environment variables
4. Start with PM2 or similar process manager

### Cloud Deployment
- **Heroku**: Ready for Heroku deployment
- **DigitalOcean**: App Platform compatible
- **AWS**: EC2 or Elastic Beanstalk
- **Vercel**: Frontend deployment

### Docker (Optional)
```bash
docker-compose up -d
```

## 📞 Business Information

### Services Offered
1. **Building Redevelopment**
   - Complete renovation services
   - Modern design implementation
   - Structural improvements

2. **Government Contract Maintenance**
   - Road maintenance projects
   - Building maintenance contracts
   - Infrastructure development

3. **Manpower Supply**
   - Skilled engineers
   - Construction workers
   - Project management staff

### Contact Information
- **Email**: info@mbconstruction.com
- **Phone**: +91 98765 43210
- **Address**: Mumbai, Maharashtra, India

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   net start MongoDB  # Windows
   sudo systemctl start mongod  # Linux
   ```

2. **Port Already in Use**
   ```bash
   # Kill process using port 3000
   npx kill-port 3000
   ```

3. **Dependencies Issues**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Frontend Not Loading**
   - Clear browser cache
   - Check console for errors
   - Verify file paths

## 📚 Documentation

- **Complete_Setup_Instructions.md** - Detailed setup guide
- **MongoDB_Windows_Setup.md** - MongoDB installation for Windows
- **PROJECT_STATUS.md** - Current project status
- **FINAL_SUMMARY.md** - Project completion summary

## 🤝 Support

For technical support or business inquiries:
- Create an issue in the repository
- Contact via email: info@mbconstruction.com
- Phone support: +91 98765 43210

## 📄 License

This project is licensed under the ISC License.

---

**🎉 Your professional construction website is ready to help grow your business!**