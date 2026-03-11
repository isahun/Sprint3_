import { MESSAGES } from "../constants/messages";

//Get HTTP status
export function getHTTPErrorMessage(status: number): string {
  if (status === 400) return MESSAGES.BAD_REQUEST;
  if (status === 404) return MESSAGES.NOT_FOUND;
  if (status >= 500) return MESSAGES.SERVER_ERROR;
  return MESSAGES.UNEXPECTED_ERROR;
}

//Retry helper
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}