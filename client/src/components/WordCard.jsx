import React from 'react';

function WordCard({ word, isSelected, toggleWordSelection, categoryIndex }) {
  let cardClass = 'word-card';
  
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
