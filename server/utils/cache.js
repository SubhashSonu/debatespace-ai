const redis = require("../config/redis");

const CACHE_TTL = {
  HISTORY: 600,
  MY_DEBATES: 600,
  AI_LIST: 300,
  AI_CONVERSATION: 300,
  SUMMARY: 3600,
  DEBATE: 300,
};

const getCache = async (key) => {
  try {
    const data = await redis.get(key);

    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis GET Error (${key}):`, error);

    return null;
  }
};

const setCache = async (
  key,
  value,
  ttl = CACHE_TTL.DEBATE,
) => {
  try {
    await redis.set(
      key,
      JSON.stringify(value),
      "EX",
      ttl,
    );
  } catch (error) {
    console.error(`Redis SET Error (${key}):`, error);
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Redis DEL Error (${key}):`, error);
  }
};

const deleteCaches = async (...keys) => {
  try {
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(
      `Redis DEL Multiple Error (${keys.join(", ")}):`,
      error,
    );
  }
};

module.exports = {
  CACHE_TTL,
  getCache,
  setCache,
  deleteCache,
  deleteCaches,
};