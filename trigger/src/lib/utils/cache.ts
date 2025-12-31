/**
 * Simple in-memory cache with TTL for job requirements extraction
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number = 3600000) {
    // Default TTL: 1 hour in milliseconds
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache for job requirements (1 hour TTL)
export const jobRequirementsCache = new SimpleCache<any>(3600000);

// Cache for relevant experience extraction (30 minutes TTL)
export const relevantExperienceCache = new SimpleCache<any>(1800000);

/**
 * Generate a cache key for job requirements based on job description
 */
export function getJobRequirementsCacheKey(jobDescription: string): string {
  // Use a hash of the job description as the key
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < jobDescription.length; i++) {
    const char = jobDescription.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `job-requirements-${Math.abs(hash)}`;
}

/**
 * Generate a cache key for relevant experience based on profile and job description
 */
export function getRelevantExperienceCacheKey(profileId: string, jobDescription: string): string {
  let hash = 0;
  const combined = `${profileId}-${jobDescription}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `relevant-experience-${Math.abs(hash)}`;
}

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    jobRequirementsCache.cleanup();
    relevantExperienceCache.cleanup();
  }, 600000); // 10 minutes
}

