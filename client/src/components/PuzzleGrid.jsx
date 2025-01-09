import React, { useState } from 'react';
import WordCard from './WordCard';

function PuzzleGrid({ puzzle, setPuzzle, foundGroups, onGroupFound, onWrongGroup }) {
  const [selectedWords, setSelectedWords] = useState([]);

  // Find category index and name for a group of words
  const getCategoryInfo = (words) => {
    const index = puzzle.groups.findIndex(group => 
      words.every(w => group.words.includes(w))
    );
    return {
      index,
      name: index !== -1 ? puzzle.groups[index].name : ''
    };
  };

  // All puzzle words minus any that have already been grouped
  const groupedWords = foundGroups.flat();
  const availableWords = puzzle.words.filter(word => !groupedWords.includes(word));

  const toggleWordSelection = (word) => {
    setSelectedWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      }
      if (prev.length < 4) {
        return [...prev, word];
      }
      return prev;
    });
  };

  const validateSelection = (words) => {
    if (words.length !== 4) return;
    
    const matchedGroup = puzzle.groups.find(group => {
      const groupSet = new Set(group.words);
      return words.every(w => groupSet.has(w));
    });

    if (matchedGroup) {
      onGroupFound(matchedGroup.words);
    } else {
      onWrongGroup();
    }
    setSelectedWords([]);
  };

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
      {/* Display found groups at the top */}
      {foundGroups.map((groupWords, index) => {
        const categoryInfo = getCategoryInfo(groupWords);
        return (
          <div key={index} className="found-category-container">
            <div className={`category-name category-${categoryInfo.index}`}>
              {categoryInfo.name}
            </div>
            <div className="found-category">
              {groupWords.map((word) => (
                <WordCard
                  key={word}
                  word={word}
                  isSelected={false}
                  toggleWordSelection={() => {}}
                  categoryIndex={categoryInfo.index}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Display available words below */}
      <div className="puzzle-grid">
        {availableWords.map((word) => (
          <WordCard
            key={word}
            word={word}
            isSelected={selectedWords.includes(word)}
            toggleWordSelection={toggleWordSelection}
            categoryIndex={null}
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
