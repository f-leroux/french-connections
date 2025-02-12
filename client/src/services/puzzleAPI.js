// client/src/services/puzzleAPI.js
export async function fetchPuzzleOfTheDay() {
  // Use process.env.PUBLIC_URL to ensure we get the correct path in both development and production
  const response = await fetch(`${process.env.PUBLIC_URL}/puzzles-fr.json`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const puzzles = await response.json();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const puzzle = puzzles.find(p => p.date === todayStr) || puzzles[puzzles.length - 1];
  
  return puzzle;
}
