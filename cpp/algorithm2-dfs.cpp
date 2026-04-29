#include <iostream>
#include <map>
#include <vector>
#include <set>

using namespace std;

map<string, vector<pair<string, int>>> graph;
map<string, int> net;
int settlement_count = 0;

// Recursive DFS to find payment paths and settle debts
// person: current debtor trying to settle
// visited: set of people already visited in this DFS path
void dfs(string person, set<string>& visited) {
    // Base case: this person is fully settled
    if (net[person] == 0) return;
    
    // Mark as visited to avoid cycles
    visited.insert(person);
    
    // Try to settle with each neighbor (creditor)
    for (auto& edge : graph[person]) {
        string creditor = edge.first;
        
        // Only settle with unvisited creditors who are owed money
        if (visited.find(creditor) == visited.end() && net[creditor] > 0) {
            
            // Calculate settlement amount (min of what debtor owes and creditor is owed)
            int settlement_amount = min(-net[person], net[creditor]);
            
            // Print settlement
            cout << person << " will pay " << settlement_amount << " to " 
                << creditor << endl;
            
            // Update balances
            net[person] += settlement_amount;
            net[creditor] -= settlement_amount;
            settlement_count++;
            
            // Recursively continue settlement if debtor still owes money
            if (net[person] < 0) {
                dfs(person, visited);
            }
        }
    }
    
    // Backtrack: remove from visited for other DFS paths
    visited.erase(person);
}

int main(){
    int no_of_transactions, friends;
    cin >> no_of_transactions >> friends;

    string x, y;
    int amount;

    int original_transactions = no_of_transactions;
    
    // Build graph and calculate net balances
    while (no_of_transactions--){
        cin >> x >> y >> amount;

        if (net.find(x) == net.end()) net[x] = 0;
        if (net.find(y) == net.end()) net[y] = 0;

        net[x] -= amount;
        net[y] += amount;

        // Add edges to adjacency list
        graph[x].push_back({y, amount});
        graph[y].push_back({x, amount});
    }

    // DFS-based settlement: start DFS from each debtor
    for (auto& p : net) {
        string person = p.first;
        int balance = p.second;

        // If person owes money and hasn't been fully settled yet
        if (balance < 0) {
            set<string> visited;
            dfs(person, visited);
        }
    }

    cout << "ALGORITHM: Graph DFS Traversal (Adjacency List + DFS)" << endl;
    cout << "Settlements: " << settlement_count << endl;
    cout << "Original Transactions: " << original_transactions << endl;
    cout << "Data Structures: graph (adjacency list), map (hash), DFS recursion" << endl;
    cout << "Time Complexity: O(V + E)" << endl;
    cout << "Space Complexity: O(V + E)" << endl;

    return 0;
}
