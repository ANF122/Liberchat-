const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const { reportUser, checkIpBlock } = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost/liberchat', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('public'));
app.use(express.json());
app.post('/report', reportUser);

io.use(async (socket, next) => {
    const ip = socket.handshake.address;
    if (await checkIpBlock(ip)) {
        return next(new Error('IP bloquée'));
    }
    next();
});

io.on('connection', (socket) => {
    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('peer-signal', (data) => {
        socket.broadcast.emit('peer-signal', data);
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
