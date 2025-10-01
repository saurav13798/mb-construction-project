# MongoDB Setup Instructions

## Option 1: Install MongoDB Community Server

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install and start the MongoDB service
3. Verify installation: `mongod --version`

## Option 2: Use MongoDB Atlas (Cloud)

1. Create free account at: https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update MONGODB_URI in backend/.env with your Atlas connection string

## Option 3: Use Docker (if you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify MongoDB is Running

```bash
# Check if MongoDB is listening on port 27017
netstat -an | findstr 27017
```
