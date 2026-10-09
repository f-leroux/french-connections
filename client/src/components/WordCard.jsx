import React, { useRef } from 'react';

function WordCard({ word, isSelected, toggleWordSelection, categoryIndex }) {
  // Pointers currently pressed on this card (one per finger, so multitouch works)
  const activePointers = useRef(new Set());

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

  // Pointer events instead of onClick: browsers don't synthesize clicks for
  // multi-finger taps, but pointer events fire independently for each finger.
  const handlePointerDown = (e) => {
    if (categoryIndex !== null || e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointers.current.add(e.pointerId);
  };

  const handlePointerUp = (e) => {
    if (!activePointers.current.delete(e.pointerId)) return;
    // Only toggle if released over the card, like a regular click
    const rect = e.currentTarget.getBoundingClientRect();
    const releasedInside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (releasedInside) {
      toggleWordSelection(word);
    }
  };

  // Fired when the browser takes over the touch (e.g. the user starts scrolling)
  const handlePointerCancel = (e) => {
    activePointers.current.delete(e.pointerId);
  };

  return (
    <div
      className={cardClass}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ cursor: categoryIndex !== null ? 'default' : 'pointer' }}
    >
      {word.toUpperCase()}
    </div>
  );
}

export default WordCard;
