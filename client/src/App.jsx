// client/src/App.jsx
import React, { useEffect, useState } from 'react';
import PuzzleGrid from './components/PuzzleGrid';
import { fetchPuzzleOfTheDay } from './services/puzzleAPI';

function App() {
  const [puzzle, setPuzzle] = useState(null);
  const [foundGroups, setFoundGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [selectionHistory, setSelectionHistory] = useState([]);
  const maxMistakes = 4;
  const STORAGE_PREFIX = 'connections-puzzle-';

  // Fetch puzzle on mount
  useEffect(() => {
    async function loadPuzzle() {
      try {
        const puzzleData = await fetchPuzzleOfTheDay();
        const storageKey = `${STORAGE_PREFIX}${puzzleData.date}`;

        let savedState = null;
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            savedState = JSON.parse(raw);
          }
        } catch (e) {
          console.error('Error reading saved puzzle state:', e);
        }

        // If we have a saved state for today's puzzle, restore it
        if (savedState && savedState.date === puzzleData.date) {
          const restoredWords =
            savedState.words && Array.isArray(savedState.words)
              ? savedState.words
              : puzzleData.groups.flatMap(group => group.words).sort(() => Math.random() - 0.5);

          puzzleData.words = restoredWords;
          setPuzzle(puzzleData);
          setFoundGroups(savedState.foundGroups || []);
          setMistakes(savedState.mistakes || 0);
          setSelectionHistory(savedState.selectionHistory || []);
        } else {
          // Fresh puzzle for today
          puzzleData.words = puzzleData.groups.flatMap(group => group.words);
          puzzleData.words = puzzleData.words.sort(() => Math.random() - 0.5);
          setPuzzle(puzzleData);

          const initialState = {
            date: puzzleData.date,
            completed: false,
            foundGroups: [],
            mistakes: 0,
            selectionHistory: [],
            words: puzzleData.words,
          };
          try {
            localStorage.setItem(storageKey, JSON.stringify(initialState));
          } catch (e) {
            console.error('Error saving initial puzzle state:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching puzzle:', error);
      }
    }
    loadPuzzle();
  }, []);

  // Persist state changes so a user can't replay the daily puzzle from scratch
  useEffect(() => {
    if (!puzzle) return;

    const storageKey = `${STORAGE_PREFIX}${puzzle.date}`;
    const stateToSave = {
      date: puzzle.date,
      completed: foundGroups.length === 4,
      foundGroups,
      mistakes,
      selectionHistory,
      words: puzzle.words,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving puzzle state:', e);
    }
  }, [puzzle, foundGroups, mistakes, selectionHistory]);

  // Handler when the user selects a group (correct or incorrect)
  function handleGroupSelected(selectedWords) {
    // Find which category these words belong to (if any)
    const categoryIndex = puzzle.groups.findIndex(group => 
      selectedWords.every(word => group.words.includes(word))
    );
    
    // Add to history
    setSelectionHistory(prev => [...prev, {
      words: selectedWords,
      categoryIndex: categoryIndex // -1 if no match found
    }]);
  }

  // Handler when the user selects a correct group
  function handleGroupFound(groupWords) {
    setFoundGroups(prev => [...prev, groupWords]);
  }

  // Handler when the user attempts a group but is wrong
  function handleMistake() {
    setMistakes(prev => prev + 1);
  }

  const puzzleComplete = puzzle && foundGroups.length === 4;
  const hasMistakesLeft = mistakes < maxMistakes;

  // Function to generate share text
  const generateShareText = () => {
    const date = new Date().toLocaleDateString('fr-FR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const colorMap = {
      0: '🟨',  // Yellow (easiest)
      1: '🟩',  // Green
      2: '🟦',  // Blue
      3: '🟪'   // Purple (hardest)
    };

    const attempts = selectionHistory.map(selection => 
      selection.words.map(word => {
        const categoryIndex = puzzle.groups.findIndex(group => group.words.includes(word));
        return colorMap[categoryIndex];
      }).join('')
    ).join('\n');

    return `Connexions \n${date}\n${attempts}`;
  };

  // Add this new component for showing solutions
  const SolutionReveal = () => (
    <div className="solution-reveal">
      <h3>Solutions :</h3>
      {puzzle.groups.map((group, index) => (
        <div key={index} className={`found-category-container`}>
          <div className={`category-name category-${index}`}>
            {group.name}
          </div>
          <div className="found-category">
            {group.words.map((word) => (
              <div key={word} className={`word-card category-${index}`}>
                {word}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-container">
      <h1>Connexions</h1>
      <h2>{new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>
      <div className="info-bar">
        {!puzzleComplete && hasMistakesLeft && <p>Trouvez les groupes de 4 mots qui se connectent !</p>}
        {puzzleComplete && <p>Félicitations ! Vous avez terminé.</p>}
      </div>
      {puzzle && (
        <PuzzleGrid
          puzzle={puzzle}
          setPuzzle={setPuzzle}
          foundGroups={foundGroups}
          onGroupFound={handleGroupFound}
          onWrongGroup={handleMistake}
          onGroupSelected={handleGroupSelected}
          puzzleComplete={puzzleComplete}
          hasMistakesLeft={hasMistakesLeft}
          generateShareText={generateShareText}
        />
      )}
      {(hasMistakesLeft) && (
        <p id="mistakes-remaining">Erreurs restantes : {Array(maxMistakes - mistakes).fill('❤️ ').join('')}</p>
      )}
      {(!hasMistakesLeft && !puzzleComplete) && (
        <>
          <p>Vous avez utilisé toutes vos tentatives. Réessayez demain !</p>
          <SolutionReveal />
        </>
      )}
    </div>
  );
}

export default App;
