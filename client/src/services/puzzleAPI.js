// client/src/services/puzzleAPI.js
export async function fetchPuzzleOfTheDay() {
    const response = await fetch('http://localhost:4000/api/puzzles/today');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  