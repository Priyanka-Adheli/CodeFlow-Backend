const express = require('express');
const app = express();

require('dotenv').config;

const cookieParser = require('cookie-parser');
const main = require('./config/db');
const redisClient = require('./config/redis');
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemRoute');
const submitRouter =require('./routes/submissionRoute');
const aiRouter = require('./routes/AIRoute');
const cors = require('cors')
require("./corn/potdScheduler");

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());


const port = process.env.PORT;

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);

const InitializeComponent = async()=>{
    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("Connected to Database");
        
        app.listen(port,()=>{
        console.log("Server is Listening");
    });
    }
    catch(err)
    {
        console.log("Error "+err);
    }
}

InitializeComponent();
