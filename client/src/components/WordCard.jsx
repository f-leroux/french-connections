import React from 'react';

function WordCard({ word, isSelected, toggleWordSelection, categoryIndex }) {
  let cardClass = 'word-card';
  
  if (categoryIndex !== null) {
    cardClass += ` category-${categoryIndex}`;
  } else if (isSelected) {
    cardClass += ' selected';
  }

  return (
    <div 
      className={cardClass} 
      onClick={() => toggleWordSelection(word)}
      style={{ cursor: categoryIndex !== null ? 'default' : 'pointer' }}
    >
      {word}
    </div>
  );
}

export default WordCard;
