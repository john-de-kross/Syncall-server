const app = require('./app');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const server = http.createServer(app);
const userSocketMap = new Map();

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://syncall-video-call.vercel.app'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register username to socket ID
  socket.on('register', (username) => {
    if (username) {
      userSocketMap.set(username, socket.id);
      console.log(`Registered user: ${username} -> ${socket.id}`);
    } else {
      console.error('Invalid username received:', username);
    }
  });

  // Handle client joining a room
  socket.on('join-room', ({ roomId }) => {
    if (!roomId) {
      console.error('No roomId provided:', socket.id);
      socket.emit('error', { message: 'Room ID is required' });
      return;
    }

    socket.join(roomId);
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;
    const initiator = numClients <= 1; // First client is initiator

    console.log(`Socket ${socket.id} joined room ${roomId}, clients: ${numClients}, initiator: ${initiator}`);

    // Notify other clients in the room
    socket.to(roomId).emit('user-joined', { initiator: false });
    // Notify the joining client
    socket.emit('user-joined', { initiator });

    // Log room state for debugging
    console.log(`Room ${roomId} has ${numClients} clients`);
  });

  // Handle offer
  socket.on('offer', ({ offer, roomId }) => {
    if (!offer || !roomId) {
      console.error('Invalid offer or roomId:', { offer, roomId });
      socket.emit('error', { message: 'Invalid offer or roomId' });
      return;
    }
    console.log(`Relaying offer for room ${roomId}:`, offer);
    socket.to(roomId).emit('offer', { offer });
  });

  // Handle answer
  socket.on('answer', ({ answer, roomId }) => {
    if (!answer || !roomId) {
      console.error('Invalid answer or roomId:', { answer, roomId });
      socket.emit('error', { message: 'Invalid answer or roomId' });
      return;
    }
    console.log(`Relaying answer for room ${roomId}:`, answer);
    socket.to(roomId).emit('answer', { answer });
  });

  // Handle ICE candidate
  socket.on('ice-candidate', ({ candidate, roomId }) => {
    if (!candidate || !roomId) {
      console.error('Invalid candidate or roomId:', { candidate, roomId });
      socket.emit('error', { message: 'Invalid candidate or roomId' });
      return;
    }
    console.log(`Relaying ICE candidate for room ${roomId}:`, candidate);
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [username, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(username);
        console.log(`Removed user ${username} from userSocketMap`);
        // Notify rooms the user was in
        socket.rooms.forEach((roomId) => {
          if (roomId !== socket.id) { // Exclude the socket's own room
            socket.to(roomId).emit('user-left', { socketId: socket.id });
          }
        });
        break;
      }
    }
  });
});

app.set('io', io);
app.set('userSocketMap', userSocketMap);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

