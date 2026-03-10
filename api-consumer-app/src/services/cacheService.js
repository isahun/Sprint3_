import { CACHE_TTL_MS } from "../constants/config.js"

//1. SAFE VAULT (encapsulation), no export, MAP is private object, so no other file can clear cache by mistake
const cache = new Map(); //Map -->an object that can store collections of key-value pairs

export const cacheService = {
    //2. READING NEXUS: can't touch cache data from safe vault (map), but can retrieve it with following method:
    get: (key) => {
        const entry = cache.get(key);
        if (!entry) return null; //if empty, if cache hasn't been created yet, null and move on to fetching data from API

        //only check if cache expired inside "get" 
        const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
        if (isExpired) {
            cache.delete(key);
            return null
        }
        return entry; //returns either data (if not expired) or null (if expired)
    },

    //3. SAVING NEXUS
    set: (key, data, totalItems, selectedType) => { //set: data from main.js, from api, knows not about timestamps, just wants to store info
        cache.set(key, { data, totalItems, selectedType, timestamp: Date.now() })
        //cache.set: cache is Map, so can only take 2 params, key and {}. I save data from main.js + timestamp so "get" can calculate if cache is expired when trying to load site again
    },

    //4. KEY GENERATOR
    generateKey: (method, url, searchTerm, page) => {
        return `${method}|${url}|${searchTerm}|${page}`;
        //what makes each call unique
    }
};