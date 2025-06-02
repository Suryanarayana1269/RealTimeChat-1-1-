const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Message = require('../models/Message');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

test('User can react to a message with an emoji', async () => {
    // Create a message first
    const message = await Message.create({ senderId: new mongoose.Types.ObjectId(), receiverId: new mongoose.Types.ObjectId(), text: 'Hello' });

    const response = await request(app)
        .post(`/api/messages/${message._id}/react`)
        .send({ emoji: '😊' })
        .expect(200);

    expect(response.body._id).toBe(message._id.toString());
    expect(response.body.reactions[0].emoji).toBe('😊');
});
test('Emoji reactions update live with Socket.IO', async () => {
	const socket = require('socket.io-client')('http://localhost:3000'); // Adjust the URL as necessary

	socket.on('reactionUpdated', (data) => {
		expect(data).toHaveProperty('messageId', '1');
		expect(data).toHaveProperty('emoji', '😊');
		socket.disconnect();
	});

	await request(app)
		.post('/api/messages/1/reactions')
		.send({ emoji: '😊' })
		.expect(200);
});