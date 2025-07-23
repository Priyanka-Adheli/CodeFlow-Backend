const express = require('express');
const submitRouter = express.Router();

const userMiddleware = require('../middleware/userMiddleware');
const {submitCodeRateLimiter,submitProblem,runCode,getUserProblemSpecificSubmissions,getUserSpecificSubmissions} = require('../controllers/SubmissionMethods');

submitRouter.post('/submit/:id',userMiddleware,submitProblem);
submitRouter.post('/run/:id',userMiddleware,runCode);
submitRouter.get('/getProblemSubmissions/:id',userMiddleware,getUserProblemSpecificSubmissions)
submitRouter.get('/getAllSubmissions',userMiddleware,getUserSpecificSubmissions);

module.exports = submitRouter;