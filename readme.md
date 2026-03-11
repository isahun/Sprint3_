# 📡 API Consumer App (TypeScript Refactor)
_Modern API Data Consumption with Fetch, Axios, and Clean Architecture_

This project is an advanced front-end application focused on consuming data from an external API. It evolved from a basic Vanilla JavaScript script into a **fully typed, modular TypeScript application** implementing robust UI state management, clean architecture, and modern design patterns.

The application retrieves, filters, paginates, caches, and renders data dynamically from multiple API endpoints, handling network errors, cancellation, and retry logic with exponential backoff.

---

## 🎯 Learning Objectives & Advanced Concepts

This project goes beyond basic API fetching to practice software engineering principles:

- **Static Typing:** Full migration to **TypeScript** (Interfaces, Generics, Type Assertions, Utility Types).
- **Clean Architecture & SOLID:** Separation of concerns (SRP) dividing the app into API layer, UI components, services, and constants.
- **Design Patterns:** Implementation of the **Strategy Pattern** for dynamic UI rendering based on API types, eliminating "Feature Envy" and "Spaghetti Code".
- **CSS Architecture:** Modular CSS approach separating base styles, components, and utilities.
- **Advanced API Management:** - Dual implementation: **Fetch API** vs **Axios**.
  - In-memory caching with Time-To-Live (TTL).
  - Request cancellation using `AbortController` to prevent race conditions.
  - Custom retry logic with exponential backoff.

---

## 🌐 API

The application uses **JSONPlaceholder** (https://jsonplaceholder.typicode.com).

Supported endpoints dynamically handled by the Strategy Pattern:
- `/posts`
- `/users`
- `/comments`

Supported query parameters:
- `_page` → Page number  
- `_limit` → Number of items per page  
- `q` → Search term  

Pagination metadata is safely extracted from the `X-Total-Count` response header.

---

## 📂 Project Structure

The codebase is organized following a highly scalable modular structure:
```
api-consumer-app/
│
├── index.html
├── package.json
├── tsconfig.json
│
├── styles/                 # Modular CSS Architecture
│   ├── base.css            # Variables, reset, global typography
│   ├── components.css      # UI elements (cards, buttons, inputs)
│   ├── utilities.css       # Helper classes (.hidden, #error)
│   └── style.css           # Main CSS entry point
│
└── src/                    # TypeScript Source Code
    ├── api/
    │   ├── axiosClient.ts  # Axios wrapper with retry logic
    │   └── fetchClient.ts  # Fetch wrapper with retry logic
    │
    ├── components/
    │   ├── Pagination.ts   # Dynamic pagination rendering and logic
    │   └── ResultCard.ts   # Strategy Pattern for polymorphic card rendering
    │
    ├── constants/
    │   ├── config.ts       # Global settings (TTL, delays, endpoints)
    │   └── messages.ts     # Centralized UI text and error messages
    │
    ├── services/
    │   └── cacheService.ts # In-memory caching system with typed Map
    │
    ├── types/
    │   └── index.ts        # TypeScript Interfaces (ApiItem, Post, User, Comment)
    │
    ├── utils/
    │   └── errorHandlers.ts# Reusable error formatters and sleep utilities
    │
    └── main.ts             # Application Orchestrator / Entry point
```  
## 🧠 Architecture Overview

### 1️⃣ UI & Components Layer (`src/components/`)
- Strictly typed DOM manipulation.
- Uses a **Render Strategy Dictionary** (`renderStrategies`) in `ResultCard.ts` to automatically format cards depending on whether the data is a `Post`, `User`, or `Comment`.

### 2️⃣ Services Layer (`src/services/`)
- A decoupled Cache Service (`cacheService.ts`) handles data storage to prevent redundant network calls, completely separated from the fetching logic.

### 3️⃣ Network/API Layer (`src/api/`)
- Interchangeable clients (`axiosClient.ts` & `fetchClient.ts`).
- Handles endpoint URL construction, pagination parameters, request cancellation, HTTP error parsing, and recursive retry mechanisms.

### 4️⃣ Orchestrator (`main.ts`)
- Connects the DOM elements with the API and Services.
- Manages the global App State safely with static typing.

---

## ✅ Implemented Features

- **Fetch / Axios Selector:** Toggle between methods dynamically to observe differing network behaviors.
- **Multi-Endpoint Support:** Seamlessly switch between Posts, Users, and Comments.
- **Search:** Query parameters applied securely across all endpoints.
- **Dynamic Pagination:** Calculates total pages and generates interactive, accessible numeric buttons.
- **UI State Management:** Explicit, accessible handling of Loading, Empty, and Error states.
- **Request Cancellation:** Outdated requests are aborted instantly when new ones are triggered.
- **In-Memory Cache System:** Prevents redundant fetching using a structured `Map` with TTL invalidation.
- **Retry System (Exponential Backoff):** Network failures trigger a progressive retry system, preventing server flooding.

---

## ⚖️ Fetch vs Axios – Observations

The project highlights practical differences between the two clients:

| Feature | Fetch | Axios |
|----------|--------|--------|
| HTTP error handling | Manual (`!response.ok` throws) | Automatic (throws on 4xx/5xx) |
| Header access | `response.headers.get()` | `response.headers[]` |
| JSON parsing | Manual (`await response.json()`) | Automatic |
| Query parameters | Manual URL parameters | Native `params` object |
| TypeScript typing| Requires manual casting | Native generics support |

---

## 🛠️ Tech Stack & Tools

- **Language:** TypeScript / HTML5 / CSS3
- **Bundler:** Vite
- **HTTP Clients:** Native Fetch API, Axios
- **Code Quality:** Strict Mode TypeScript

---


##### Irene V. Sahun - GitHub: isahun 

##### Created as part of the IT Academy Frontend BootCamp.