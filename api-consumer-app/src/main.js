"use strict"

import { default as axios } from "axios";
import "./style.css"

//----CONFIG CONSTANTS----//
const API_URL = "https://jsonplaceholder.typicode.com/posts";
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

const noItemsMsg = "No s'han trobat resultats";

let currentController = null;


//----EVENT LISTENER----//
fetchButton.addEventListener("click", () => {
    currentPage = 1; //back to page one when user makes new petition
    fetchData();
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

    //UI state (to implement)
    showLoading();
    hideError();

    //Clear previous content
    resultsContainer.innerHTML = "";
    paginationContainer.innerHTML = "";

    try {
        if (useAxios) {
            //call axios implementation
            await fetchDataWithAxios(searchTerm);
        } else{
            //call fetch implementation
            await fetchDataWithFetch(searchTerm);
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
function displayResults(items, totalItems) {
    resultsContainer.innerHTML = "";

    if (items.length === 0) {
        resultsContainer.innerText = noItemsMsg;
        return;
    } 

    items.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const itemID = document.createElement("small");
        itemID.textContent = `${item.id}`;

        const itemTitle = document.createElement("h3");
        itemTitle.textContent = item.title;

        const itemBody = document.createElement("p");
        itemBody.textContent = item.body;

        card.appendChild(itemID);
        card.appendChild(itemTitle);
        card.appendChild(itemBody);

        resultsContainer.appendChild(card);
    });

    setupPagination(totalItems);
}

//Pagination
function setupPagination(totalItems) {
    paginationContainer.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if(totalPages === 0) return;

    for(let i = 1; i <= totalPages; i++) {
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

//----API LAYER----//

//Get data with fetch
async function fetchDataWithFetch(searchTerm) {
    const cacheKey = generateCacheKey("fetch", searchTerm, currentPage);
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry) {
        const isExpired = Date.now() - cachedEntry.timestamp > CACHE_TTL;
        if (!isExpired) {
            displayResults(cachedEntry.data, cachedEntry.totalItems);
            return;
        } 
        
        cache.delete(cacheKey);
    }

    if(currentController){
        currentController.abort();
    };

    currentController = new AbortController();

    try {
        const response = await fetch(`${API_URL}?_page=${currentPage}&_limit=${itemsPerPage}&q=${searchTerm}`, {
            signal: currentController.signal
        });
        
        if (!response.ok) {
            throw new Error(getHTTPErrorMessage(response.status));
        };
        const totalItems = Number(response.headers.get("X-Total-Count"));
        const data = await response.json();

        cache.set(cacheKey, {
            data,
            totalItems,
            timestamp: Date.now()
        });

        displayResults(data, totalItems);
        
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
async function fetchDataWithAxios(searchTerm) {
    const cacheKey = generateCacheKey("axios", searchTerm, currentPage);
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry) {
        const isExpired = Date.now() - cachedEntry.timestamp > CACHE_TTL;

        if (!isExpired) {
            displayResults(cachedEntry.data, cachedEntry.totalItems);
            return;
        } 
        
        cache.delete(cacheKey);
        
    }

    //if no valid cache:
    if(currentController){
        currentController.abort();
    }

    currentController = new AbortController();

    try {
        const response = await axios.get(API_URL, {
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
            timestamp: Date.now()
        });

    displayResults(data, totalItems);

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

function generateCacheKey(method, searchTerm, page) {
    return `${method}|${searchTerm}|${page}`;//what makes each call unique
}
