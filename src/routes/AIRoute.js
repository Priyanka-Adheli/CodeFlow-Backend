const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {ProblemRelatedAi,allInterviewChats,sendMessageToAi,timeSpaceComplexityAi,getChatInterviewByIndex,getChatHistory} = require('../controllers/AiMethods');

aiRouter.post('/problemChat',userMiddleware,ProblemRelatedAi);
aiRouter.get('/getAllInterviewChats',userMiddleware,allInterviewChats);
aiRouter.post('/interviewWithAi',userMiddleware,sendMessageToAi);
aiRouter.post('/analyzeComplexity',userMiddleware,timeSpaceComplexityAi);
aiRouter.post('/interviewById',userMiddleware,getChatInterviewByIndex);
aiRouter.get('/history',userMiddleware,getChatHistory);

module.exports = aiRouter;