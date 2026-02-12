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


//Event listener

fetchButton.addEventListener("click", () => {
    fetchData();
})

//Main fetch function
async function fetchData() {
    const searchTerm = searchInput.value.trim();
    const useAxios = apiSelector.value === "axios";

    //UI state (to implement)
    //showLoading();
    //hideError();

    //Clear previous content
    resultsContainer.innerText = "";
    paginationContainer.innerText = "";

    try {
        if (useAxios) {
            //call axios implementation
        } else{
            //call fetch implementation
        }
    } catch (error) {
        //handle unexpected errors
    } finally {
        //hideLoading();
    }
}