//Phase 2 of restructuring project: In this phase we'll apply SRP principle, single responsibility: main.js is orchestra director, should not know how to handle retries or low level connection errors. This should be carried out by specialized workers, such the present one

import { MAX_RETRIES, BASE_DELAY_MS } from "../constants/config.js"
import { getHTTPErrorMessage, sleep } from "../utils/errorHandlers.js"


//FETCH + RETRY
export async function fetchWithRetry(
  url,
  options,
  retries = MAX_RETRIES,
  baseDelay = BASE_DELAY_MS,
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(getHTTPErrorMessage(response.status));
      return response;
    } catch (error) {
      //No retry if manual abort
      if (error.name === "AbortError") throw error;
      //no retry, 404 errs already handled
      if (error.message?.startsWith("400") || error.message?.startsWith("404"))
        throw error;
      //if last attempt --> throw error
      if (attempt === retries) throw error;

      //exponential backoff
      const delay = baseDelay * 2 ** attempt;
      const finalDelay = Math.random() * delay;
      await sleep(finalDelay);
    }
  }
}
