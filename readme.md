# 📡 API Consumer App  
_API Data Consumption with Fetch and Axios_

This project is an academic exercise focused on consuming data from an external API using both **Fetch API** and **Axios**.

The goal is to build a small web application that retrieves, displays, filters, and paginates data while managing different UI states such as loading and error handling.

---

## 🎯 Learning Objectives

By developing this project, the following skills are intended to be practiced:

- Setting up a basic web project (HTML, CSS, JavaScript)
- Performing HTTP requests using **Fetch API**
- Performing HTTP requests using **Axios**
- Managing UI states (loading, results, errors)
- Implementing search functionality
- Implementing pagination logic
- Observing structural differences between Fetch and Axios

---

## 🌐 API

The application will use the public testing API:

**JSONPlaceholder – Posts Endpoint**

https://jsonplaceholder.typicode.com/posts

Supported query parameters:

- `_page` → Page number
- `_limit` → Number of items per page
- `q` → Search term
- `X-Total-Count` → Total number of items (returned in response headers)

---

## 📂 Project Structure

```
api-consumer-app/
│
├── index.html
├── styles.css
└── main.js
```

---

## 🧱 Planned Application Structure

### HTML (index.html)

The structure will include:

- Main container wrapping the entire application
- Header with:
  - Main title
  - Controls section containing:
    - API selector (Fetch / Axios)
    - Search input
    - "Get Data" button
- Main content section containing:
  - Loading indicator
  - Error message container
  - Results container
  - Pagination container

---

### CSS (styles.css)

Planned styling includes:

- Global body styling (typography, spacing, layout width)
- `.container` layout wrapper
- Flexbox alignment for controls
- `.hidden` utility class
- Loading and error styling
- Results grid using:

```css
grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
```

- Card styling:
  - Border
  - Shadow
  - Padding
  - Hover effect
- Pagination button styling including `:disabled` state

---

## 🧠 Application Logic (main.js)

### Core Constants & State

```js
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
let currentPage = 1;
const itemsPerPage = 10;
```

DOM references will be obtained for:

- API selector
- Search input
- Fetch button
- Loading element
- Error element
- Results container
- Pagination container

---

### Planned Features

#### 1️⃣ Technology Selector

Users will be able to choose between:

- Fetch
- Axios

The selected option will determine which request method is executed.

---

#### 2️⃣ Search Functionality

The search input will filter posts using the `q` query parameter.

---

#### 3️⃣ Pagination

- 10 items per page
- Total pages calculated using:

```js
Math.ceil(totalItems / itemsPerPage)
```

- Active page button will be disabled

---

#### 4️⃣ UI State Management

Planned state handling functions:

- `showLoading()`
- `hideLoading()`
- `showError(message)`
- `hideError()`
- `displayResults(items, totalItems)`
- `setupPagination(totalItems)`

---

## 🔹 Fetch Implementation (Planned)

- Perform GET request using `fetch()`
- Manually validate HTTP status using `response.ok`
- Parse JSON using `.json()`
- Extract total items from:

```js
response.headers.get('X-Total-Count')
```

- Handle errors manually

---

## 🔹 Axios Implementation (Planned)

- Perform GET request using `axios.get()`
- Pass query parameters using `params` object
- Access headers via:

```js
response.headers['x-total-count']
```

- Handle errors using `try...catch`

---

## ⚖️ Fetch vs Axios (Exploration Goal)

This project aims to observe practical differences between:

- Native Fetch API
- Axios library abstraction

The comparison will focus on:

- Error handling behavior
- Header access
- Query parameter handling
- JSON parsing
- Code readability and structure

---

## 🚀 Optional Extensions

Potential additional improvements:

- Advanced HTTP error messages
- Basic caching mechanism
- Request cancellation (AbortController)
- Support for custom API URLs
- Retry logic with exponential backoff

---

## 🛠️ Development Tools

Recommended tools during development:

- Browser DevTools (Network tab)
- Browser Console
- MDN documentation for Fetch
- Axios official documentation

---

## 📌 Project Status

Repository initialized.  
Implementation in progress.

---

## 👩‍💻 Author

Academic practice project focused on API consumption using JavaScript.
