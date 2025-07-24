const express = require('express');
const  problemRouter = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

const {createProblem,updateProblem,deleteProblem,problemFetchById,fetchAllProblems,solvedAllProblembyUser,submittedProblem,getRandomProblem,ProblemSolved,problemSolvedList,randomProblem,getProblembyIds} = require('../controllers/problemMethods');

// Problem to create
problemRouter.post('/create', adminMiddleware, createProblem);

// Static routes first
problemRouter.get('/problemSolvedByUser', userMiddleware, solvedAllProblembyUser);
problemRouter.get('/submittedProblem/:pid', userMiddleware, submittedProblem);

// Problem to Fetch
problemRouter.get('/getAllProblems', fetchAllProblems);
problemRouter.get('/problemById/:id',userMiddleware, problemFetchById);

// Problem to update
problemRouter.put('/update/:id', adminMiddleware, updateProblem);

// Problem to delete
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

problemRouter.get("/randomProblem",userMiddleware,getRandomProblem);
problemRouter.get("/solvedCount",userMiddleware,ProblemSolved);
problemRouter.get("/solvedList",userMiddleware,problemSolvedList);
problemRouter.get("/potd",userMiddleware,randomProblem);
problemRouter.post("/getByIds",userMiddleware,getProblembyIds);
module.exports = problemRouter;
