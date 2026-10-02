const cron = require("node-cron");
const POTD = require("../models/POTDModel");
const Problem = require("../models/problemModel");

// POTD days follow UTC, same as the rest of the app (potdSolvedDates, streaks)
const todayKey = () => new Date().toISOString().split('T')[0];

const pickRandomProblem = async (excludeId) => {
  const pipeline = excludeId ? [{ $match: { _id: { $ne: excludeId } } }] : [];
  const [problem] = await Problem.aggregate([...pipeline, { $sample: { size: 1 } }]);

  // Only one problem in the DB - repeating it is better than having no POTD
  if (!problem && excludeId) return pickRandomProblem();
  return problem;
};

// Returns today's POTD, creating it if it doesn't exist yet. Called on startup,
// by the cron job and on every /problem/potd request, so a sleeping server
// that missed the cron run still gets a fresh POTD on its first request.
const getTodayPOTD = async () => {
  const day = todayKey();

  const existing = await POTD.findOne({ day });
  if (existing) return existing;

  // Avoid giving the same problem two days in a row
  const previous = await POTD.findOne().sort({ createdAt: -1 });
  const randomProblem = await pickRandomProblem(previous?.problemId);

  if (!randomProblem) {
    console.error("No problems available for POTD selection");
    return null;
  }

  try {
    const potd = await POTD.create({ problemId: randomProblem._id, day });
    console.log(`New POTD set for ${day}: ${randomProblem.title}`);
    return potd;
  } catch (err) {
    // Another request created today's POTD at the same moment (unique index on day)
    if (err.code === 11000) return POTD.findOne({ day });
    throw err;
  }
};

const setDailyPOTD = async () => {
  try {
    await getTodayPOTD();
  } catch (err) {
    console.error("POTD Error:", err.message);
  }
};

// Runs at the start of each UTC day (5:30 AM IST). If the server is asleep at
// this time, the first /problem/potd request of the day creates it instead.
cron.schedule("0 0 * * *", setDailyPOTD, {
  timezone: "UTC"
});

module.exports = { getTodayPOTD, setDailyPOTD, todayKey };
