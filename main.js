const http = require("http");
const fs = require('fs').promises;
const path = require('path');
const socketIo = require('socket.io');
const host = 'localhost';
const port = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
};

let users = {};  // To store connected users

const requestListener = function (req, res) {
    const filePath = req.url === '/' ? '/pages/index.html' : req.url;
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(__dirname + filePath)
        .then(contents => {
            res.setHeader("Content-Type", contentType);
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(404);
            res.end(`File not found: ${filePath}`);
        });
};

const server = http.createServer(requestListener);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle when a username is set
    socket.on('setUsername', (username) => {
        socket.username = username;
        users[socket.id] = username;
        console.log(`${username} joined the chat`);

        // Send updated user list to all clients
        io.emit('updateUserList', Object.values(users));
    });

    // Handle incoming messages
    socket.on('sendMessage', (message) => {
        io.emit('message', { username: socket.username, message });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log(`${socket.username} disconnected`);
        delete users[socket.id];

        // Send updated user list to all clients
        io.emit('updateUserList', Object.values(users));
    });
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
