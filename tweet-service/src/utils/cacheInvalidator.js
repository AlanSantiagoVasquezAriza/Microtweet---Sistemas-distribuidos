// ========================================
// tweet-service/src/utils/cacheInvalidator.js
// ========================================
const deleteByPattern = async (redisClient, pattern) => {
  const iterator = redisClient.scanIterator({
    MATCH: pattern,
  });

  const deletions = [];
  for await (const key of iterator) {
    deletions.push(redisClient.del(key));
  }

  await Promise.all(deletions);
};

const invalidateFeedCache = async (redisClient, userId) => {
  try {
    await Promise.all([
      deleteByPattern(redisClient, 'feed:public:*'),
      deleteByPattern(redisClient, `feed:personal:${userId}:*`),
    ]);
    console.log(`Cache invalidated for user ${userId}`);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};

module.exports = { invalidateFeedCache };