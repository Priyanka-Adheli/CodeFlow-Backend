const {createClient} = require('redis');
require('dotenv').config();

const password = process.env.REDIS_KEY;
const redisClient = createClient({
     username: 'default',
    password: password,
    socket: {
        host: 'redis-14939.c273.us-east-1-2.ec2.cloud.redislabs.com',
        port: 14939
    }
});

module.exports = redisClient;
