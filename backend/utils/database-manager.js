const mongoose = require('mongoose');

class DatabaseManager {
    constructor() {
        this.connectionStatus = {
            connected: false,
            connectionString: '',
            lastConnected: null,
            retryCount: 0,
            status: 'disconnected'
        };
        
        this.maxRetries = 5;
        this.baseRetryDelay = 1000; // 1 second
        this.maxRetryDelay = 30000; // 30 seconds
        
        this.setupEventHandlers();
    }

    async connect(uri, options = {}) {
        this.connectionStatus.connectionString = this.sanitizeUri(uri);
        this.connectionStatus.status = 'connecting';
        
        const defaultOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2, // Maintain minimum connections
            maxIdleTimeMS: 30000, // Close connections after 30s idle
            ...options
        };

        try {
            console.log('🔌 Attempting to connect to MongoDB...');
            await mongoose.connect(uri, defaultOptions);
            
            this.connectionStatus.connected = true;
            this.connectionStatus.lastConnected = new Date();
            this.connectionStatus.retryCount = 0;
            this.connectionStatus.status = 'connected';
            
            console.log('✅ Successfully connected to MongoDB');
            return true;
        } catch (error) {
            console.error('❌ MongoDB connection failed:', error.message);
            return this.handleConnectionError(error, uri, options);
        }
    }

    async handleConnectionError(error, uri, options) {
        this.connectionStatus.status = 'error';
        this.connectionStatus.retryCount++;
        
        if (this.connectionStatus.retryCount >= this.maxRetries) {
            console.error(`💥 Maximum retry attempts (${this.maxRetries}) reached. Giving up.`);
            throw new Error(`Database connection failed after ${this.maxRetries} attempts: ${error.message}`);
        }
        
        const delay = this.calculateRetryDelay(this.connectionStatus.retryCount);
        console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.connectionStatus.retryCount}/${this.maxRetries})`);
        
        await this.sleep(delay);
        return this.connect(uri, options);
    }

    calculateRetryDelay(retryCount) {
        // Exponential backoff with jitter
        const exponentialDelay = Math.min(
            this.baseRetryDelay * Math.pow(2, retryCount - 1),
            this.maxRetryDelay
        );
        
        // Add random jitter (±25%)
        const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
        return Math.floor(exponentialDelay + jitter);
    }

    async disconnect() {
        try {
            await mongoose.disconnect();
            this.connectionStatus.connected = false;
            this.connectionStatus.status = 'disconnected';
            console.log('🔌 Disconnected from MongoDB');
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error.message);
            throw error;
        }
    }

    isConnected() {
        return mongoose.connection.readyState === 1;
    }

    getConnectionStatus() {
        return {
            ...this.connectionStatus,
            mongooseState: this.getMongooseStateString(),
            readyState: mongoose.connection.readyState
        };
    }

    getMongooseStateString() {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        return states[mongoose.connection.readyState] || 'unknown';
    }

    setupEventHandlers() {
        mongoose.connection.on('connected', () => {
            console.log('🟢 Mongoose connected to MongoDB');
            this.connectionStatus.connected = true;
            this.connectionStatus.status = 'connected';
            this.connectionStatus.lastConnected = new Date();
        });

        mongoose.connection.on('error', (error) => {
            console.error('🔴 Mongoose connection error:', error.message);
            this.connectionStatus.status = 'error';
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🟡 Mongoose disconnected from MongoDB');
            this.connectionStatus.connected = false;
            this.connectionStatus.status = 'disconnected';
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🟢 Mongoose reconnected to MongoDB');
            this.connectionStatus.connected = true;
            this.connectionStatus.status = 'connected';
            this.connectionStatus.retryCount = 0;
        });

        // Handle application termination
        process.on('SIGINT', async () => {
            console.log('🛑 Received SIGINT. Gracefully closing MongoDB connection...');
            await this.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 Received SIGTERM. Gracefully closing MongoDB connection...');
            await this.disconnect();
            process.exit(0);
        });
    }

    sanitizeUri(uri) {
        // Remove password from URI for logging
        return uri.replace(/:([^:@]+)@/, ':***@');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Health check method
    async healthCheck() {
        try {
            if (!this.isConnected()) {
                return {
                    status: 'unhealthy',
                    message: 'Database not connected',
                    details: this.getConnectionStatus()
                };
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            
            return {
                status: 'healthy',
                message: 'Database connection is active',
                details: this.getConnectionStatus()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                message: 'Database ping failed',
                error: error.message,
                details: this.getConnectionStatus()
            };
        }
    }

    // Get database statistics
    async getStats() {
        try {
            if (!this.isConnected()) {
                throw new Error('Database not connected');
            }

            const stats = await mongoose.connection.db.stats();
            return {
                collections: stats.collections,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize
            };
        } catch (error) {
            console.error('❌ Error getting database stats:', error.message);
            throw error;
        }
    }
}

module.exports = new DatabaseManager();