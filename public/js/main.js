let transactions = [];
let allResults = {};
let netBalances = {};

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3200);
}

function showConfirm(message, onConfirm) {
  let modal = document.getElementById("confirm-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "confirm-modal";
    modal.className = "confirm-modal";
    modal.innerHTML = `
      <div class="confirm-dialog">
        <h3>Confirm Action</h3>
        <p id="confirm-message"></p>
        <div class="confirm-actions">
          <button type="button" class="btn btn-secondary" id="confirm-cancel">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirm-ok">Clear</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.querySelector("#confirm-message").textContent = message;
  modal.classList.add("show");

  const close = () => modal.classList.remove("show");
  const confirm = () => {
    close();
    onConfirm();
  };

  const cancelButton = modal.querySelector("#confirm-cancel");
  const okButton = modal.querySelector("#confirm-ok");

  cancelButton.onclick = close;
  okButton.onclick = confirm;
  modal.onclick = (event) => {
    if (event.target === modal) close();
  };
}

function addTransaction() {
  const from = document.getElementById("fromInput").value.trim();
  const to = document.getElementById("toInput").value.trim();
  const amount = parseInt(document.getElementById("amountInput").value);

  if (!from || !to || !amount || amount <= 0) {
    showToast("Please fill all fields with a valid amount.", "error");
    return;
  }

  if (from === to) {
    showToast("From and To names must be different.", "error");
    return;
  }

  transactions.push({ from, to, amount });

  // Clear inputs
  document.getElementById("fromInput").value = "";
  document.getElementById("toInput").value = "";
  document.getElementById("amountInput").value = "";

  updateUI();
  showToast("Transaction added.", "success");
}

function removeTransaction(index) {
  transactions.splice(index, 1);
  updateUI();
}

function clearAll() {
  if (transactions.length === 0) {
    showToast("There are no transactions to clear.", "info");
    return;
  }

  showConfirm("Clear all transactions and current results?", () => {
    transactions = [];
    updateUI();
    showToast("All transactions cleared.", "success");
  });
}

function loadSampleData() {
  transactions = [
    { from: "Sahil", to: "Sanskar", amount: 50 },
    { from: "Sanskar", to: "Sarthak", amount: 30 },
    { from: "Sarthak", to: "Rohan", amount: 25 },
    { from: "Rohan", to: "Sahil", amount: 15 },
    { from: "Sahil", to: "Sarthak", amount: 20 },
  ];
  updateUI();
}

function calculateNetBalances() {
  netBalances = {};
  transactions.forEach((t) => {
    if (!netBalances[t.from]) netBalances[t.from] = 0;
    if (!netBalances[t.to]) netBalances[t.to] = 0;
    netBalances[t.from] -= t.amount;
    netBalances[t.to] += t.amount;
  });
}

function displayTransactions() {
  const list = document.getElementById("transactions-list");

  if (transactions.length === 0) {
    list.innerHTML = `
            <h3>Current Transactions (0)</h3>
            <p class="empty-message">No transactions added yet</p>
        `;
    refreshIcons();
    return;
  }

  let html = `<h3>Current Transactions (${transactions.length})</h3>`;
  html += '<div class="transaction-items">';

  transactions.forEach((t, i) => {
    html += `
            <div class="transaction-row">
                <div class="transaction-index">${i + 1}</div>
                <div class="transaction-person">
                    <span class="transaction-label">From</span>
                    <strong>${escapeHTML(t.from)}</strong>
                </div>
                <div class="transaction-arrow" aria-hidden="true">&rarr;</div>
                <div class="transaction-person">
                    <span class="transaction-label">To</span>
                    <strong>${escapeHTML(t.to)}</strong>
                </div>
                <div class="transaction-amount">$${escapeHTML(t.amount)}</div>
                <button onclick="removeTransaction(${i})" class="btn btn-icon danger-soft" title="Remove transaction">
                    <i data-lucide="x" class="icon-xs"></i>
                    <span class="sr-only">Remove transaction</span>
                </button>
            </div>
        `;
  });

  html += "</div>";
  list.innerHTML = html;
  refreshIcons();
}

async function runAllAlgorithms(button) {
  if (transactions.length === 0) {
    showToast("Please add at least one transaction first.", "error");
    return;
  }

  // Show loading state on the passed button element
  if (button && typeof button === "object") {
    button.disabled = true;
    button.dataset.originalHtml = button.innerHTML;
    button.classList.add("is-loading");
    button.innerHTML =
      '<span class="spinner" aria-hidden="true"></span> Running algorithms...';
  }

  try {
    const response = await fetch("/api/algorithms/all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions }),
    });
    // Provide a more informative error when server responds with non-2xx
    if (!response.ok) {
      let msg = "Server error";
      try {
        // try parse JSON body
        const data = await response.json();
        msg = data.error || JSON.stringify(data);
      } catch (e) {
        // fallback to plain text
        try {
          msg = await response.text();
        } catch (e2) {}
      }
      throw new Error(msg || "Server error");
    }

    allResults = await response.json();
    displayResults();
    displayComparison();
    drawGraphs();
    showToast("Algorithms completed successfully.", "success");
  } catch (error) {
    showToast("Error running algorithms: " + error.message, "error");
  } finally {
    if (button && typeof button === "object") {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.innerHTML =
        button.dataset.originalHtml ||
        '<i data-lucide="play" class="icon-btn"></i> Run All Algorithms';
      delete button.dataset.originalHtml;
      refreshIcons();
    }
  }
}

function displayResults() {
  for (let i = 1; i <= 4; i++) {
    const result = allResults.algorithms[i];
    const resultsDiv = document.getElementById(`algo${i}-results`);
    const statsDiv = document.getElementById(`algo${i}-stats`);

    if (result.error) {
      resultsDiv.innerHTML = `<p class="result-error">Error: ${escapeHTML(
        result.error
      )}</p>`;
      statsDiv.innerHTML = "";
      continue;
    }

    // Display settlements
    if (result.settlements && result.settlements.length > 0) {
      resultsDiv.innerHTML = result.settlements
        .map(
          (s) =>
            `<p class="settlement-row"><i data-lucide="credit-card" class="icon-xs"></i>${escapeHTML(
              s
            )}</p>`
        )
        .join("");
    } else {
      resultsDiv.innerHTML =
        '<p style="color: #9ca3af;">All balanced (0 settlements needed)</p>';
    }

    // Display stats
    const metadata = result.metadata;
    let statsHtml = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                <div><strong>Settlements:</strong> ${
                  metadata.settlements || 0
                }</div>
                <div><strong>Original Txs:</strong> ${
                  metadata.originalTransactions || 0
                }</div>
                <div><strong>Complexity:</strong> ${
                  metadata.timeComplexity || "N/A"
                }</div>
        `;

    if (metadata.components) {
      statsHtml += `<div><strong>Components:</strong> ${metadata.components}</div>`;
    }

    statsHtml += "</div>";
    statsDiv.innerHTML = statsHtml;
  }

  refreshIcons();
}

