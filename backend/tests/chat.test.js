const request = require('supertest');
const app = require('../app'); // Adjust the path as necessary
const mongoose = require('mongoose');
const Message = require('../models/Message'); // Adjust the path as necessary

describe('Chat functionality', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should send and receive messages in real-time', async () => {
        const response = await request(app)
            .post('/api/messages')
            .send({ senderId: 'user1', receiverId: 'user2', text: 'Hello!' });
        
        expect(response.status).toBe(200);
        expect(response.body.text).toBe('Hello!');
    });

    it('should store messages in MongoDB', async () => {
        const messages = await Message.find();
        expect(messages.length).toBeGreaterThan(0);
    });
});