// solve.js
const fs = require("fs");


// Map a single digit character to its numeric value (0..35)
function digitValue(ch) {
  const c = ch.toLowerCase();
  if (c >= '0' && c <= '9') return c.charCodeAt(0) - 48;
  if (c >= 'a' && c <= 'z') return c.charCodeAt(0) - 87; // 'a'->10
  throw new Error(`Invalid digit: ${ch}`);
}

// Parse string in base (2..36) to BigInt exactly (no Number/parseInt)
function parseBaseBigInt(str, base) {
  const B = BigInt(base);
  let acc = 0n;
  for (const ch of str) {
    const d = digitValue(ch);
    if (d >= base) throw new Error(`Digit '${ch}' out of range for base ${base}`);
    acc = acc * B + BigInt(d);
  }
  return acc;
}

// gcd for BigInt
function gcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

// Rational number with BigInt numerator/denominator
class Rat {
  constructor(num, den = 1n) {
    if (den === 0n) throw new Error("Zero denominator");
    // normalize sign to denominator positive
    if (den < 0n) { num = -num; den = -den; }
    const g = gcd(num, den);
    this.num = num / g;
    this.den = den / g;
  }
  add(other) {
    const n = this.num * other.den + other.num * this.den;
    const d = this.den * other.den;
    return new Rat(n, d);
  }
  mul(other) {
    return new Rat(this.num * other.num, this.den * other.den);
  }
  div(other) {
    if (other.num === 0n) throw new Error("Division by zero");
    return new Rat(this.num * other.den, this.den * other.num);
  }
}

// ---- Lagrange interpolation at x = 0 (constant term) ----
// points: array of [xi(BigInt), yi(BigInt)] of length k
function lagrangeAtZero(points) {
  const k = points.length;
  let sum = new Rat(0n, 1n);

  for (let i = 0; i < k; i++) {
    const xi = points[i][0];
    const yi = points[i][1];

    // basis Li(0) = Π_{j≠i} (-xj)/(xi - xj)
    let basis = new Rat(1n, 1n);
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const xj = points[j][0];
      const num = new Rat(-xj, 1n);
      const den = new Rat(xi - xj, 1n);
      basis = basis.mul(num).div(den);
    }

    const term = new Rat(yi, 1n).mul(basis);
    sum = sum.add(term);
  }

  // For a valid instance, denominator should be 1
  if (sum.den !== 1n) {
    throw new Error(`Non-integer result: ${sum.num}/${sum.den}`);
  }
  return sum.num; // BigInt
}

// ---- Main ----
(function main() {
  const file = process.argv[2] || "input.json";
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  const k = data.keys.k;

  // Collect points as [x, y_decoded] and sort by x
  const entries = Object.keys(data)
    .filter((key) => key !== "keys")
    .map((key) => {
      const x = BigInt(key);
      const base = parseInt(data[key].base, 10);
      const y = parseBaseBigInt(data[key].value, base);
      return [x, y];
    })
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  // Use the first k points (x=1..k)
  const points = entries.slice(0, k);

  const c = lagrangeAtZero(points);

  // Print ONLY the constant value
  console.log(c.toString());
})();
