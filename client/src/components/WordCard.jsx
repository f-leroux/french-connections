import React from 'react';

function WordCard({ word, isSelected, toggleWordSelection, categoryIndex }) {
  let cardClass = 'word-card';
  
  // Add size class based on word length
  if (word.length >= 12) {
    cardClass += ' very-long-word';
  } else if (word.length >= 8) {
    cardClass += ' long-word';
  }
  
  if (categoryIndex !== null) {
    cardClass += ` category-${categoryIndex} solved-tile`;
  } else if (isSelected) {
    cardClass += ' selected';
  }

  return (
    <div 
      className={cardClass} 
      onClick={() => categoryIndex === null && toggleWordSelection(word)}
      style={{ cursor: categoryIndex !== null ? 'default' : 'pointer' }}
    >
      {word.toUpperCase()}
    </div>
  );
}

export default WordCard;
