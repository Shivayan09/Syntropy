import redis from "../../../common/redis.js";

export const invalidateTestListCache = async (userId) => {
  try {
    await redis.del(
      `tests:${userId}`,
      `tests:${userId}:academic`,
      `tests:${userId}:aptitude`
    );
  } catch (error) {
    console.error("Failed to invalidate test list cache", error?.message);
  }
};
