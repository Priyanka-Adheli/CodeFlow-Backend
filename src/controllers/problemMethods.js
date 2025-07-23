const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const problem = require("../models/problemModel");
const User = require("../models/userModel");
const POTD = require("../models/POTDModel");
const statusCodeMap = new Map([
  [4, "Wrong Answer"],
  [5, "Time Limit Exceeded"],
  [6, "Compilation Error"],
  [7, "Runtime Error (SIGSEGV)"],
  [8, "Runtime Error (SIGXFSZ)"],
  [9, "Runtime Error (SIGFPE)"],
  [10, "Runtime Error (SIGABRT)"],
  [11, "Runtime Error (NZEC)"],
  [12, "Runtime Error (Other)"],
  [13, "Internal Error"],
  [14, "Exec Format Error"],
]);

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    HiddenTestCases,
    startCode,
    referenceCode,
  } = req.body;

  try {
    for (const { language, completeCode } of referenceCode) {
      // for submission we require
      // source_code
      // language_id
      // stdin
      // stdout

      const languageId = getLanguageById(language);

      // Batch submission
      // Submission contains the input output from visibleTestCases and source_code,language
      // all these as array of objects
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      // console.log("batch Submission is "+ submissions);
      
      // returns an array of objects as {[token:"...."]}
      const submitResult = await submitBatch(submissions);
      // console.log("Submission Result is " + submitResult);
      const resultToken = submitResult.map((value) => value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

      const testResult = await submitToken(resultToken);

      console.log(testResult);

      for (const test of testResult) {
        if (test.status_id != 3)
          return res
            .status(500)
            .send(statusCodeMap.get(test.status_id) + test.stderr);
      }
    }
    // We can store problem in our Database
    const newProblem = await problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
}

const updateProblem = async(req,res)=>{
  try{
     const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceCode,
    problemCreator,
  } = req.body;

  const {id} = req.params;

  if(!id)
    return res.status(400).send("Id is Missing");

  const DSAProblem = await problem.findById(id);

  if(!DSAProblem)
    return res.status(404).send("Problem Doesn't exists of specified Id");

  for (const { language, completeCode } of referenceCode) {

      // for submission we require
      // source_code
      // language_id
      // stdin
      // stdout

      const languageId = getLanguageById(language);

      // Batch submission
      // Submission contains the input output from visibleTestCases and source_code,language
      // all these as array of objects
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      // returns an array of objects as {[token:"...."]}
      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);

      // ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

      const testResult = await submitToken(resultToken);

      // console.log(testResult);

      for (const test of testResult) {
        if (test.status_id != 3)
          return res
            .status(500)
            .send(statusCodeMap.get(test.status_id) + test.stderr);
      }
    }
    // We can store problem in our Database
    const updatedProblem = await problem.findByIdAndUpdate(
    id, 
    { ...req.body }, 
    { runValidators: true}
);

    res.status(201).send("Problem Updated Successfully");
  }
  catch(err)
  {
    res.status(500).send("Error "+err.message);
  }
}

const deleteProblem = async(req,res)=>{
  try{
    
    const id = req.params.id;

    if(!id)
    return res.status(400).send("Id is Missing");

    const DSAProblem = await problem.findById(id);

    if(!DSAProblem)
    return res.status(404).send("Problem Doesn't exists of specified Id");

    await problem.findByIdAndDelete(id);

    res.status(201).send("Problem Deleted Successfully");

  }
  catch(err)
  {
    res.status(500).send("Error "+ err.message);
  }
}

const problemFetchById = async(req,res)=>{
   try{
    
    const id = req.params.id;

    if(!id)
    return res.status(400).send("Id is Missing");

    const DSAProblem = await problem.findById(id);

    if(!DSAProblem)
    return res.status(404).send("Problem Doesn't exists of specified Id");

    res.status(201).send(DSAProblem);

  }
  catch(err)
  {
    res.status(500).send("Error "+ err.message);
  }
}


