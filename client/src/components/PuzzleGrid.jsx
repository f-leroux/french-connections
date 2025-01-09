import React, { useState } from 'react';
import WordCard from './WordCard';

function PuzzleGrid({ puzzle, setPuzzle, foundGroups, onGroupFound, onWrongGroup }) {
  const [selectedWords, setSelectedWords] = useState([]);

  // All puzzle words minus any that have already been grouped
  const groupedWords = foundGroups.flat();
  const availableWords = puzzle.words.filter(word => !groupedWords.includes(word));

  // Add or remove word from selectedWords
  const toggleWordSelection = (word) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      }
      // Only add if we haven't selected 4 words yet
      if (prev.length < 4) {
        return [...prev, word];
      }
      return prev;
    });
  };

  // Check if the selected 4 words match a group
  const validateSelection = (words) => {
    if (words.length !== 4) return;
    
    // Compare with puzzle.groups
    const matchedGroup = puzzle.groups.find(group => {
      const groupSet = new Set(group.words);
      return words.every(w => groupSet.has(w));
    });

    if (matchedGroup) {
      onGroupFound(matchedGroup.words);
    } else {
      onWrongGroup();
    }
    setSelectedWords([]); // Reset selection
  };

  // Button handlers
  const handleShuffle = () => {
    const shuffledWords = [...availableWords].sort(() => Math.random() - 0.5);
    setPuzzle(prev => ({
      ...prev,
      words: [...shuffledWords, ...groupedWords]
    }));
  };

  const handleDeselectAll = () => {
    setSelectedWords([]);
  };

  const handleSubmit = () => {
    validateSelection(selectedWords);
  };

  return (
    <div>
      <div className="puzzle-grid">
        {availableWords.map((word) => (
          <WordCard
            key={word}
            word={word}
            isSelected={selectedWords.includes(word)}
            toggleWordSelection={toggleWordSelection}
          />
        ))}
      </div>
      <div className="button-row">
        <button onClick={handleShuffle}>Mélanger</button>
        <button onClick={handleDeselectAll}>Tout désélectionner</button>
        <button 
          onClick={handleSubmit}
          disabled={selectedWords.length !== 4}
        >
          Soumettre
        </button>
      </div>
    </div>
  );
}

export default PuzzleGrid;
