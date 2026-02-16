# 📡 API Consumer App  
_API Data Consumption with Fetch and Axios_

This project is an academic front-end exercise focused on consuming data from an external API using both **Fetch API** and **Axios**, while implementing robust UI state management and client-side architecture patterns.

The application retrieves, filters, paginates, caches, and renders data dynamically from multiple API endpoints, handling network errors, cancellation, and retry logic.

---

## 🎯 Learning Objectives

This project practices and consolidates:

- Structuring a small front-end application (HTML, CSS, JavaScript)
- Performing HTTP requests using **Fetch API**
- Performing HTTP requests using **Axios**
- Managing UI states (loading, empty results, errors)
- Implementing search functionality
- Implementing dynamic pagination
- Handling HTTP and network errors
- Cancelling in-flight requests using `AbortController`
- Implementing in-memory caching with expiration (TTL)
- Supporting multiple API endpoints dynamically
- Implementing retry logic with exponential backoff

---

## 🌐 API

The application uses:

**JSONPlaceholder**

https://jsonplaceholder.typicode.com

Supported endpoints:

- `/posts`
- `/users`
- `/comments`

Supported query parameters:

- `_page` → Page number  
- `_limit` → Number of items per page  
- `q` → Search term  

Pagination metadata is extracted from:

X-Total-Count (response header)


---

## 📂 Project Structure

api-consumer-app/
│
├── index.html
├── style.css
└── main.js


---

## 🧠 Architecture Overview

The application is structured in logical layers:

### 1️⃣ UI Layer

Handles:
- Loading state
- Error state
- Rendering results
- Rendering pagination controls

Functions:
- `showLoading()`
- `hideLoading()`
- `showError()`
- `hideError()`
- `displayResults()`
- `setupPagination()`

---

### 2️⃣ Controller Layer

Responsible for:

- Reading user input
- Selecting request method (Fetch / Axios)
- Selecting API endpoint
- Resetting page state
- Triggering data fetch

Main function:
fetchData()


---

### 3️⃣ API Layer

Two interchangeable implementations:

- `fetchDataWithFetch()`
- `fetchDataWithAxios()`

Both:
- Build dynamic endpoint URLs
- Apply pagination and search parameters
- Handle cancellation
- Handle HTTP errors
- Store results in cache
- Forward data to rendering layer

---

## ✅ Implemented Features

---

### 🔹 Fetch / Axios Selector

Users can dynamically choose the request method.

This allows direct comparison of:

- Error handling behavior
- Header access
- Query parameter handling
- Response parsing

---

### 🔹 Multi-Endpoint Support

Users can switch between:

- Posts
- Users
- Comments

Each endpoint has a dedicated renderer:

- `renderPost()`
- `renderUser()`
- `renderComment()`

Rendering is decoupled from request logic.

---

### 🔹 Search

Implemented using the `q` query parameter.

Works across all supported endpoints.

---

### 🔹 Pagination

- Configurable `itemsPerPage`
- Total pages calculated via:
Math.ceil(totalItems / itemsPerPage)

- Displays:
- Previous button
- Numeric buttons (limited window of 5)
- Next button
- Pagination hidden when unnecessary

---

### 🔹 UI State Management

Explicit handling of:

- Loading indicator
- Empty results message
- Network errors
- HTTP status errors
- Request cancellation

---

### 🔹 Request Cancellation

Implemented using:

AbortController

Behavior:
- Ongoing request is cancelled when a new request is triggered
- Prevents race conditions
- Avoids outdated UI rendering

---

### 🔹 In-Memory Cache System

Implemented using:

Map()

Cache key includes:

- Request method
- Endpoint
- Search term
- Page number

Features:
- Time-based expiration (TTL)
- Prevents redundant network calls
- Automatically invalidates expired entries

---

### 🔹 Retry System (Exponential Backoff)

Implements retry logic for failed network requests.

Features:

- Exponential delay
- Optional jitter to reduce collision risk
- Configurable retry attempts
- Only retries network failures (not HTTP errors)

Improves resilience in unstable network environments.

---

## ⚖️ Fetch vs Axios – Observations

The project highlights practical differences:

| Feature | Fetch | Axios |
|----------|--------|--------|
| HTTP error handling | Manual (`response.ok`) | Automatic (throws error) |
| Header access | `response.headers.get()` | `response.headers[]` |
| JSON parsing | Manual (`.json()`) | Automatic |
| Query parameters | Manual string build | `params` object |
| Cancellation | `AbortController` | `AbortController` |

---

## 🛠️ Development Tools

- Browser DevTools (Network tab & Console)
- MDN Web Docs
- Axios Documentation

---

## 📌 Current Status

Core features implemented.

Includes:

- Multi-endpoint support
- Pagination
- Search
- Cache system
- Cancellation
- Retry with exponential backoff
- Advanced error handling

Project complete and fully functional.

---

## 👩‍💻 Author

Academic front-end practice project focused on robust API consumption patterns and clean client-side architecture in JavaScript.