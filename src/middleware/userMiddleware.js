const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const User = require('../models/userModel');
require('dotenv').config();

const key = process.env.SECERT_KEY;

const userMiddleware = async(req,res,next)=>{
    try{
        const {token} = req.cookies;

        if(!token)
            throw new Error("Token Doesn't Exists");

        const payload = await jwt.verify(token,key);

        const {id} = payload;

        if(!id)
            throw new Error("Id Doesn't Exists");

        const result = await User.findById({_id:id});

        if(!result)
            throw new Error("User Doesn't Exists");

        const IsBlocked = await redisClient.exists(`token:${token}`);

        if(IsBlocked)
            throw new Error("Unauthorized Access");

        req.result = result;
        
        next();
    }
    catch(err)
    {
        res.status(400).send("Error "+err);
    }
}

module.exports = userMiddleware;
