import React, { useState } from 'react';
import WordCard from './WordCard';

function PuzzleGrid({ puzzle, foundGroups, onGroupFound, onWrongGroup }) {
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
      return [...prev, word];
    });
  };

  // Check if the selected 4 words match a group
  const validateSelection = (words) => {
    // Compare with puzzle.groups
    // Each group is an array of 4 words
    const matchedGroup = puzzle.groups.find(group => {
      // Sort so order doesn't matter
      const groupSet = new Set(group.words);
      return words.every(w => groupSet.has(w));
    });

    if (matchedGroup) {
      onGroupFound(matchedGroup.words);
    } else {
      onWrongGroup();
    }
  };

  // If exactly 4 words selected, validate
  if (selectedWords.length === 4) {
    validateSelection(selectedWords);
    setSelectedWords([]); // Reset selection
  }

  return (
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
  );
}

export default PuzzleGrid;
