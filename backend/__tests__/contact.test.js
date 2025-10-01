const request = require('supertest');
let app;

describe('Contact API', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'testsecretlongenoughforjwt';
    process.env.PORT = '0';
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mbconstruction_test';
    process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
    app = require('../server');
  });

  test('POST /api/contact validates payload', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});


