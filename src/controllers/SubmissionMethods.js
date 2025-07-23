const problem = require("../models/problemModel");
const Submission = require("../models/SubmissionModel");
const User = require('../models/userModel');
const redisClient = require("../config/redis");
const POTD = require("../models/POTDModel");
const mongoose = require('mongoose');
const {getMostUsedLanguage} = require("../utils/problemUtility");
const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");

const Requiredlanguage = {
        "c++":"C++",
        "java":"Java",
        "javascript":"JavaScript"
    }

    // Case-insensitive lookup function
function getLanguageName(inputLang) {
  const normalizedKey = inputLang.toLowerCase();
  return Requiredlanguage[normalizedKey] || inputLang; // Fallback to input if not found
}
const submitCodeRateLimiter = async (req, res, next) => {
  const userId = req.result.id; 
  const redisKey = `submit_cooldown:${userId}`;

  try {
    // Check if user has a recent submission
    const exists = await redisClient.exists(redisKey);
    
    if (exists) {
      return res.status(429).json({
        error: 'Please wait 10 seconds before submitting again'
      });
    }

    // Set cooldown period
    await redisClient.set(redisKey, 'cooldown_active', {
      EX: 10, // Expire after 10 seconds
      NX: true // Only set if not exists
    });

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const submitProblem = async (req, res) => {
    try {
        const user_id = req.result.id;
        const problemId = req.params.id;

        let { code, language } = req.body;

        if (!user_id || !problemId || !code || !language)
            return res.status(400).send("Field is Missing");

        if(language==='cpp')
        language='c++';

        // Fetch problem from Db
        const DSAproblem = await problem.findById(problemId);

        if (!DSAproblem || !DSAproblem.HiddenTestCases) {
            return res.status(404).send("Problem not found or missing test cases");
        }

        const submittedData = await Submission.create({
            user_id,
            problemId,
            code,
            language: getLanguageName(language), 
            testCasesPassed: 0,
            status: "Pending",
            testCasesTotal: DSAproblem.HiddenTestCases.length,
        });

        // Submit code to judge0
        const languageId = getLanguageById(language);
        const submissions = DSAproblem.HiddenTestCases.map((testcase) => ({
            source_code: code, 
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);

        const resultToken = submitResult.map((value) => value.token);

        const testResult = await submitToken(resultToken);

        // Update the submission entry with results
        let testCasesPassed = 0, runtime = 0, memory = 0;
        let status = "Accepted", errorMessage;

        for (const test of testResult) {
            if (test.status_id === 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                errorMessage = test.stderr;
                status = test.status.description;
            }
        }

        submittedData.status = status;
        submittedData.testCasesPassed = testCasesPassed;
        submittedData.runtime = runtime;
        submittedData.memory = memory;
        submittedData.errorMessage = errorMessage;

        await submittedData.save();

        // Update user's solved problems list
        const user = await User.findById(user_id);
        
        if (status=='Accepted' && !user.problemSolved.some(pId => pId.toString() === problemId.toString())) {
            user.problemSolved.push(problemId);

            if(!user.languageStats.has(language))
            {
              user.languageStats.set(language,1);
            }
            else
            {
              user.languageStats.set(language,user.languageStats.get(language)+1);
            }

            if(DSAproblem.difficulty=="Easy")
              user.EasySolved++;
            else if(DSAproblem.difficulty=="Medium")
              user.MediumSolved++;
            else if(DSAproblem.difficulty=="Hard")
              user.HardSolved++;
            
            await user.save();
        }

        if(status=='Accepted')
        {
        const todayDate = new Date().toDateString();

        const todayEntry = user.problemSolvingHistory.find(data=>{
          return new Date(data.date).toDateString() == todayDate;
        })

        // if today already solved few problems add current problem
        if(todayEntry)
        {

          const alreadySolvedCurrentProblem  = todayEntry.problemIds.some((id)=> id.toString()== problemId);

          // if not solved then add since to store only unique problems solved in a day
          if(!alreadySolvedCurrentProblem)
            todayEntry.problemIds.push(problemId);
        }
        else
        {
          user.problemSolvingHistory.push({
            date:new Date(),
            problemIds:[problemId],
          });
        }

        await user.save();
      }
      // potd case when problem solved is POTD
        const potd = await POTD.findOne().sort({createdAt : -1});

        const isPotd = potd && potd.problemId == problemId;

        const isToday = new Date(potd.createdAt).toDateString() === new Date().toDateString();

        if(isPotd && isToday && status=='Accepted')
        {

          console.log("yes its potd");
          const user = await User.findById(user_id);

          const lastDate = new Date(user.streaks.lastSolvedDate || 0);

          const today = new Date();

          const isYesterday = new Date(today - 86400000).toDateString() == lastDate.toDateString();

          if(isYesterday)
          {
            user.streaks.currentStreak +=1;
          }
          else if(lastDate.toDateString()!=today.toDateString())
          {
            user.streaks.currentStreak = 1;
          }

          user.streaks.lastSolvedDate = today;

          user.streaks.MaxStreak = Math.max(user.streaks.currentStreak,user.streaks.MaxStreak);
          const todayDate = new Date().toISOString().split('T')[0]; 
          const alreadySolved = user.potdSolvedDates.includes(todayDate);

          if(!alreadySolved)
          {
            user.potdSolvedDates.push(todayDate);
            await user.save();
          }
          else
          {
            console.log("already solved potd");
          }
        }
    res.status(201).json({
      status,
      totalTestCases: submittedData.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });


    } catch (err) {
        console.error(err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
};

const runCode = async(req,res)=>{
    
     // 
     try{
      const user_id = req.result.id;
      const problemId = req.params.id;

      const {code,language} = req.body;

     if(!user_id||!code||!problemId||!language)
       return res.status(400).send("Some field missing");

   //    Fetch the problem from database
      const DSAproblem =  await problem.findById(problemId);
   //    testcases(Hidden)


   //    Judge0 code ko submit karna hai

   const languageId = getLanguageById(language);

   const submissions = DSAproblem.visibleTestCases.map((testcase)=>({
       source_code:code,
       language_id: languageId,
       stdin: testcase.input,
       expected_output: testcase.output
   }));


   const submitResult = await submitBatch(submissions);
   
   const resultToken = submitResult.map((value)=> value.token);

   const testResult = await submitToken(resultToken);
   
// res.status(201).send(testResult);
let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = null;

    for(const test of testResult){
        if(test.status.id==3){
           testCasesPassed++;
           runtime = runtime+parseFloat(test.time)
           memory = Math.max(memory,test.memory);
        }else{
            errorMessage = test.stderr
          }
        status = test.status.description;
    }
  
   res.status(201).json({
    status,
    totalTestCases: testResult.length,
    passedTestCases: testCasesPassed,
    runtime,
    memory
   });
      

}
   catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }
}

const getUserProblemSpecificSubmissions = async(req,res) =>{
  try{
  const user_id = req.result.id;
  const problemId = req.params.id;
  const results = await Submission.find(
  { user_id,problemId }, // filter criteria
  { status: 1, runtime: 1, memory: 1, createdAt: 1, _id: 1, code : 1,language: 1 } // projection
  );

  res.json(results.reverse());
}
  catch(error)
  {
    console.log(error);
  }
}

const getUserSpecificSubmissions = async(req,res) =>{
  try{
  const user_id = req.result.id;
  const user = await User.findById(req.result._id);
  const results = await Submission.find(
  { user_id}, // filter criteria
  { status: 1, runtime: 1, memory: 1, createdAt: 1, problemId: 1,language: 1 } // projection
  );

  const solvedData = [];
  
      for(const entry of results)
      {
              const problemData = await problem.findById(entry.problemId).select("title difficulty").lean();
              solvedData.push({
                  createdAt:entry.createdAt,
                  language:entry.language,
                  runtime:entry.runtime,
                  memory:entry.memory,
                  status:entry.status,
                  problemId:entry.problemId,
                  title:problemData.title,
                  difficulty:problemData.difficulty,
              })
      }
  solvedData.reverse();
  const mostLangUsed = getMostUsedLanguage(user.languageStats);
  res.json({solvedData,mostLangUsed});
}
  catch(error)
  {
    console.log(error);
  }
}

module.exports = {submitCodeRateLimiter,submitProblem,runCode,getUserProblemSpecificSubmissions,getUserSpecificSubmissions};