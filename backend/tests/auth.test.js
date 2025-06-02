const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary
const User = require('../models/User'); // Adjust the path as necessary

describe('Auth API', () => {
    beforeAll(async () => {
        await User.deleteMany({});
    });

    // ...existing code...
test('User can sign up', async () => {
    const response = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'testuser', email: 'testuser@example.com', password: 'testpass' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
});

test('User can log in', async () => {
    await request(app)
        .post('/api/auth/signup')
        .send({ name: 'testuser2', email: 'testuser2@example.com', password: 'testpass' });

    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser2@example.com', password: 'testpass' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
});

test('Login fails with wrong password', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'testuser2@example.com', password: 'wrongpass' });
    expect(response.status).toBe(401);
});

test('Login fails with non-existent user', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'testpass' });
    expect(response.status).toBe(400);
});
// ...existing code...
});