function displayComparison() {
  const tbody = document.getElementById("comparison-body");
  const comparisonRows = [];
  const algorithmNames = [
    "Greedy Two-Pointer",
    "DFS Graph Traversal",
    "Union-Find",
    "Min-Heap Priority Queue",
  ];

  for (let i = 1; i <= 4; i++) {
    const result = allResults.algorithms[i];
    if (result.error) continue;

    const metadata = result.metadata;
    const settlements = metadata.settlements || 0;
    const original = metadata.originalTransactions || 0;
    const reduction =
      original > 0
        ? (((original - settlements) / original) * 100).toFixed(1)
        : 0;

    comparisonRows.push({
      name: algorithmNames[i - 1],
      settlements,
      original,
      reduction,
      timeComplexity: metadata.timeComplexity || "N/A",
      spaceComplexity: metadata.spaceComplexity || "N/A",
    });
  }

  const bestSettlements =
    comparisonRows.length > 0
      ? Math.min(...comparisonRows.map((row) => row.settlements))
      : null;

  const rows = comparisonRows
    .map((row) => {
      const isBest = row.settlements === bestSettlements;
      return `
            <tr class="${isBest ? "best-row" : ""}">
                <td><strong>${row.name}</strong>${
        isBest ? '<span class="best-badge">Best</span>' : ""
      }</td>
                <td>${row.settlements}</td>
                <td>${row.original}</td>
                <td>${row.reduction}% reduction</td>
                <td>${row.timeComplexity}</td>
                <td>${row.spaceComplexity}</td>
            </tr>
        `;
    })
    .join("");

  tbody.innerHTML =
    rows || '<tr><td colspan="6">Run algorithms to see comparison</td></tr>';
}

