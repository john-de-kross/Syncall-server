const app = require('./app');
const mongoose = require('mongoose');
const {Server} = require('socket.io');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const server = http.createServer(app);
const userSocketMap = new Map()
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        console.log('Database connection successful')

    }).catch((err) => {
        console.error('Database connection error:', err);
    })
const io = new Server(server, {
    cors: {
    origin: ['http://localhost:5173', 'https://syncall-video-call.vercel.app'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
})

io.on('connect', (socket) => {
    console.log('user connected', socket.id);
    socket.on('register', (username) => {
        userSocketMap.set(username, socket.id);
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
        for (const [key, value] of userSocketMap.entries()) {
            if (value === socket.id) {
                userSocketMap.delete(key);
                break;
            }
        }
    });
    
    socket.on("join-room", ({ roomId }) => {
        socket.join(roomId);
        const clients = io.sockets.adapter.rooms.get(roomId);
        const initiator = !clients || clients.size === 1;
       
        socket.to(roomId).emit("user-joined", { initiator: false });
        socket.emit("user-joined", { initiator })
        console.log(`${socket.id} is joining room ${roomId}`)
        console.log("clients in room", clients?.size)
    });

    socket.on('offer', ({ offer, roomId }) => {
        socket.to(roomId).emit('offer', { offer })
        console.log(offer, roomId)
    });

    socket.on('answer', ({ answer, roomId }) => {
        socket.to(roomId).emit("answer", { answer })
        console.log('answer:', roomId)

    });

    socket.on("ice-candidate", ({ candidate, roomId }) => {
        socket.to(roomId).emit("ice-candidate", { candidate })
        console.log("candidate: ", roomId)
    });
});

app.set('io', io);
app.set('userSocketMap', userSocketMap);



const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

