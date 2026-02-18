import React, { useState } from 'react';
import WordCard from './WordCard';

function PuzzleGrid({ 
  puzzle, 
  setPuzzle, 
  foundGroups, 
  onGroupFound, 
  onWrongGroup, 
  onGroupSelected,
  puzzleComplete, 
  hasMistakesLeft,
  generateShareText 
}) {
  const [selectedWords, setSelectedWords] = useState([]);
  const [shakeClass, setShakeClass] = useState('');
  const [showAlmostMessage, setShowAlmostMessage] = useState(false);

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

  const checkIfOneAway = (words) => {
    // Check each category to see if the selection contains 3 of its words
    return puzzle.groups.some(group => {
      const matchCount = words.filter(word => group.words.includes(word)).length;
      return matchCount === 3;
    });
  };

  const validateSelection = (words) => {
    if (words.length !== 4) return;
    
    onGroupSelected(words);
    
    const matchedGroup = puzzle.groups.find(group => {
      const groupSet = new Set(group.words);
      return words.every(w => groupSet.has(w));
    });

    if (matchedGroup) {
      setShakeClass('shake-right');
      setTimeout(() => {
        onGroupFound(matchedGroup.words);
        setShakeClass('');
      }, 500);
    } else {
      setShakeClass('shake-wrong');
      const isOneAway = checkIfOneAway(words);
      if (isOneAway) {
        setShowAlmostMessage(true);
        setTimeout(() => {
          setShowAlmostMessage(false);
        }, 1000);
      }
      setTimeout(() => {
        onWrongGroup();
        setShakeClass('');
      }, 500);
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

  const handleShare = async () => {
    const shareText = generateShareText();
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Résultat copié dans le presse-papiers !');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Erreur lors de la copie du texte');
    }
  };

  return (
    <div>
      {/* Display found groups at the top */}
      {foundGroups.map((groupWords, index) => {
        const categoryInfo = getCategoryInfo(groupWords);
        return (
          <div key={index} className="found-category-container">
            <div className={`category-name category-${categoryInfo.index}`}>
              {categoryInfo.name.toUpperCase()}
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
      <div style={{ position: 'relative' }}>
        {showAlmostMessage && (
          <div className="almost-message">
            Presque !
          </div>
        )}
        {!puzzleComplete && hasMistakesLeft && (
          <div className={`puzzle-grid ${shakeClass}`}>
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
        )}
      </div>
      <div className="button-row">
        {!puzzleComplete && hasMistakesLeft ? (
          <>
            <button onClick={handleShuffle}>Mélanger</button>
            <button 
              onClick={handleDeselectAll}
              disabled={selectedWords.length === 0}
            >
              Tout désélectionner
            </button>
            <button 
              onClick={handleSubmit}
              disabled={selectedWords.length !== 4}
            >
              Soumettre
            </button>
          </>
        ) : (
          <button 
            onClick={handleShare}
            className="share-button"
          >
            Partager
          </button>
        )}
      </div>
    </div>
  );
}

export default PuzzleGrid;
