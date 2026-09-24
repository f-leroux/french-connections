// client/src/services/puzzleAPI.js

// The player's local date as YYYY-MM-DD (toISOString is UTC, which lags behind France until 1-2am)
export function localDateString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

export async function fetchPuzzleOfTheDay() {
  // Use process.env.PUBLIC_URL to ensure we get the correct path in both development and production.
  // no-cache: always revalidate with the server so a newly published puzzle shows up immediately.
  const response = await fetch(`${process.env.PUBLIC_URL}/puzzles-fr.json`, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const puzzles = await response.json();

  const todayStr = localDateString();
  const puzzle = puzzles.find(p => p.date === todayStr) || puzzles[puzzles.length - 1];
  
  return puzzle;
}
