const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const users = new Map();

io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    socket.on('user:join', (username) => {
        users.set(socket.id, { username, id: socket.id });
        io.emit('users:update', Array.from(users.values()));
    });

    socket.on('message:send', (message) => {
        const user = users.get(socket.id);
        if (user) {
            io.emit('message:receive', {
                text: message,
                user: user.username,
                id: Date.now(),
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        io.emit('users:update', Array.from(users.values()));
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
}); 