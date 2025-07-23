const mongoose = require('mongoose');
const {Schema} = mongoose;

const submissionSchema = new Schema({
    user_id:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:'problem',
        required:true
    },
    code:{
        type:String,
        required:true
    },
    language:{
        type:String,
        required:true,
        enum:["C++","Java","JavaScript"],
    },
    status:{
        type:String,
        enum: ['Accepted','Pending','Wrong Answer','Runtime Error'],
        default:'Pending'
    },
    runtime:{ //Miliseconds
         type:Number,
        default:0
    },
    memory:{ // KB
        type:Number,
        default:0
    },
    errorMessage:{
        type:String,
        default:''
    },
    testCasesPassed:{
        type:Number,
        default:0
    },
    testCasesTotal:{
        type:Number,
        default:0
    }
},
{
     timestamps:true
});

const Submission = mongoose.model('submission',submissionSchema);

module.exports = Submission;