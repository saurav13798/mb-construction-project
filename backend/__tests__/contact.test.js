const request = require('supertest');
const mongoose = require('mongoose');
let app;

describe('Contact API', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'testsecretlongenoughforjwt';
    process.env.PORT = '0';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mbconstruction_test';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
    
    app = require('../server');
    
    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('POST /api/contact validates payload', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});


