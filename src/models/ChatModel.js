const mongoose = require('mongoose');
const MessageSchema = require('./MessageModel');
const {Schema} = mongoose;


const ChatMessageSchema = Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    chatMessages:[{
        title:{
            type:String,
        },
        topic:{
            type:String,
            required:true
        },
        messages:[MessageSchema],
}]
},{
    timestamps:true
});

const ChatData = mongoose.model('ChatData',ChatMessageSchema);
module.exports = ChatData;