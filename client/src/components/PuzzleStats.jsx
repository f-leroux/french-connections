import React from 'react';

// Below this many finished games the percentage is mostly noise (the first player of the
// day would always see 100 %), so nothing is shown yet.
const MIN_PLAYED = 10;

// From the easiest verdict down: the first one whose threshold the solve rate reaches
const VERDICTS = [
  { minRate: 0.85, text: 'Ce puzzle était facile' },
  { minRate: 0.65, text: 'Ce puzzle était abordable' },
  { minRate: 0.4, text: 'Ce puzzle était difficile' },
  { minRate: 0, text: 'Ce puzzle était très difficile' },
];

// How hard everyone found today's puzzle, as a share of players who solved it (never counts)
function PuzzleStats({ stats }) {
  if (!stats || stats.played < MIN_PLAYED) return null;

  const rate = stats.solved / stats.played;
  const verdict = VERDICTS.find(v => rate >= v.minRate);
  const percent = rate.toLocaleString('fr-FR', { style: 'percent' });

  return (
    <p className="puzzle-stats">
      📊 {verdict.text} : {rate < 0.4 ? 'seulement ' : ''}{percent} des joueurs l'ont résolu.
    </p>
  );
}

export default PuzzleStats;
