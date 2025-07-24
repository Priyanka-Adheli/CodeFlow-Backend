const cron = require("node-cron");
const POTD = require("../models/POTDModel");
const Problem = require("../models/problemModel");

const setDailyPOTD = async () => {
  try {
    // Get start of current day in UTC
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Check if POTD already exists for today
    const potdExists = await POTD.findOne({
      createdAt: { $gte: todayStart }
    });
    //already existing case
    if (potdExists) {
      console.log(`POTD already exists for ${todayStart.toISOString().split('T')[0]}`);
      return;
    }

    // Get random problem
    const [randomProblem] = await Problem.aggregate([
      { $sample: { size: 1 } }
    ]);
    
    if (!randomProblem) {
      console.error("No problems available for POTD selection");
      return;
    }

    // Create new POTD
    await POTD.create({ 
      problemId: randomProblem._id,
      date: todayStart
    });

    console.log(`New POTD set for ${todayStart.toISOString().split('T')[0]}: ${randomProblem.title}`);
  } catch (err) {
    console.error("POTD Error:", err.message);
  }
};

// Schedule to run daily at midnight UTC
cron.schedule("0 0 * * *", setDailyPOTD, {
  timezone: "UTC",
  scheduled: true
});
