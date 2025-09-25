# MongoDB Installation Guide for Windows

## 📥 Download and Install MongoDB

### Step 1: Download MongoDB Community Server
1. Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select:
   - **Version**: Latest (7.0 or higher)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **Important**: Check "Install MongoDB as a Service"
4. **Important**: Check "Install MongoDB Compass" (GUI tool)
5. Complete the installation

### Step 3: Verify Installation
1. Open Command Prompt as Administrator
2. Run: `mongod --version`
3. You should see MongoDB version information

## 🚀 Start MongoDB Service

### Method 1: Windows Services
1. Press `Win + R`, type `services.msc`
2. Find "MongoDB Server"
3. Right-click → Start

### Method 2: Command Line
```bash
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB
```

### Method 3: Automatic Start
MongoDB should start automatically if installed as a service.

## 🔧 Configuration

### Default Settings
- **Port**: 27017
- **Data Directory**: `C:\Program Files\MongoDB\Server\7.0\data`
- **Log Directory**: `C:\Program Files\MongoDB\Server\7.0\log`
- **Config File**: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg`

### Custom Configuration (Optional)
Create a custom config file `mongod.conf`:
```yaml
storage:
  dbPath: C:\data\db
systemLog:
  destination: file
  path: C:\data\log\mongod.log
net:
  port: 27017
  bindIp: 127.0.0.1
```

## 🛠️ MongoDB Compass (GUI)

### Access MongoDB Compass
1. Open MongoDB Compass from Start Menu
2. Connect to: `mongodb://localhost:27017`
3. You can now view and manage your databases visually

### Create MB Construction Database
1. In Compass, click "Create Database"
2. Database Name: `mb_construction`
3. Collection Name: `contacts`
4. Click "Create Database"

## 📊 Verify Setup with Project

### Test Connection
1. Start MongoDB service
2. Run the backend server: `cd backend && npm run dev`
3. Check console for: "✅ Connected to MongoDB"

### Seed Sample Data
```bash
cd backend
node utils/database_seeder.js
```

### View Data in Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `mb_construction` database
4. You should see `contacts`, `projects`, and `services` collections

## 🔍 Troubleshooting

### Common Issues

#### 1. "MongoDB service won't start"
```bash
# Check if port 27017 is in use
netstat -an | findstr :27017

# If in use, kill the process or change MongoDB port
```

#### 2. "Access Denied" Error
- Run Command Prompt as Administrator
- Ensure MongoDB service has proper permissions

#### 3. "Data directory not found"
```bash
# Create data directory
mkdir C:\data\db
```

#### 4. "Connection refused"
- Verify MongoDB service is running
- Check firewall settings
- Ensure correct port (27017)

### Useful Commands
```bash
# Check MongoDB status
sc query MongoDB

# View MongoDB logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"

# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use MB Construction database
use mb_construction

# Show collections
show collections

# View contacts
db.contacts.find()
```

## 🔐 Security (Production)

### Enable Authentication (Optional)
1. Create admin user:
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "your-secure-password",
  roles: ["userAdminAnyDatabase"]
})
```

2. Update connection string:
```
mongodb://admin:your-secure-password@localhost:27017/mb_construction
```

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)
- [MongoDB Windows Service](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/#run-mongodb-community-edition-as-a-windows-service)

---

**✅ MongoDB Setup Complete!**

Your MongoDB is now ready for the MB Construction website. The database will automatically create collections when you first run the application and submit data through the contact form.