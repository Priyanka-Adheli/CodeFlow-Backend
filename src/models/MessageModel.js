const mongoose = require('mongoose');
const {Schema} = mongoose;


const MessageSchema = Schema({
    role:{
        type:String,
        required:true,
    },
    text:{
        type:String,
        required:true,
    },
},{
    timestamps:true
});

module.exports = MessageSchema;