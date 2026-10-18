const request = require('supertest');
const app = require('../src/index');

describe('Order Service Tests', () => {
  test('GET /health returns 200 and valid status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('order-service');
    expect(res.body.runtime).toContain('Node.js');
  });

  test('POST /orders returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/orders')
      .send({ itemId: 'ITEM-101' }); // missing quantity, amount, customerId

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Missing required fields');
  });
});
