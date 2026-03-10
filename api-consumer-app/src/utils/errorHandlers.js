import { MESSAGES } from "../constants/messages";

// ===================================================================
// 9. UTILS
// ===================================================================

//Get HTTP status
export function getHTTPErrorMessage(status) {
  if (status === 400) return MESSAGES.BAD_REQUEST;
  if (status === 404) return MESSAGES.NOT_FOUND;
  if (status >= 500) return MESSAGES.SERVER_ERROR;
  return `HTTP Error ${status}`;
}

//Retry helper
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}