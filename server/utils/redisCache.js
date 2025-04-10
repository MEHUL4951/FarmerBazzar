// redisCache.js

import { redisClient } from "../server.js";
export const getCache = async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Redis GET Error:', err);
      return null;
    }
  };
  
  export const setCache = async (key, value, expiration = 3600) => {
    try {
      await redisClient.setEx(key, expiration, JSON.stringify(value));
    } catch (err) {
      console.error('Redis SET Error:', err);
    }
  };
  
  export const deleteCache = async (key) => {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error('Redis DEL Error:', err);
    }
  };
  