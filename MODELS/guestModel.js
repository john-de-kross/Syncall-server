const mongoose = require('mongoose');


const GuestSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 3,
        unique: true,
        required: true,
        
    },
    roomId: {
        type: String,
        ref: 'RoomCreator',
        required: true,  

    },
    
    joinedAt: {
        type: Date,
        default: Date.now,
        expires: '1h' // Document will be removed after 1 hour
    }
})

const GuestModel = mongoose.model('Guest', GuestSchema);
module.exports = GuestModel;