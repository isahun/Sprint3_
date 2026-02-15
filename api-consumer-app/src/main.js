"use strict"

import { default as axios } from "axios";
import "./style.css"

//----CONFIG CONSTANTS----//
const BASE_URL = "https://jsonplaceholder.typicode.com" //For bonus task: remove "/posts" at the end to leave baseURL & access other JSONPlaceholder APIs
let currentPage = 1;
const itemsPerPage = 10;

const cache = new Map(); //Map -->an object that can store collections of key-value pairs
const CACHE_TTL = 5 * 60 * 1000; //5 mins

//----DOM elements refs----//
const apiSelector = document.getElementById("fetch-method");
const searchInput = document.getElementById("search-input");
const fetchButton = document.getElementById("fetch-btn");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");
const apiTypeSelector = document.getElementById("api-type");

const noItemsMsg = "No s'han trobat resultats";

let currentController = null;


//----EVENT LISTENER----//
fetchButton.addEventListener("click", () => {
    currentPage = 1; //back to page one when user makes new petition
    fetchData();
});

apiTypeSelector.addEventListener("change", () => {
    currentPage = 1;
});

//----UI HELPERS----//

//Show loading element
function showLoading() {
    loadingElement.classList.remove("hidden");
}

//Hide loading element
function hideLoading() {
    loadingElement.classList.add("hidden");
}

//Show error message
function showError(error) {
    errorElement.textContent = error;
    errorElement.classList.remove("hidden");
}

//Hide error message
function hideError() {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
}

//----MAIN CONTROLLER----/
async function fetchData() {
    const searchTerm = searchInput.value.trim();
    const useAxios = apiSelector.value === "axios";

    let selectedType = apiTypeSelector.value;

    const endpointURL = `${BASE_URL}/${selectedType}`;

    //UI state (to implement)
    showLoading();
    hideError();

    //Clear previous content
    resultsContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    try {
        if (useAxios) {
            //call axios implementation
            await fetchDataWithAxios(endpointURL, searchTerm, selectedType);
        } else{
            //call fetch implementation
            await fetchDataWithFetch(endpointURL, searchTerm, selectedType);
        }
    } catch (error) {
        //handle unexpected errors
        showError("S'ha produït un error inesperat. Torna-ho a intentar.")
    } finally {
        hideLoading();
    }
}

//----RENDERING LAYER----//

//Display results
function displayResults(items, totalItems, selectedType) {
    resultsContainer.innerHTML = "";

    if (items.length === 0) {
        resultsContainer.innerText = noItemsMsg;
        return;
    } 

    items.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");

        if(selectedType === "posts") {
            renderPost(card, item);
        } else if (selectedType === "users") {
            renderUser(card, item);
        } else if (selectedType === "comments") {
            renderComment(card, item);
        }

        resultsContainer.appendChild(card);
        
    });

    setupPagination(totalItems);
}

//Pagination
function setupPagination(totalItems) {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        paginationContainer.style.display = "none";
        return;
    }

    paginationContainer.style.display = "flex";

    const { startPage, endPage } = calcStartEndPage(currentPage, totalPages);

    renderPrevBtn();
    renderNumBtn(startPage, endPage)
    renderNextBtn(totalPages);
}

//----API LAYER----//

//RETRY helpers - Fetch
async function fetchWithRetry(url, options, retries = 3, baseDelay = 500) {
    for (let attempt= 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);

            if(!response.ok) {
                throw new Error(getHTTPErrorMessage(response.status))
            }
            return response;
        } catch(error) {
            //No retry if manual abort
            if(error.name === "AbortError") {
                throw error;
            }

            //no retry, 404 errs already handled
            if (error.message?.startsWith("400") || error.message?.startsWith("404")){ 
                throw error;
            }

            //if last attempt --> throw error
            if(attempt === retries) {
                throw error;
            }
            //exponential backoff
            const delay = baseDelay * 2 ** attempt;
            const finalDelay = Math.random() * delay;
            await sleep(finalDelay);
        }
    }
}

//Retry helpers - AXIOS
async function axiosWithRetry(url, config, retries = 3, baseDelay = 500) {
    for (let attempt= 0; attempt <= retries; attempt++) {
        try {
            return await axios.get(url, config);

        } catch(error) {
            //No retry if manual abort
            if(error.name === "CanceledError") throw error;
            
            //no retry, 404 errs already handled
            const status = error.response?.status;

            //check both if status exists & < 500
            if (status && status < 500) throw error;

            //if last attempt --> throw error
            if(attempt === retries) throw error;

            //exponential backoff
            const delay = baseDelay * 2 ** attempt;
            const finalDelay = Math.random() * delay;
            
            await sleep(finalDelay);
        }
    }
}

//Get data with fetch
async function fetchDataWithFetch(endpointURL, searchTerm, selectedType) {
    const cacheKey = generateCacheKey("fetch", endpointURL, searchTerm, currentPage);
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry) {
        const isExpired = Date.now() - cachedEntry.timestamp > CACHE_TTL;
        if (!isExpired) {
            displayResults(cachedEntry.data, cachedEntry.totalItems, cachedEntry.selectedType);
            return;
        } 
        
        cache.delete(cacheKey);
    }

    if(currentController){
        currentController.abort();
    };

    currentController = new AbortController();

    try {
        const response = await fetchWithRetry(`${endpointURL}?_page=${currentPage}&_limit=${itemsPerPage}&q=${searchTerm}`, {
            signal: currentController.signal
        });
        
        const totalItems = Number(response.headers.get("X-Total-Count"));
        const data = await response.json();

        cache.set(cacheKey, {
            data,
            totalItems,
            selectedType,
            timestamp: Date.now()
        });

        displayResults(data, totalItems, selectedType);
        
        currentController = null;

    } catch(error){
        if (error.name === "AbortError") {
            return; //When cancelling, fetch delivers "abort error", which we don't need since it's a voluntary cancellation, not an error
        }

        if (!navigator.onLine) {
            showError("No tens connexió a internet.")
        } else {
        showError(error.message);
        }
        return;
    }
};

