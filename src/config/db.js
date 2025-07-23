const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.DB_CONNET;

async function main(){
    await mongoose.connect(connectionString);
}

module.exports = main;
