// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import PuzzleGrid from './components/PuzzleGrid';
import FoundGroups from './components/FoundGroups';
import { fetchPuzzleOfTheDay } from './services/puzzleAPI';

function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundGroups, setFoundGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const maxMistakes = 4;

  // Fetch puzzle on mount
  useEffect(() => {
    async function loadPuzzle() {
      try {
        const puzzleData = await fetchPuzzleOfTheDay();
        puzzleData.words = puzzleData.groups.flatMap(group => group.words);
        // shuffle words
        puzzleData.words = puzzleData.words.sort(() => Math.random() - 0.5);
        setPuzzle(puzzleData);
      } catch (error) {
        console.error('Error fetching puzzle:', error);
      }
    }
    loadPuzzle();
  }, []);

  // Handler when the user selects a correct group
  function handleGroupFound(groupWords) {
    // Add to foundGroups
    setFoundGroups(prev => [...prev, groupWords]);
  }

  // Handler when the user attempts a group but is wrong
  function handleMistake() {
    setMistakes(prev => prev + 1);
  }

  const puzzleComplete = puzzle && foundGroups.length === 4;
  const hasMistakesLeft = mistakes < maxMistakes;

  return (
    <div className="app-container">
      <h1>Connexions</h1>
      <p>{puzzle.date}</p>
      <p>Trouvez les groupes de 4 mots qui se connectent</p>
      <div className="info-bar">
        <p>Erreurs restantes : {maxMistakes - mistakes}</p>
        {puzzleComplete && <p>Félicitations ! Vous avez terminé.</p>}
      </div>
      {puzzle && hasMistakesLeft && !puzzleComplete && (
        <PuzzleGrid
          puzzle={puzzle}
          setPuzzle={setPuzzle}
          foundGroups={foundGroups}
          onGroupFound={handleGroupFound}
          onWrongGroup={handleMistake}
        />
      )}
      {(!hasMistakesLeft && !puzzleComplete) && (
        <p>Vous avez utilisé toutes vos tentatives. Réessayez demain !</p>
      )}
      <FoundGroups foundGroups={foundGroups} />
    </div>
  );
}

export default App;
