const {createClient} = require('redis');
require('dotenv').config();

const password = process.env.REDIS_KEY;
const redisClient = createClient({
     username: 'default',
    password: password,
    socket: {
        host: 'redis-16183.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16183
    }
});

module.exports = redisClient;