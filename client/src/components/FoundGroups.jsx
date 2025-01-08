import React from 'react';

function FoundGroups({ foundGroups }) {
  return (
    <div className="found-groups">
      <h2>Groupes trouvés</h2>
      {foundGroups.length === 0 && <p>Aucun groupe trouvé pour l’instant.</p>}
      {foundGroups.map((groupWords, index) => (
        <div key={index} className="found-group">
          <p>Groupe #{index + 1}: {groupWords.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default FoundGroups;
