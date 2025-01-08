// server/controllers/puzzleController.js
const path = require('path');
const fs = require('fs');

// Path to puzzle data
const puzzleDataPath = path.join(__dirname, '../data/puzzles-fr.json');
let puzzles = [];

// Load puzzle data once on startup
try {
  const data = fs.readFileSync(puzzleDataPath, 'utf8');
  puzzles = JSON.parse(data);
} catch (err) {
  console.error('Error reading puzzle data:', err);
}

// Example function: get puzzle for today's date
function getPuzzleForToday() {
  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // Try to find a puzzle with the matching date
  const puzzle = puzzles.find(p => p.date === todayStr);

  // If not found, fallback to some logic. Here we’ll just pick the last puzzle in the array.
  return puzzle || puzzles[puzzles.length - 1];
}

module.exports = {
  getPuzzleForToday
};
