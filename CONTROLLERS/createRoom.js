const RoomCreator = require('../MODELS/userModel');
const AppError = require('../utilis/appError');
const GuestModel = require('../MODELS/guestModel');
const {nanoid} = require('nanoid');


exports.createRoom = async (req, res, next) => {
    try {
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');
        const { username } = req.body;
        if (!username) return next(new AppError('Username is required', 400));

        const roomId = nanoid(16);
        const room = await RoomCreator.create({ username: username, roomId: roomId});
        
        res.status(200).json({
            success: true,
            message: 'Room successfully created',
            data: {
                room
            }
        })

        const directToUser = userSocketMap.get(username);
        if (directToUser) {
            io.to(directToUser).emit('roomId', {
                roomId: roomId
            })
        }


    } catch (err) {
        next(err);
    }
    
}

exports.joinRoom = async (req, res, next) => {
    try {
        const { roomId, username } = req.body;
        if (!roomId && !username) return next(new AppError('Room ID is required', 400));
        if (username === '' || roomId === '') return next(new AppError('Username and Room ID cannot be empty', 400));
        const room = await RoomCreator.findOne({ roomId: roomId });
        if (!room) return next(new AppError('Room does not exist or it has expired', 404));

        const guest = await GuestModel.create({ username: username, roomId: room.roomId, });
        await RoomCreator.updateOne({ roomId: room.roomId }, { $inc: { participants: 1 } });

        res.status(200).json({
            success: true,
            message: 'Successfully joined the room',
            data: {
                guest
            }
        });

        
    } catch (err) {
        next(err);
    }
}

exports.getRoomDetails = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        if (!roomId) return next(new AppError('Room ID is required', 400));
        const room = await RoomCreator.findOne({ roomId: roomId });
        if (!room) return next(new AppError('Room does not exist or it has expired', 404));
        const guests = await GuestModel.find({roomId: roomId});

        res.status(200).json({
            success: true,
            message: 'ok',
            data: {
                host: room.username,
                guests,
                noParticipants: room.participants
            } 
        })

    } catch (err) {
        next(err);
    } 
}