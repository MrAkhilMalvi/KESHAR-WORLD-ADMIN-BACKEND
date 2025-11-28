// redisClient.js
import { createClient } from 'redis';
import config from 'config';

const redisClient = createClient({
  socket: {
    host: config.get('App.redis.host'),
    port: config.get('App.redis.port'),
  },
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Connect once, on first import
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err);
});

export default redisClient;
