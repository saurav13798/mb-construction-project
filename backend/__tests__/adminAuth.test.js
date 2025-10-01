const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { seedTestAdmin } = require('../utils/test-seeder');
let app;

describe('Admin Auth', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'testsecretlongenoughforjwt';
    process.env.PORT = '0';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mbconstruction_test';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
    
    app = require('../server');
    
    // Wait for database connection and seed test admin
    await new Promise(resolve => setTimeout(resolve, 1000));
    await seedTestAdmin();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/admin/login returns token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe('string');
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.role).toBe('admin');
  });

  test('GET /api/admin/visits requires bearer token', async () => {
    const res = await request(app).get('/api/admin/visits');
    expect(res.status).toBe(401);
  });
});


