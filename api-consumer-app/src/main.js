"use strict"

import "./style.css"

const API_URL = "https://jsonplaceholder.typicode.com/posts";
let currentPage = 1;
const itemsPerPage = 10;

//DOM elements refs
const apiSelector = document.getElementById("fetch-method");
const searchInput = document.getElementById("search-input");
const fetchButton = document.getElementById("fetch-btn");
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error");
const resultsContainer = document.getElementById("results");
const paginationContainer = document.getElementById("pagination");

const noItemsMsg = "No s'han trobat resultats";


//Event listener

fetchButton.addEventListener("click", fetchData);

//Show loading element
function showLoading() {
    loadingElement.classList.remove("hidden");
}

//Hide loading element
function hideLoading() {
    loadingElement.classList.add("hidden");
}

//Show error message
function showError(errorMsg) {
    errorElement.textContent = errorMsg;
    errorElement.classList.remove("hidden");
}

//Hide error message
function hideError() {
    errorElement.textContent = "";
    errorElement.classList.add("hidden");
}

//Main fetch function
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

//Display results & pagination
function displayResults(items, totalItems) {
    resultsContainer.innerHTML = "";

    if (items.length === 0) {
        resultsContainer.innerText = noItemsMsg;
        return;
    } 

    items.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("card");

        const itemTitle = document.createElement("h3");
        itemTitle.textContent = item.title;

        const itemID = document.createElement("small");
        itemID.textContent = `${item.id}`;

        const itemBody = document.createElement("p");
        itemBody.textContent = item.body;


        card.appendChild(itemTitle);
        card.appendChild(itemID);
        card.appendChild(itemBody);

        resultsContainer.appendChild(card);
    });

    setupPagination(totalItems);
}

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


//Get data through fetch
async function fetchDataWithFetch(searchTerm) {
    
    try {
        const response = await fetch(`${API_URL}?_page=${currentPage}&_limit=${itemsPerPage}&q=${searchTerm}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        };
        const totalItems = Number(response.headers.get("X-Total-Count"));
        const data = await response.json();

        displayResults(data, totalItems);

    } catch(error){
        showError(error.message);
        return;
    }
};

//Get data through axios
async function fetchDataWithAxios(searchTerm) {
    try {
        const response = await axios.get(API_URL, {
        params: {
            _page: currentPage,
            _limit: itemsPerPage,
            q: searchTerm
        }
    });

    const totalItems = Number(response.headers["x-total-count"]);
    const data = response.data;

    displayResults(data, totalItems);

} catch (error) {
        showError(error.response?.statusText || error.message);
        return;
    }
};

