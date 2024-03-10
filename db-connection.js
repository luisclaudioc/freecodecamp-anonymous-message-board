const mongoose = require('mongoose');
const board = mongoose.connect(process.env.MONGO_URI);

module.exports = board;
