const cron = require("node-cron");
const POTD = require("../models/POTDModel");
const Problem = require("../models/problemModel");

const runPOTDJob = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const alreadyExists = await POTD.findOne({
      createdAt: { $gte: new Date(today) },
    });
    if (alreadyExists) return;

    const randomProblem = await Problem.aggregate([{ $sample: { size: 1 } }]);
    if (!randomProblem.length) return;

    await POTD.create({ problemId: randomProblem[0]._id });

    console.log(`POTD inserted for ${today}`);
  } catch (err) {
    console.error("POTD error:", err.message);
  }
};

// Run once on server started
// runPOTDJob();

// Run every midnight (only if server is running)
cron.schedule("0 0 * * *", runPOTDJob);
