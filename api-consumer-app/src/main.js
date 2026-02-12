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


