//Phase 2 of restructuring project: In this phase we'll apply SRP principle, single responsibility: main.js is orchestra director, should not know how to handle retries or low level connection errors. This should be carried out by specialized workers, such the present one

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { MAX_RETRIES, BASE_DELAY_MS } from "../constants/config.js";
import { sleep } from "../utils/errorHandlers.js";

//AXIOS + RETRY
export async function axiosWithRetry(
  url: string,
  config?: AxiosRequestConfig,
  retries: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY_MS,
): Promise<AxiosResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, config);
    } catch (error: any) { //axios allow to type the error due to its specific structure
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
  throw new Error("Max retries reached");
}
