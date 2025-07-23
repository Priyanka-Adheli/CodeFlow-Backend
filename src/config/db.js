const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = "mongodb+srv://Adheli:123@cluster1.55ocjqp.mongodb.net/Leetcode";

async function main(){
    await mongoose.connect(connectionString);
}

module.exports = main;