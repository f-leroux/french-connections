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

// Cache variables
let cachedPuzzle = null;
let cachedDate = null;

function getPuzzleForToday() {
  const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  
  // Return cached puzzle if it's still the same date
  if (cachedDate === todayStr && cachedPuzzle) {
    return cachedPuzzle;
  }

  // If date changed or no cache, find new puzzle
  const puzzle = puzzles.find(p => p.date === todayStr);
  
  // Update cache
  cachedDate = todayStr;
  cachedPuzzle = puzzle || puzzles[puzzles.length - 1];
  
  return cachedPuzzle;
}

module.exports = {
  getPuzzleForToday
};
