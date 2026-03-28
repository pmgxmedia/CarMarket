class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map();
    this.defaultTTL = 5 * 60 * 1000;
  }

  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttl);
  }

  get(key) {
    const expiry = this.ttl.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  delete(key) {
    this.cache.delete(key);
    this.ttl.delete(key);
  }

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }

  invalidatePattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.delete(key);
      }
    }
  }
}

const cacheService = new CacheService();

const generateCacheKey = (prefix, params) => {
  return `${prefix}:${JSON.stringify(params)}`;
};

const cached = (prefix, ttlSeconds = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const cacheKey = generateCacheKey(prefix, {
      ...req.query,
      userId: req.user?._id?.toString()
    });

    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      return res.json({ ...cachedData, cached: true });
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttlSeconds * 1000);
      }
      return originalJson(data);
    };

    next();
  };
};

const invalidateCache = (pattern) => {
  cacheService.invalidatePattern(pattern);
};

module.exports = { cacheService, cached, invalidateCache, generateCacheKey };
