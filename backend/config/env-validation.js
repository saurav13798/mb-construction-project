function validateEnvironment() {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRE',
    'FRONTEND_URL'
  ];

  const optionalEnvVars = [
    'EMAIL_HOST',
    'EMAIL_PORT', 
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
    'ADMIN_EMAIL',
    'ADMIN_REGISTRATION_CODE',
    'MAX_FILE_SIZE',
    'BCRYPT_ROUNDS',
    'SESSION_SECRET',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'UPLOAD_PATH'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate specific environment variables
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ PORT must be a valid number between 1 and 65535');
    process.exit(1);
  }

  const nodeEnv = process.env.NODE_ENV;
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    console.error('❌ NODE_ENV must be one of: development, production, test');
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.error('❌ MONGODB_URI must be a valid MongoDB connection string');
    process.exit(1);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    console.warn('⚠️ JWT_SECRET should be at least 32 characters long for better security');
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    console.error('❌ FRONTEND_URL must be a valid HTTP/HTTPS URL');
    process.exit(1);
  }

  // Validate optional numeric environment variables
  if (process.env.EMAIL_PORT) {
    const emailPort = parseInt(process.env.EMAIL_PORT, 10);
    if (isNaN(emailPort) || emailPort < 1 || emailPort > 65535) {
      console.error('❌ EMAIL_PORT must be a valid number between 1 and 65535');
      process.exit(1);
    }
  }

  if (process.env.MAX_FILE_SIZE) {
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10);
    if (isNaN(maxFileSize) || maxFileSize < 1) {
      console.error('❌ MAX_FILE_SIZE must be a positive number');
      process.exit(1);
    }
  }

  console.log('✅ Environment variables validated successfully');

  // Log configuration summary
  console.log('\n📋 Configuration Summary:');
  console.log(`   Port: ${port}`);
  console.log(`   Environment: ${nodeEnv}`);
  console.log(`   Database: ${mongoUri.replace(/\/\/.*@/, '//[credentials]@')}`);
  console.log(`   Frontend URL: ${frontendUrl}`);
  console.log(`   JWT configured: ✅`);
  console.log(`   Email configured: ${process.env.EMAIL_HOST ? '✅' : '❌'}`);
}

module.exports = { validateEnvironment };
