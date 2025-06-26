// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const GAME_STATES = [
    "Pre-show",
    "Show Start",
    "Pillar 1",
    "Playback 1",
    "Pillar 2",
    "Playback 2",
    "Pillar 3",
    "Playback 3.5",
    "Pillar 4",
    "Playback 3",
    "Playback 4",
    "End Show"
];

let currentState = GAME_STATES[0];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

io.on('connection', (socket) => {
    console.log('⚡ A user connected:', socket.id);

    // Send current state to new connection
    socket.emit('sceneChange', currentState);

    // Receive a state change from frontend and broadcast to all
    socket.on('changeScene', (newState) => {
        if (GAME_STATES.includes(newState)) {
            currentState = newState;
            console.log(`🔁 State changed to: ${newState}`);
            io.emit('sceneChange', newState);
        } else {
            console.warn('⚠️ Invalid state received:', newState);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});