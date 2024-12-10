import redis from 'redis';
import { promisify } from 'util';

const retryOptions = {
  retry_strategy: (options) => {
    if (options.attempt > 5) {
      console.error('Redis connection failed after 5 attempts');
      return new Error('Redis connection failed');
    }
    console.log('Retrying Redis connection...');
    return Math.min(options.attempt * 100, 3000); // Retry every 100ms to 3 seconds
  },
};

class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    });

    // Handle connection errors
    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });
    this.client.on('connect', () => {
      console.log('Redis client connected successfully');
    });

    // Promisify the get, set, and del methods for easier use with async/await
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Check if the Redis client is alive
   * @returns {boolean} true if the Redis client is connected, false otherwise
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Get the value for a given key
   * @param {string} key - The key to retrieve
   * @returns {Promise<string | null>} The value associated with the key, or null if not found
   */
  async get(key) {
    return this.getAsync(key);
  }

  /**
   * Set a value in Redis with an expiration time
   * @param {string} key - The key to set
   * @param {string} value - The value to set
   * @param {number} duration - Expiration time in seconds
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * Delete a key from Redis
   * @param {string} key - The key to delete
   */
  async del(key) {
    await this.delAsync(key);
  }
}

// Create and export a singleton instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