// const page = 2
// const limit = 10
// const skip = (page - 1)*limit
// Above is Pagination
const fetchAllProblems = async(req,res)=>{

  try{
  const allPromblems = await problem.find({}).select("id title difficulty tags");

  if(allPromblems.length==0)
    return res.status(200).send("No problem Exists");

  res.status(200).send(allPromblems);
  }
  catch(err)
  {
    res.status(500).send("Error "+ err.message);
  }
}

const solvedAllProblembyUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"problemSolved",
        select:"_id title difficulty tags"
      });
      
      res.status(200).send(user.problemSolved);

    }
    catch(err){
      res.status(500).send("Error " + err);
    }
}

const submittedProblem = async(req,res)=>{

  try{
     
    const userId = req.result._id;
    const problemId = req.params.pid;

  const ans = await Submission.find({userId,problemId});
  
  if(ans.length==0)
    res.status(200).send("No Submission is persent");

  res.status(200).send(ans);

  }
  catch(err){
     res.status(500).send("Wow");
  }
}

const getRandomProblem = async(req,res) =>{
  try{
  const problems = await problem.find({});

  if(!problems)
    return res.send("No problems available");

  const randomProblem = problems[Math.floor(Math.random() * problems.length)];

  if(!randomProblem)
    return res.send("No problem Available");


  return res.status(200).send(randomProblem);
}
catch(error)
{
  res.status(500).send("Error " + error);
}
}

const ProblemSolved = async(req,res) =>{
  try{
  const userId = req.result._id;
  const email = req.result.email;
  const name = req.result.firstName;
  const totalProblems = await problem.countDocuments();

  const [totalEasy,totalMedium,totalHard] = await Promise.all([
     problem.countDocuments({difficulty:"Easy"}),
     problem.countDocuments({difficulty:"Medium"}),
     problem.countDocuments({difficulty:"Hard"}),
  ])
  let easySolved = 0; 
  let mediumSolved = 0; 
  let hardSolved = 0; 
  const problems = await User.findById(userId).populate({
    path:'problemSolved',
    select:'difficulty'
  });

  problems.problemSolved.forEach((problem)=>{
    if(problem.difficulty==="Easy") easySolved ++;
    else if(problem.difficulty==="Medium") mediumSolved ++;
    else if(problem.difficulty==="Hard") hardSolved ++;
  });

    return res.status(200).json({easySolved,mediumSolved,hardSolved,totalSolved:problems.problemSolved.length,totalEasy,totalMedium,totalHard,totalProblems});
  }
  catch(error){
    res.send("Error" + error);
  }
}

const problemSolvedList = async(req,res) =>{
  try{
  const userId = req.result._id;
  const problems = await User.findById(userId).populate({
    path:'problemSolved',
    select:'_id difficulty title '
  });

  if(!problems)
    return res.status(200).json("No problem solved yet");

    return res.status(200).json(problems.problemSolved);
  }
  catch(error){
    res.send("Error" + error);
  }
}

const randomProblem = async(req,res) =>{
  try{
  const latestPotd = await POTD.findOne({})
    .sort({ createdAt: -1 })
    .populate("problemId");

  if (!latestPotd) {
    return res.status(404).json({ message: "No POTD found" });
  }

  res.json({
    title: latestPotd.problemId.title,
    createdAt: latestPotd.createdAt,
    _id:latestPotd.problemId._id
  });
}
  catch(error){
    res.status(500).send("Error "+error.message);
  }
}

const getProblembyIds = async(req,res) =>{
  const { ids } = req.body;

  try {
    const problems = await problem.find({ _id: { $in: ids } }).select("title _id");
    res.json(problems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching problems", error });
  }
}
module.exports = {createProblem,updateProblem,deleteProblem,problemFetchById,fetchAllProblems,solvedAllProblembyUser,submittedProblem,getRandomProblem,ProblemSolved,problemSolvedList,randomProblem,getProblembyIds};
