//Phase 2 of restructuring project: In this phase we'll apply SRP principle, single responsibility: main.js is orchestra director, should not know how to handle retries or low level connection errors. This should be carried out by specialized workers, such the present one

import axios from "axios";
import { MAX_RETRIES, BASE_DELAY_MS } from "../constants/config.js";
import { sleep } from "../utils/errorHandlers.js";

//AXIOS + RETRY
export async function axiosWithRetry(
  url,
  config,
  retries = MAX_RETRIES,
  baseDelay = BASE_DELAY_MS,
) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, config);
    } catch (error) {
      //No retry if manual abort
      if (error.name === "CanceledError") throw error;
      //no retry, 404 errs already handled
      const status = error.response?.status;
      //check both if status exists & < 500
      if (status && status < 500) throw error;
      //if last attempt --> throw error
      if (attempt === retries) throw error;

      //exponential backoff
      const delay = baseDelay * 2 ** attempt;
      const finalDelay = Math.random() * delay;

      await sleep(finalDelay);
    }
  }
}