function updateUI() {
  calculateNetBalances();
  displayTransactions();
  drawGraphs();

  // Clear previous results
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`algo${i}-results`).innerHTML =
      '<p class="placeholder">Run algorithms to see results</p>';
    document.getElementById(`algo${i}-stats`).innerHTML = "";
  }
  document.getElementById("comparison-body").innerHTML =
    '<tr><td colspan="6">Run algorithms to see comparison</td></tr>';
  refreshIcons();
}

function initActiveNavigation() {
  const links = Array.from(document.querySelectorAll(".navbar a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function showWalkthrough(algoNum) {
  const algorithmNames = [
    "Greedy Two-Pointer Algorithm",
    "DFS Graph Traversal Algorithm",
    "Union-Find Algorithm",
    "Min-Heap Priority Queue Algorithm",
  ];

  const descriptions = [
    `
        <h3>Greedy Two-Pointer Walkthrough</h3>
        <p><strong>Algorithm:</strong> Sorts net balances and uses two pointers to match debtors with creditors.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Calculate net balance for each person
2. Create vector with non-zero balances
3. Sort by amount (debtors first, creditors last)
4. Set left=0, right=size-1
5. While left < right:
   a. Calculate settlement amount
   b. Record settlement
   c. Move appropriate pointer
6. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Map (hash), Vector (array), Sorting</p>
        <p><strong>Time Complexity:</strong> O(n log n) due to sorting</p>
        <p><strong>Best for:</strong> Quick, simple solutions</p>
        `,
    `
        <h3>DFS Graph Traversal Walkthrough</h3>
        <p><strong>Algorithm:</strong> Builds a directed graph and uses DFS to find settlement paths.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Build adjacency list from transactions
2. Calculate net balances
3. For each debtor:
   a. Use DFS to find creditor paths
   b. Settle along path
   c. Mark visited nodes
   d. Continue until balanced
4. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Adjacency List (graph), Map, Stack (recursion)</p>
        <p><strong>Time Complexity:</strong> O(V + E) where V=people, E=transactions</p>
        <p><strong>Best for:</strong> Understanding payment paths</p>
        `,
    `
        <h3>Union-Find Walkthrough</h3>
        <p><strong>Algorithm:</strong> Groups connected people using Union-Find, then solves each group separately.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Create Union-Find structure
2. For each transaction, unite two people
3. Find all connected components
4. For each component:
   a. Extract balances
   b. Sort balances
   c. Use two-pointer to settle
5. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Union-Find (parent + rank), Map</p>
        <p><strong>Time Complexity:</strong> O(n α(n)) ≈ O(n)</p>
        <p><strong>Best for:</strong> Identifying disconnected groups</p>
        `,
    `
        <h3>Min-Heap Priority Queue Walkthrough</h3>
        <p><strong>Algorithm:</strong> Uses two heaps to always match most extreme debtors and creditors.</p>
        <div class="code-block">
            <strong>Steps:</strong>
            <pre>1. Calculate net balances
2. Create min-heap for debtors
3. Create max-heap for creditors
4. While both heaps non-empty:
   a. Extract min debtor
   b. Extract max creditor
   c. Calculate settlement
   d. Re-insert if not settled
5. Done!</pre>
        </div>
        <p><strong>Data Structures Used:</strong> Priority Queue (min-heap + max-heap), Map</p>
        <p><strong>Time Complexity:</strong> O(n log n)</p>
        <p><strong>Best for:</strong> Streaming/dynamic data</p>
        `,
  ];

  const modal = document.getElementById("walkthrough-modal");
  document.getElementById("walkthrough-title").textContent =
    algorithmNames[algoNum - 1];
  document.getElementById("walkthrough-body").innerHTML =
    descriptions[algoNum - 1];
  modal.style.display = "block";
}

function closeWalkthrough() {
  document.getElementById("walkthrough-modal").style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("walkthrough-modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  initActiveNavigation();
});
