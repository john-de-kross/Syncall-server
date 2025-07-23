const express = require('express');

const router = express.Router();
const { createRoom, joinRoom, getRoomDetails } = require('../CONTROLLERS/createRoom');

router.post('/create-room', createRoom);
router.post('/join-room', joinRoom);
router.get('/get-room/:roomId', getRoomDetails)



module.exports = router;