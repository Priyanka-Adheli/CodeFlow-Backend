const express = require("express");
const {register,login,logout,getProfile,adminRegister,deleteProfile,leaderBoardData,problemInfoSolvedByUser,getPOTDDates,updateUserProfile} = require('../controllers/userAuthencate');
const userMiddleware = require('../middleware/userMiddleware');
// const adminMiddleware = require('../middleware/userMiddleware');


const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.get('/logout',userMiddleware,logout);
authRouter.get('/getProfile',userMiddleware,getProfile);
authRouter.post('/adminRegister',adminRegister);
authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);
authRouter.put('/updateProfile',userMiddleware,updateUserProfile);
authRouter.get('/check',userMiddleware,(req,res)=>{
    
    const reply ={
        firstName :req.result.firstName,
        email:req.result.email,
        _id:req.result._id,
        role:req.result.role,
    }

    res.status(200).json({
        user:reply,
        message:"Valid user"
    })
});

authRouter.get('/leaderboard',leaderBoardData);
authRouter.get('/getProblemSolvedInfo',userMiddleware,problemInfoSolvedByUser);
authRouter.get('/potdDates',userMiddleware,getPOTDDates);
module.exports = authRouter;
