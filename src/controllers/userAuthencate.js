const User = require('../models/userModel');
const problem = require("../models/problemModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
const validate = require('../utils/validator');
const {getMostUsedLanguage} = require("../utils/problemUtility");
require('dotenv').config();

const key = process.env.SECERT_KEY;


const register = async(req,res)=>{
    try{
       
        // Validate the user data
        validate(req.body);

        // Hash the password
        req.body.password = await bcrypt.hash(req.body.password,10);


        // Insert the valid data
        const user = await User.create(req.body);

        // Create an token
        const token = jwt.sign({id:user._id,email:user.email,name:user.firstName,role:user.role},key,{expiresIn:3600});

        // Add the token to cookies
        res.cookie("token",token,{maxAge:60*60*1000});

        // send reply
        const reply = {
            firstName: user.firstName,
            email: user.email,
            _id: user._id,
            role:user.role,
        }

        // Send response to the user
          res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and Password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid Credentials" });

    const isVaildPassword = await bcrypt.compare(password, user.password);
    if (!isVaildPassword)
      return res.status(401).json({ error: "Incorrect Password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.firstName, role: user.role },
      key,
      { expiresIn: 3600 }
    );

    res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

    const reply = {
      firstName: user.firstName,
      email: user.email,
      _id: user._id,
      role: user.role,
    };

    res.status(200).json({
      user: reply,
      message: "Logged in successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const logout = async(req,res)=>{
    try{
        // Validate the token done using middleware

        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp);

        // Empty the cookies
        res.cookie("token",null,{maxAge:new Date(Date.now())});

        res.send("Logged Out successfully");
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

const getProfile = async(req,res)=>{
    try{
    const {token} = req.cookies;

    const payload = jwt.verify(token,key);
    const userId = payload.id;
    const user = await User.findById(userId);

    res.status(201).json({user});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error:err.message});
    }

}

const adminRegister = async(req,res)=>{
     try{
        if(req.body.role!='admin')
        throw new Error("Invalid Credentials");  
        // Validate the user data
        validate(req.body);

        // Hash the password
        req.body.password = await bcrypt.hash(req.body.password,10);

        console.log("yes password hashed");

        // Insert the valid data
        const user = await User.create(req.body);

        console.log("yes");

        // Create an token
        const token = jwt.sign({id:user._id,email:user.email,name:user.firstName,role:user.role},key,{expiresIn:3600});

        // Add the token to cookies
        res.cookie("token",token,{maxAge:60*60*1000});

        // Send response to the user
        res.status(201).send(user);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    // userSchema delete
    await User.findByIdAndDelete(userId);

    res.status(200).send("Deleted Successfully");
    }
    catch(err){
      
        console.log(err);
        res.status(500).json({error:err.message});
    }
}

const leaderBoardData = async(req,res)=>{
    try{

        const users = await User.find({role:'user'}).lean();

        const leaderBoardUsers = users.map(user=>(
            {
                name:user.firstName,
                email:user.email,
                currentStreak:user.streaks.currentStreak || 0,
                MaxStreak:user.streaks.MaxStreak || 0,
                problemSolved : user.problemSolved.length
            }
        )).sort((a,b)=> b.problemSolved - a.problemSolved); //sort in desc

        leaderBoardUsers.forEach((user,index)=>{
            user.rank = index +1;
        });

        res.status(200).json({leaderBoardUsers});
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({error:error.message});
    }
}

const problemInfoSolvedByUser = async(req,res) =>{
  try {
    const user = await User.findById(req.result._id);

    const solvedData = [];

    for(const entry of user.problemSolvingHistory)
    {
        for(const pid of entry.problemIds)
        {
            const problemData = await problem.findById(pid).select("title difficulty").lean();
            solvedData.push({
                problemId:pid,
                title:problemData.title,
                difficulty:problemData.difficulty,
                solvedAt:entry.date.toDateString()
            })
        }
    }

    const mostLangUsed = getMostUsedLanguage(user.languageStats);

    res.status(200).json({mostLangUsed,solvedData});
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
}

const getPOTDDates = async(req,res) =>{
  try{
     const user = await User.findById(req.result._id);

     const potdDates = user.potdSolvedDates;

     res.status(200).send(potdDates);
  }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: err });
  }
}


module.exports = {register,login,logout,getProfile,adminRegister,deleteProfile,leaderBoardData,problemInfoSolvedByUser,getPOTDDates};
