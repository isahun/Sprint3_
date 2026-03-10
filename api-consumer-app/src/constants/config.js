// ============================================================================
// 1. CONFIG & CONSTANTS
// ============================================================================

export const API_BASE_URL = "https://jsonplaceholder.typicode.com";
export const ITEMS_PER_PAGE = 10;
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins in milliseconds
export const MAX_RETRIES = 3;
export const BASE_DELAY_MS = 500;
export const MAX_VISIBLE_PAGES = 5;

// FIX: "Primitive Obsession". Instead of literal string comparison, ("posts" === "posts"), we use an object simulating an "Enum" (fix values enumeration)
export const API_TYPES = {
  POSTS: "posts",
  USERS: "users",
  COMMENTS: "comments",
};

export const FETCH_METHODS = {
  FETCH: "fetch",
  AXIOS: "axios",
};
