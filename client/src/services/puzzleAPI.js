// client/src/services/puzzleAPI.js
export async function fetchPuzzleOfTheDay() {
  // Use process.env.PUBLIC_URL to ensure we get the correct path in both development and production
  const response = await fetch(`${process.env.PUBLIC_URL}/puzzles-fr.json`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const puzzles = await response.json();
  
  // Use the player's local date (toISOString is UTC, which lags behind France until 1-2am)
  const now = new Date();
  const todayStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const puzzle = puzzles.find(p => p.date === todayStr) || puzzles[puzzles.length - 1];
  
  return puzzle;
}
