// client/src/services/puzzleAPI.js
export async function fetchPuzzleOfTheDay() {
    // const response = await fetch('http://localhost:4000/api/puzzles/today');
    // const response = await fetch('http://81.164.23.45:4000/api/puzzles/today');
    const response = await fetch('https://french-connections.onrender.com/api/puzzles/today');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }
  