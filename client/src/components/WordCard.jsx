import React from 'react';

function WordCard({ word, isSelected, toggleWordSelection }) {
  const cardClass = isSelected ? 'word-card selected' : 'word-card';

  return (
    <div className={cardClass} onClick={() => toggleWordSelection(word)}>
      {word}
    </div>
  );
}

export default WordCard;
