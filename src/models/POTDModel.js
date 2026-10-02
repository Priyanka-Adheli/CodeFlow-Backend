const mongoose = require("mongoose");
const {Schema} = mongoose;
const potdSchema = Schema({
  createdAt: {
    type: Date,
    default: Date.now, // ⏰ precise timestamp
    index: true,
  },
  // UTC date (YYYY-MM-DD) this POTD belongs to; unique so only one per day
  day: {
    type: String,
    unique: true,
    sparse: true,
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "problem",
    required: true,
  },
});

module.exports = mongoose.model("POTD", potdSchema);
