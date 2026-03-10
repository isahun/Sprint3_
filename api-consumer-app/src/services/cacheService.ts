import { CACHE_TTL_MS } from "../constants/config.js";

//0. DEFINE CACHE DATA INTERFACE
interface CacheEntry {
  data: any[];
  totalItems: number;
  selectedType: string;
  timestamp: number;
}

//1. SAFE VAULT (encapsulation), no export, MAP is private object, so no other file can clear cache by mistake
const cache = new Map<string, CacheEntry>(); //Map -->an object that can store collections of key-value pairs
//tell the map that keys are string and values are cache entry

export const cacheService = {
  //2. READING NEXUS: can't touch cache data from safe vault (map), but can retrieve it with following method:
  get: (key: string): CacheEntry | null => {
    const entry = cache.get(key);
    if (!entry) return null; //if empty, if cache hasn't been created yet, null and move on to fetching data from API

    //only check if cache expired inside "get"
    const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    return entry; //returns either data (if not expired) or null (if expired)
  },

  //3. SAVING NEXUS
  set: (key: string, data: any[], totalItems: number, selectedType: string): void => {
    //set: data from main.js, from api, knows not about timestamps, just wants to store info
    cache.set(key, { data, totalItems, selectedType, timestamp: Date.now() });
    //cache.set: cache is Map, so can only take 2 params, key and {}. I save data from main.js + timestamp so "get" can calculate if cache is expired when trying to load site again
  },

  //4. KEY GENERATOR
  generateKey: (method: string, url: string, searchTerm: string, page: number): string => {
    return `${method}|${url}|${searchTerm}|${page}`;
    //what makes each call unique
  },
};
