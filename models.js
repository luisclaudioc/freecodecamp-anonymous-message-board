const mongoose = require('mongoose');
const { Schema } = mongoose;

const replySchema = new Schema({
    text: String,
    created_on: Date,
    delete_password: String,
    reported: { type: Boolean, default: false },
});
const Reply = mongoose.model('Reply', replySchema);

const threadSchema = new Schema({
    text: String,
    created_on: Date, 
    bumped_on: Date,
    reported: { type: Boolean, default: false },
    delete_password: String,
    replies: [replySchema],
});
const Thread = mongoose.model('Thread', threadSchema);

const boardSchema = new Schema({
    board: String,
    threads: [threadSchema],
});
const Board = mongoose.model('Board', boardSchema);

exports.Reply = Reply;
exports.Thread = Thread;
exports.Board = Board; 
