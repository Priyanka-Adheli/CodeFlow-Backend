const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    collegeName:{
        type:String,
        minLength:20,
        maxLength:50
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable: true,
    },
    password:{
        type:String,
        required:true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem'
        }],
    },
    streaks:{
        currentStreak:{
            type:Number,
            default:0
        },
        MaxStreak:{
            type:Number,
            default:0
        },
        lastSolvedDate:{
            type:Date,
            default:null
        }
    },
    problemSolvingHistory:[
        {
            date:{
                type:Date,
                required:true
            },
            problemIds:[{
                type:Schema.Types.ObjectId,
                ref:'problem'
        }],
        }
    ],
    EasySolved:{
        type:Number,
        default:0
    },
    MediumSolved:{
        type:Number,
        default:0
    },
    HardSolved:{
        type:Number,
        default:0
    },
    languageStats:{
        type:Map,
        of:Number,
        default:{}
    },
    potdSolvedDates :[{
        type:Date,
}],
},
{
    timestamps:true
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
      await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
});

const User = mongoose.model("user",userSchema);

module.exports = User;
