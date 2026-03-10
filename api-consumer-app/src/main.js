"use strict";

import { default as axios } from "axios";
import "./style.css";



// ===========================================
// 2. APP STATE
// ============================================

let currentPage = 1;
let currentController = null;

// ============================================================================
// 3. DOM ELEMENTS
// ============================================================================

const fetchMethodSelect = document.getElementById("fetch-method");
const apiTypeSelect = document.getElementById("api-type");
const searchInput = document.getElementById("search-input");
const fetchButton = document.getElementById("fetch-btn");
const loadingContainer = document.getElementById("loading");
const errorContainer = document.getElementById("error");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

// ============================================================================
// 4. EVENT LISTENER
// ============================================================================

fetchButton.addEventListener("click", () => {
  currentPage = 1; //back to page one when user makes new petition
  fetchData();
});

apiTypeSelect.addEventListener("change", () => {
  currentPage = 1;
});

// ============================================================================
// 5. UI HELPERS
// ============================================================================

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

// ============================================================================
// 6. MAIN CONTROLLER
// ============================================================================
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

// ============================================================================
// 7. RENDERING LAYER
// ============================================================================

//Display results, receives an object as param, easier to handle in the future
function displayResults({ items, totalItems, selectedType }) {
  resultsContainer.innerHTML = "";

  if (items.length === 0) {
    resultsContainer.innerText = MESSAGES.NO_ITEMS;
    return;
  }

  //Fix "feature envy" and "switch statements" using DICTIONARY (Strategy Pattern for rendering). Instead of multiple ifs, app goes to dictionary, seeks right recipe (selected type), and applies saved pattern to paint each option
  const renderStrategies = {
    [API_TYPES.POSTS]: (item) => `
    <small class="card-ID">Post ID: ${item.id} </small>
    <h3 class="card-title">${item.title}</h3>
    <p class="card-body">${item.body}</p>
    `,
    [API_TYPES.USERS]: (item) => `
    <small class="card-ID">User ID: ${item.id}</small>
    <h3 class="card-title">${item.name}</h3>
    <p class="card-email">${item.email}</p>
    <p class="card-company">Company: ${item.company.name}</p>
    `,
    [API_TYPES.COMMENTS]: (item) => `
    <small class="card-ID">ID: ${item.id}</small>
    <h3 class="card-title">${item.name}</h3>
    <small class="card-email">Author Email: ${item.email}</small>
    <p class="card-body">${item.body}</p>
    <small class="card-ID">Related Post ID: ${item.postId}</small>
    `,
  };

  items.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("card");

    //find and execute proper strategy matching selectedType (paint users, comments or posts)
    const renderContent = renderStrategies[selectedType];

    if (renderContent) {
      //we execute strategy passing item as param, without knowing its exact properties
      card.innerHTML = renderContent(item);
    }

    resultsContainer.appendChild(card);
  });

  setupPagination(totalItems);
}

//Pagination
function setupPagination(totalItems) {
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }

  paginationContainer.style.display = "flex";
  const { startPage, endPage } = calcStartEndPage(currentPage, totalPages);

  //Unify pagination buttons in 1 function to fix duplicate logic
  if (currentPage > 1) {
    createPaginationButton(
      MESSAGES.BTN_PREV,
      currentPage - 1,
      "pagination-btn",
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    createPaginationButton(
      i.toString(),
      i,
      "pagination-active",
      i === currentPage,
    );
  }

  if (currentPage < totalPages) {
    createPaginationButton(
      MESSAGES.BTN_NEXT,
      currentPage + 1,
      "pagination-btn",
    );
  }
}

function createPaginationButton(
  text,
  targetPage,
  className,
  isDisabled = false,
) {
  const button = document.createElement("button");
  button.classList.add(className);
  button.textContent = text;
  button.disabled = isDisabled;
  button.ariaLabel =
    typeof text === "number" || !isNaN(text)
      ? `${MESSAGES.PAGE_ARIA} ${text}`
      : text;

  button.addEventListener("click", () => {
    currentPage = targetPage;
    fetchData();
  });

  paginationContainer.appendChild(button);
}

//Pagination Util: Calc start page and end page to create btns
function calcStartEndPage(currentPage, totalPages) {
  const half = Math.floor(MAX_VISIBLE_PAGES / 2); //2 pages at each side of the current

  let startPage = currentPage - half;
  let endPage = currentPage + half;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(totalPages, MAX_VISIBLE_PAGES);
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - MAX_VISIBLE_PAGES + 1);
  }

  return { startPage, endPage };
}

//=====================================================================
// 8. API LAYER
//=====================================================================
// Fix according to DRY, this function replaces getDataWithAxios and getDataWith Fetch: check cache, AbortController and send results to screen
async function performApiRequest(
  endpointURL,
  searchTerm,
  selectedType,
  useAxios,
) {
  const methodStr = useAxios ? FETCH_METHODS.AXIOS : FETCH_METHODS.FETCH;
  const cacheKey = generateCacheKey(
    methodStr,
    endpointURL,
    searchTerm,
    currentPage,
  );
  const cachedEntry = cache.get(cacheKey);

  //1. Check cache: check if a cached response exists for this request
  if (cachedEntry) {
    const isExpired = Date.now() - cachedEntry.timestamp > CACHE_TTL_MS;
    if (!isExpired) {
      displayResults({
        items: cachedEntry.data,
        totalItems: cachedEntry.totalItems,
        selectedType: cachedEntry.selectedType,
      });
      return;
    }
    cache.delete(cacheKey); //clear expired cache
  }

  //If no valid cache hit → abort prev req → proceed with network request

  //2. Abort previous requests
  if (currentController) {
    currentController.abort();
  }

  currentController = new AbortController();

  //3. Perform network request
  try {
    let data, totalItems;
    //delegate decision on which library to use
    if (useAxios) {
      const response = await axiosWithRetry(endpointURL, {
        params: { _page: currentPage, _limit: ITEMS_PER_PAGE, q: searchTerm },
        signal: currentController.signal,
      });
      totalItems = Number(response.headers["x-total-count"]);
      data = response.data;
    } else {
      const response = await fetchWithRetry(
        `${endpointURL}?_page=${currentPage}&_limit=${ITEMS_PER_PAGE}&q=${searchTerm}`,
        {
          signal: currentController.signal,
        },
      );
      totalItems = Number(response.headers.get("X-Total-Count"));
      data = await response.json();
    }

    //4. Save to Cache & Display
    cache.set(cacheKey, {
      data,
      totalItems,
      selectedType,
      timestamp: Date.now(),
    });
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


//Generate Cache Key
function generateCacheKey(method, url, searchTerm, page) {
  return `${method}|${url}|${searchTerm}|${page}`; //what makes each call unique
}


