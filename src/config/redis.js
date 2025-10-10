const {createClient} = require('redis');
require('dotenv').config();

const password = process.env.REDIS_KEY;
const redisClient = createClient({
     username: 'default',
    password: password,
    socket: {
        host: 'redis-14794.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14794
    }
});

module.exports = redisClient;
