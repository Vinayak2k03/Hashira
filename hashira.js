const fs = require('fs');

function parseInput(jsonData) {
    const data = JSON.parse(jsonData);
    const n = data.keys.n;
    const k = data.keys.k;
    
    const points = [];
    
    // Extract and decode the points
    for (let i = 1; i <= n; i++) {
        if (data[i.toString()]) {
            const x = i;
            const base = parseInt(data[i.toString()].base);
            const encodedValue = data[i.toString()].value;
            const y = parseInt(encodedValue, base);
            points.push([x, y]);
        }
    }
    
    return { n, k, points };
}

function lagrangeInterpolation(points, k) {
    // Use the first k points for interpolation
    const selectedPoints = points.slice(0, k);
    
    // Calculate the constant term (secret) using Lagrange interpolation
    // f(0) = Σ(yi * Li(0)) where Li(0) is the Lagrange basis polynomial evaluated at x=0
    let secret = 0;
    
    for (let i = 0; i < k; i++) {
        const [xi, yi] = selectedPoints[i];
        
        // Calculate Lagrange basis polynomial Li(0)
        let numerator = 1;
        let denominator = 1;
        
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const [xj] = selectedPoints[j];
                numerator *= (0 - xj);    // (0 - xj)
                denominator *= (xi - xj); // (xi - xj)
            }
        }
        
        const li = numerator / denominator;
        secret += yi * li;
    }
    
    return Math.round(secret);
}

function solveTestCase(filename) {
    try {
        const jsonData = fs.readFileSync(filename, 'utf8');
        const { n, k, points } = parseInput(jsonData);
        
        console.log(`Test Case: ${filename}`);
        console.log(`n = ${n}, k = ${k}`);
        console.log('Decoded points:');
        points.forEach(([x, y]) => {
            console.log(`(${x}, ${y})`);
        });
        
        const secret = lagrangeInterpolation(points, k);
        console.log(`Secret (constant term): ${secret}`);
        console.log('---');
        
        return secret;
    } catch (error) {
        console.error(`Error reading file ${filename}:`, error.message);
    }
}

// Solve both test cases by reading from existing JSON files
console.log('Solving Test Cases using Lagrange Interpolation...\n');
solveTestCase('testcase1.json');
solveTestCase('testcase2.json');