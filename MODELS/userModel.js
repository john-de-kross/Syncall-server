const mongoose = require('mongoose');


const RoomCreatorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
    },
    roomId: {
        type: String,
        required: true,
        unique: true
    },
    participants: {
        type: Number,
        default: 0
    },
    
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h' // Document will be removed after 1 hour
    }

})

const RoomCreator = mongoose.model('RoomCreator', RoomCreatorSchema);
module.exports = RoomCreator;