//Get data with axios
async function fetchDataWithAxios(endpointURL, searchTerm, selectedType) {
    const cacheKey = generateCacheKey("axios", endpointURL, searchTerm, currentPage);
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry) { // check if a cached response exists for this request
        const isExpired = Date.now() - cachedEntry.timestamp > CACHE_TTL;

        if (!isExpired) {
            displayResults(cachedEntry.data, cachedEntry.totalItems, cachedEntry.selectedType);
            return;
        } 
        
        cache.delete(cacheKey);
    }
    //No valid cache hit → proceed with network request
    
    if(currentController){
        currentController.abort();
    }

    currentController = new AbortController();

    try {
        const response = await axiosWithRetry(endpointURL, {
        params: {
            _page: currentPage,
            _limit: itemsPerPage,
            q: searchTerm
        },
        signal: currentController.signal
    });

    const totalItems = Number(response.headers["x-total-count"]);
    const data = response.data;

    cache.set(cacheKey, {
            data,
            totalItems,
            selectedType,
            timestamp: Date.now()
        });

    displayResults(data, totalItems, selectedType);

    currentController = null;

} catch (error) {
        if (error.name === "CanceledError") {
                return; //When cancelling, axios delivers "canceled error"
            };

        if(!navigator.onLine){
            showError("No tens connexió a internet.")
        } else if (error.response) {
            showError(getHTTPErrorMessage(error.response.status));
        } else {
            showError(error.message);
        }
        return;
    }
};

//----UTILS----//

//Get HTTP status
function getHTTPErrorMessage(status){
    if(status === 400) {
        return "400 Bad Request: La sol·licitud no és vàlida."
    }
    if(status === 404) {
        return "404 Not Found: El recurs sol·licitat no existeix."
    }
    if(status >= 500) {
        return "Error del servidor. Torna-ho a intentar."
    }

    return `Error HTTP ${status}`
};

//Generate Cache Key
function generateCacheKey(method, url, searchTerm, page) {
    return `${method}|${url}|${searchTerm}|${page}`;//what makes each call unique
};

//Render posts, users and comments
function renderPost(card, item) {
    const itemID = document.createElement("small");
    itemID.textContent = `ID del post: ${item.id}`;

    const itemTitle = document.createElement("h3");
    itemTitle.textContent = item.title;

    const itemBody = document.createElement("p");
    itemBody.textContent = item.body;

    card.appendChild(itemID);
    card.appendChild(itemTitle);
    card.appendChild(itemBody);
    };

function renderUser (card, item) {
    const itemID = document.createElement("small");
    itemID.textContent = `ID de l'usuari: ${item.id}`;

    const itemName = document.createElement("h3");
    itemName.textContent = item.name;

    const email = document.createElement("p");
    email.textContent = item.email;

    const companyName = document.createElement("p");
    companyName.textContent = `Empresa: ${item.company.name}`;

    card.appendChild(itemID);
    card.appendChild(itemName);
    card.appendChild(email);
    card.appendChild(companyName);
};

function renderComment (card, item) {
    const itemID = document.createElement("small");
    itemID.textContent = `ID: ${item.id}`;

    const itemName = document.createElement("h3");
    itemName.textContent = item.name;

    const email = document.createElement("small");
    email.textContent = `Email de l'autor: ${item.email}`;

    const itemBody = document.createElement("p");
    itemBody.textContent = item.body;

    const postId = document.createElement("small");
    postId.textContent = `ID del post relacionat: ${item.postId}`;

    card.appendChild(itemID);
    card.appendChild(itemName);
    card.appendChild(email);
    card.appendChild(itemBody);
    card.appendChild(postId);
};

//Pagination Util: Calc start page and end page to create btns
function calcStartEndPage(currentPage, totalPages) {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2); //2 pages at each side of the current

    let startPage = currentPage - half;
    let endPage = currentPage + half;

    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(totalPages, maxVisible);
    }

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, totalPages - maxVisible + 1);
    }

    return {startPage, endPage}
}

function renderPrevBtn() {
    if(currentPage <= 1) return;

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Anterior";

    prevBtn.addEventListener("click", () => {
        currentPage--;
        fetchData();
    });

    paginationContainer.appendChild(prevBtn)
};

function renderNumBtn(startPage, endPage) {
    for(let i = startPage; i <= endPage; i++) {
    
        const button = document.createElement("button");
        button.textContent = `${i}`;

        if (i === currentPage) {
            button.disabled = true;
        }

        button.addEventListener("click", () => {
            currentPage = i;
            fetchData();
        });

        paginationContainer.appendChild(button);
    };
}

function renderNextBtn(totalPages) {
    if(currentPage >= totalPages) return;


    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Següent";
    
    nextBtn.addEventListener("click", () => {
        currentPage++;
        fetchData();
    });

    paginationContainer.appendChild(nextBtn);
}

//Retry helper
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

