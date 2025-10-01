const request = require('supertest');
const jwt = require('jsonwebtoken');
let app;

describe('Admin Auth', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'testsecretlongenoughforjwt';
    app = require('../server');
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


