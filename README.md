# Cash Flow Simplification

This project is a Data Structures and Algorithms web application that compares four different ways to solve the same problem: reducing a list of payments into the minimum or simplified set of final settlements.

For example, if several friends paid each other during a trip, the app calculates who finally owes whom after all transactions are balanced.

Live Demo: https://cash-flow-simplification.vercel.app/

## What This Project Does

The application lets a user:

- Add transactions between people.
- Load sample transaction data.
- View the original transaction graph.
- Run four different algorithms on the same input.
- Compare the number of settlements produced by each algorithm.
- View simplified settlement results.
- Read explanations and walkthroughs for each algorithm.

The goal is not only to get the final answer, but also to show how different data structures can be used to approach the same problem.

## Algorithms Implemented

| Algorithm | Main Idea | Data Structures Used | Time Complexity |
| --- | --- | --- | --- |
| Greedy Two-Pointer | Match debtors and creditors after sorting balances | Map, Vector, Sorting | O(n log n) |
| DFS Graph Traversal | Treat transactions as a graph and use DFS-style traversal | Graph, Adjacency List, Map | O(V + E) |
| Union-Find | Group connected people and solve each component | Disjoint Set Union, Map | O(n alpha(n)) |
| Min-Heap Priority Queue | Use heaps to repeatedly match debtors and creditors | Priority Queue, Map | O(n log n) |

## Project Flow

1. The user enters transactions in the browser.
2. The frontend sends the transaction list to the Express backend using JSON.
3. The backend converts the JSON data into the input format expected by the C++ programs.
4. The backend runs the compiled C++ algorithm executables.
5. Each C++ program calculates settlements and prints results.
6. The backend parses that output and sends JSON back to the frontend.
7. The frontend displays settlements, statistics, comparisons, and graph visualizations.

## Project Structure

```text
ds-cp-main/
├── cpp/
│   ├── algorithm1-greedy.cpp
│   ├── algorithm2-dfs.cpp
│   ├── algorithm3-unionfind.cpp
│   ├── algorithm4-heap.cpp
│   ├── Makefile
│   └── bin/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── assets/
│   │   └── test-cases.json
│   └── js/
│       ├── main.js
│       └── visualization.js
├── scripts/
│   └── build.js
├── server.js
├── package.json
└── README.md
```

## Main Files Explained

`server.js`

Runs the Express server, serves the frontend, accepts API requests, executes the C++ algorithms, and returns parsed JSON results.

`scripts/build.js`

Compiles all four C++ algorithm files into executable files inside `cpp/bin`. This script works better on Windows than relying only on `make`.

`public/index.html`

Contains the main page structure: input form, graph section, algorithm cards, comparison table, explanations, and walkthrough modal.

`public/js/main.js`

Handles user interactions such as adding transactions, clearing data, running algorithms, displaying results, showing toasts, and updating the comparison table.

`public/js/visualization.js`

Builds the original and simplified transaction graphs using Vis.js.

`public/styles.css`

Contains the full UI styling, including the dark theme, responsive layout, cards, buttons, transaction rows, toast messages, modals, and graph containers.

`cpp/*.cpp`

Each file contains one algorithm implementation written in C++.

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/test` | Check whether the server is running |
| POST | `/api/algorithm/1` | Run Greedy Two-Pointer algorithm |
| POST | `/api/algorithm/2` | Run DFS Graph Traversal algorithm |
| POST | `/api/algorithm/3` | Run Union-Find algorithm |
| POST | `/api/algorithm/4` | Run Min-Heap Priority Queue algorithm |
| POST | `/api/algorithms/all` | Run all four algorithms together |

## How To Run

Install dependencies:

```powershell
npm install
```

Compile the C++ algorithms:

```powershell
npm run build
```

Start the project normally:

```powershell
npm start
```

For development with auto-restart:

```powershell
npm run dev
```

Open the app:

```text
http://localhost:3000/
```

## What Was Improved

The project was updated to make it easier to run and better to use:

- Replaced the old build command with a Node-based build script.
- Fixed Algorithm 4 so it compiles correctly with the installed MinGW compiler.
- Updated the backend to run C++ executables in a Windows-friendly way.
- Added cleaner transaction rows in the UI.
- Replaced browser alerts with styled toast messages.
- Added a styled confirmation modal for clearing transactions.
- Added a loading spinner when algorithms are running.
- Added active navigation highlighting.
- Added best-result highlighting in the comparison table.
- Reduced some visual glow intensity for a cleaner presentation.

## Learning Outcomes

This project demonstrates:

- Hash maps for balance calculation.
- Sorting and two-pointer matching.
- Graph representation and traversal.
- Union-Find for connected components.
- Priority queues and heap-based matching.
- Time and space complexity comparison.
- Connecting a JavaScript frontend, Node.js backend, and C++ programs.

## Requirements

- Node.js
- npm
- g++ compiler

On Windows, MinGW g++ can be used.
