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
const MESSAGE_FILE = './messages.json'; // File to store messages

// Function to load messages from the file
async function loadMessages() {
    try {
        const data = await fs.readFile(MESSAGE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist or error reading, return an empty array
        return [];
    }
}

// Function to save a new message
async function saveMessage(message) {
    const messages = await loadMessages();
    messages.push(message);
    await fs.writeFile(MESSAGE_FILE, JSON.stringify(messages), 'utf8');
}

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

io.on('connection', async (socket) => {
    console.log('A user connected');

    // Send existing messages to the newly connected user
    const messages = await loadMessages();
    socket.emit('loadMessages', messages);

    // Handle when a username is set
    socket.on('setUsername', (username) => {
        socket.username = username;
        users[socket.id] = username;
        console.log(`${username} joined the chat`);

        // Send updated user list to all clients
        io.emit('updateUserList', Object.values(users));
    });

    // Handle incoming messages
    socket.on('sendMessage', async (message) => {
        const fullMessage = { username: socket.username, message };
        io.emit('message', fullMessage);

        // Save the message to the file
        await saveMessage(fullMessage);
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
