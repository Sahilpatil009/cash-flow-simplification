const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Generate C++ input format
function generateCppInput(transactions) {
    let input = `${transactions.length} ${new Set([...transactions.flatMap(t => [t.from, t.to])]).size}\n`;
    transactions.forEach(t => {
        input += `${t.from} ${t.to} ${t.amount}\n`;
    });
    return input;
}

// Helper: Parse C++ output
function parseCppOutput(output) {
    const lines = output.split('\n').filter(l => l.trim());
    const settlements = [];
    const metadata = {};

    lines.forEach(line => {
        if (line.includes('will pay')) {
            settlements.push(line);
        }
        if (line.includes('ALGORITHM:')) {
            metadata.algorithm = line.split('ALGORITHM:')[1].trim();
        }
        if (line.includes('Settlements:')) {
            metadata.settlements = parseInt(line.split(':')[1].trim());
        }
        if (line.includes('Original Transactions:')) {
            metadata.originalTransactions = parseInt(line.split(':')[1].trim());
        }
        if (line.includes('Time Complexity:')) {
            metadata.timeComplexity = line.split(':')[1].trim();
        }
        if (line.includes('Space Complexity:')) {
            metadata.spaceComplexity = line.split(':')[1].trim();
        }
        if (line.includes('Data Structures:')) {
            metadata.dataStructures = line.split(':')[1].trim();
        }
        if (line.includes('Connected Components:')) {
            metadata.components = parseInt(line.split(':')[1].trim());
        }
    });

    return { settlements, metadata };
}

function getAlgorithmPath(algorithmNumber) {
    const extension = process.platform === 'win32' ? '.exe' : '';
    return path.join(__dirname, 'cpp', 'bin', `algo${algorithmNumber}${extension}`);
}

function runAlgorithm(algorithmNumber, input, callback) {
    const child = spawn(getAlgorithmPath(algorithmNumber), [], {
        windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    let completed = false;

    function finish(error, result) {
        if (completed) return;
        completed = true;
        callback(error, result);
    }

    child.stdout.on('data', data => {
        stdout += data.toString();
    });

    child.stderr.on('data', data => {
        stderr += data.toString();
    });

    child.on('error', error => {
        finish(error);
    });

    child.on('close', code => {
        if (code !== 0) {
            finish(new Error(stderr || `Algorithm ${algorithmNumber} exited with code ${code}`));
            return;
        }

        finish(null, parseCppOutput(stdout));
    });

    child.stdin.end(input);
}

// API Endpoint: Run Algorithm 1 (Greedy)
app.post('/api/algorithm/1', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    runAlgorithm(1, input, (error, result) => {
        if (error) {
            console.error('Algorithm 1 error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ algorithmNumber: 1, ...result });
    });
});

// API Endpoint: Run Algorithm 2 (DFS)
app.post('/api/algorithm/2', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    runAlgorithm(2, input, (error, result) => {
        if (error) {
            console.error('Algorithm 2 error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ algorithmNumber: 2, ...result });
    });
});

// API Endpoint: Run Algorithm 3 (Union-Find)
app.post('/api/algorithm/3', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    runAlgorithm(3, input, (error, result) => {
        if (error) {
            console.error('Algorithm 3 error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ algorithmNumber: 3, ...result });
    });
});

// API Endpoint: Run Algorithm 4 (Heap)
app.post('/api/algorithm/4', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);

    runAlgorithm(4, input, (error, result) => {
        if (error) {
            console.error('Algorithm 4 error:', error);
            return res.status(500).json({ error: error.message });
        }
        res.json({ algorithmNumber: 4, ...result });
    });
});

// API Endpoint: Run all algorithms
app.post('/api/algorithms/all', (req, res) => {
    const { transactions } = req.body;
    if (!transactions || transactions.length === 0) {
        return res.status(400).json({ error: 'No transactions provided' });
    }

    const input = generateCppInput(transactions);
    const results = {};
    let completed = 0;

    // Run all 4 algorithms in parallel
    for (let i = 1; i <= 4; i++) {
        runAlgorithm(i, input, (error, result) => {
            if (error) {
                results[i] = { error: error.message };
            } else {
                results[i] = result;
            }

            completed++;
            if (completed === 4) {
                res.json({ algorithms: results });
            }
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📝 POST /api/algorithm/1 - Run Greedy Algorithm`);
        console.log(`📝 POST /api/algorithm/2 - Run DFS Algorithm`);
        console.log(`📝 POST /api/algorithm/3 - Run Union-Find Algorithm`);
        console.log(`📝 POST /api/algorithm/4 - Run Heap Algorithm`);
        console.log(`📝 POST /api/algorithms/all - Run all algorithms`);
    });
}

module.exports = app;
