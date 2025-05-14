import { createClient } from 'redis';
import logger from './logger';

/**
 * Cache configuration interface
 */
interface CacheConfig {
  url?: string;
  prefix?: string;
  defaultTtl?: number;
}

/**
 * Cache utility class for Redis
 * Provides methods for caching and retrieving data
 */
class Cache {
  private client: ReturnType<typeof createClient> | null = null;
  private prefix: string;
  private defaultTtl: number;
  private enabled: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  /**
   * Constructor
   * @param config Cache configuration
   */
  constructor(config: CacheConfig = {}) {
    this.prefix = config.prefix || 'relateai:';
    this.defaultTtl = config.defaultTtl || 3600; // 1 hour default TTL
    
    // Only enable cache if Redis URL is provided
    if (process.env.REDIS_URL || config.url) {
      this.enabled = true;
      this.initialize(config.url || process.env.REDIS_URL);
    } else {
      logger.warn('Redis cache disabled: No REDIS_URL provided in environment');
    }
  }

  /**
   * Initialize Redis client
   * @param url Redis connection URL
   */
  private async initialize(url: string | undefined): Promise<void> {
    if (!this.enabled || !url) return;

    try {
      this.client = createClient({ url });
      
      // Set up event handlers
      this.client.on('error', (err) => {
        logger.error('Redis error', { error: err });
        this.enabled = false;
      });
      
      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.enabled = true;
      });
      
      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting');
      });
      
      // Connect to Redis
      this.connectionPromise = this.client.connect();
      await this.connectionPromise;
      
    } catch (error) {
      logger.error('Redis connection error', { error });
      this.enabled = false;
      this.client = null;
    }
  }

  /**
   * Ensure Redis client is connected
   */
  private async ensureConnection(): Promise<boolean> {
    if (!this.enabled || !this.client) return false;
    
    if (this.connectionPromise) {
      try {
        await this.connectionPromise;
      } catch (error) {
        return false;
      }
    }
    
    return this.client.isOpen;
  }

  /**
   * Generate cache key with prefix
   * @param key Base key
   * @returns Prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (optional)
   * @returns Success status
   */
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!await this.ensureConnection()) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client!.set(this.getKey(key), serializedValue, {
        EX: ttl || this.defaultTtl
      });
      return true;
    } catch (error) {
      logger.error('Redis set error', { error, key });
      return false;
    }
  }

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  public async get<T>(key: string): Promise<T | null> {
    if (!await this.ensureConnection()) return null;
    
    try {
      const value = await this.client!.get(this.getKey(key));
      if (!value) return null;
      
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis get error', { error, key });
      return null;
    }
  }

  /**
   * Delete value from cache
   * @param key Cache key
   * @returns Success status
   */
  public async del(key: string): Promise<boolean> {
    if (!await this.ensureConnection()) return false;
    
    try {
      await this.client!.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error('Redis del error', { error, key });
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param pattern Key pattern to match
   * @returns Number of keys deleted
   */
  public async clear(pattern: string = '*'): Promise<number> {
    if (!await this.ensureConnection()) return 0;
    
    try {
      const keys = await this.client!.keys(this.getKey(pattern));
      if (keys.length === 0) return 0;
      
      const result = await this.client!.del(keys);
      return result;
    } catch (error) {
      logger.error('Redis clear error', { error, pattern });
      return 0;
    }
  }

  /**
   * Get or set cache value
   * If key exists in cache, return cached value
   * If not, execute fetcher function, cache the result, and return it
   * @param key Cache key
   * @param fetcher Function to fetch data if not in cache
   * @param ttl Time to live in seconds (optional)
   * @returns Value from cache or fetcher
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    
    // Execute fetcher function
    const value = await fetcher();
    
    // Cache the result
    await this.set(key, value, ttl);
    
    return value;
  }

  /**
   * Check if cache is enabled
   * @returns Cache enabled status
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Close Redis connection
   */
  public async close(): Promise<void> {
    if (!this.client) return;
    
    try {
      await this.client.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Redis close error', { error });
    }
  }
}

// Create singleton instance
const cache = new Cache();

export default cache;
