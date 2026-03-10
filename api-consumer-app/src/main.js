"use strict";

import "./style.css";
import { API_BASE_URL, FETCH_METHODS, ITEMS_PER_PAGE } from "./constants/config";
import { MESSAGES } from "./constants/messages";
import { cacheService } from "./services/cacheService";
import { getHTTPErrorMessage } from "./utils/errorHandlers"
import { fetchWithRetry } from "./api/fetchClient"
import { axiosWithRetry } from "./api/axiosClient";
import { createCardElement } from "./components/ResultCard";
import { setupPagination } from "./components/Pagination";


// ===========================================
// 2. APP STATE
// ============================================

let currentPage = 1;
let currentController = null;

// ==================================================
// 3. DOM ELEMENTS
// ==================================================

const fetchMethodSelect = document.getElementById("fetch-method");
const apiTypeSelect = document.getElementById("api-type");
const searchInput = document.getElementById("search-input");
const fetchButton = document.getElementById("fetch-btn");
const loadingContainer = document.getElementById("loading");
const errorContainer = document.getElementById("error");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

// ===================================================
// 4. EVENT LISTENERS
//====================================================

fetchButton.addEventListener("click", () => {
  currentPage = 1; //back to page one when user makes new petition
  fetchData();
});

apiTypeSelect.addEventListener("change", () => {
  currentPage = 1;
});

// ==================================================
// 5. UI HELPERS
// ===================================================

function showLoading() {
  loadingContainer.textContent = MESSAGES.LOADING;
  loadingContainer.classList.remove("hidden");
  resultsContainer.setAttribute("aria-busy", "true"); //let user know it's working
}

function hideLoading() {
  loadingContainer.classList.add("hidden");
  resultsContainer.setAttribute("aria-busy", "false"); //finished working
}

function showError(errorMessage) {
  errorContainer.textContent = errorMessage;
  errorContainer.classList.remove("hidden");
}

function hideError() {
  errorContainer.textContent = "";
  errorContainer.classList.add("hidden");
}

// ====================================================
// 6. MAIN CONTROLLER
//====================================================
//FIX: inappropriate incimacy and responsibility overload
//fetchData used to decide if axios or fetch and configure params,
// now it only reads DOM (users inputs) and calls performApiRequest

async function fetchData() {
  const searchTerm = searchInput.value.trim();
  const useAxios = fetchMethodSelect.value === FETCH_METHODS.AXIOS;
  let selectedType = apiTypeSelect.value;
  const endpointURL = `${API_BASE_URL}/${selectedType}`;

  //UI state (to implement)
  showLoading();
  hideError();

  //Clear previous content
  resultsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  try {
    //call axios implementation without fetchData knowing HOW the call is made
    await performApiRequest(endpointURL, searchTerm, selectedType, useAxios);
  } catch (error) {
    //handle unexpected errors
    showError(MESSAGES.UNEXPECTED_ERROR);
  } finally {
    hideLoading();
  }
}

// ===================================================
// 7. API ORCHESTRATOR
// ===================================================
// Fix according to DRY, this function replaces getDataWithAxios and getDataWith Fetch: check cache, AbortController and send results to screen

async function performApiRequest(endpointURL, searchTerm, selectedType, useAxios) {
    const methodStr = useAxios ? FETCH_METHODS.AXIOS : FETCH_METHODS.FETCH;

    //use cache service
    const cacheKey = cacheService.generateKey(methodStr, endpointURL, searchTerm, currentPage);
    const cachedEntry = cacheService.get(cacheKey);

    if (cachedEntry) {
        displayResults({ 
            items: cachedEntry.data,
            totalItems: cachedEntry. totalItems,
            selectedType: cachedEntry.selectedType
        });
        return;
    }

    if (currentController) {
        currentController.abort();
    }
    currentController = new AbortController();

    try {
        let data, totalItems;

        if (useAxios) {
            const response = await axiosWithRetry(endpointURL, {
                params: { 
                    _page: currentPage, 
                    _limit: ITEMS_PER_PAGE, 
                    q: searchTerm,
                },
                signal: currentController.signal,
            });
            totalItems = Number(response.headers["x-total-count"]);
            data = response.data;
        } else {
            const response = await fetchWithRetry(`${endpointURL}?_page=${currentPage}&_limit=${ITEMS_PER_PAGE}&q=${searchTerm}`,
                { signal: currentController.signal }
            );

            totalItems = Number(response.headers.get("X-Total-Count"));
            data = await response.json();
        }

        //save data to cache using cache service
        cacheService.set(cacheKey, data, totalItems, selectedType);
        displayResults({ items: data, totalItems, selectedType });
    } catch (error) {
        handleApiError(error);
    } finally {
        currentController = null;
    }
}

//Fix, error centralization to avoid repeating code in every try/catch
function handleApiError(error) {
  if (error.name === "AbortError" || error.name === "CanceledError") return;

  if (!navigator.onLine) {
    showError(MESSAGES.NO_INTERNET);
  } else if (error.response) {
    //Axios error
    showError(getHTTPErrorMessage(error.response.status));
  } else {
    //FETCH error or generic error
    showError(error.message || MESSAGES.UNEXPECTED_ERROR);
  }
}

// ===================================================
// 8. RENDERING LAYER
// ===================================================

//Display results, receives an object as param, easier to handle in the future
function displayResults({ items, totalItems, selectedType }) {
  resultsContainer.innerHTML = "";

  if (items.length === 0) {
    resultsContainer.innerText = MESSAGES.NO_ITEMS;
    return;
  }

  items.forEach((item) => {
    //1. We call element creator with params
    const card = createCardElement(item, selectedType);
    //2. Attach item to HTML container for display
    resultsContainer.appendChild(card);
  });

  setupPagination(totalItems, currentPage, paginationContainer, (newPage) => {
    currentPage = newPage;
    fetchData();
  });
}


