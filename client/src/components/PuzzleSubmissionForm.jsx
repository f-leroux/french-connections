import React, { useState } from 'react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqjlren';

function PuzzleSubmissionForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    yellow: { name: '', word1: '', word2: '', word3: '', word4: '' },
    green: { name: '', word1: '', word2: '', word3: '', word4: '' },
    blue: { name: '', word1: '', word2: '', word3: '', word4: '' },
    purple: { name: '', word1: '', word2: '', word3: '', word4: '' },
    submitterName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [category, field] = name.split('.');
    
    if (category === 'submitterName') {
      setFormData(prev => ({
        ...prev,
        submitterName: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value
        }
      }));
    }
  };

  const validateForm = () => {
    const categories = ['yellow', 'green', 'blue', 'purple'];
    for (const category of categories) {
      const cat = formData[category];
      if (!cat.name || !cat.word1 || !cat.word2 || !cat.word3 || !cat.word4) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    if (!validateForm()) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const puzzleData = {
        yellow: {
          name: formData.yellow.name,
          words: [formData.yellow.word1, formData.yellow.word2, formData.yellow.word3, formData.yellow.word4]
        },
        green: {
          name: formData.green.name,
          words: [formData.green.word1, formData.green.word2, formData.green.word3, formData.green.word4]
        },
        blue: {
          name: formData.blue.name,
          words: [formData.blue.word1, formData.blue.word2, formData.blue.word3, formData.blue.word4]
        },
        purple: {
          name: formData.purple.name,
          words: [formData.purple.word1, formData.purple.word2, formData.purple.word3, formData.purple.word4]
        }
      };

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _subject: 'Nouvelle soumission de puzzle complet',
          puzzle: puzzleData,
          submitterName: formData.submitterName,
          submittedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            yellow: { name: '', word1: '', word2: '', word3: '', word4: '' },
            green: { name: '', word1: '', word2: '', word3: '', word4: '' },
            blue: { name: '', word1: '', word2: '', word3: '', word4: '' },
            purple: { name: '', word1: '', word2: '', word3: '', word4: '' },
            submitterName: ''
          });
          setTimeout(() => {
            onClose();
            setSubmitStatus(null);
          }, 2000);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Soumettre un puzzle</h2>
        <p className="form-description">
          Proposez un puzzle complet avec 4 catégories (jaune, vert, bleu, violet) !
        </p>
        
        {submitStatus === 'success' && (
          <div className="submit-success">
            ✓ Merci ! Votre soumission a été envoyée.
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="submit-error">
            ✗ Erreur lors de l'envoi. Veuillez réessayer.
          </div>
        )}

        <form onSubmit={handleSubmit} className="puzzle-submission-form">
          {['yellow', 'green', 'blue', 'purple'].map((color, index) => {
            const colorLabels = {
              yellow: { emoji: '🟨', name: 'Jaune (Facile)' },
              green: { emoji: '🟩', name: 'Vert (Moyen)' },
              blue: { emoji: '🟦', name: 'Bleu (Difficile)' },
              purple: { emoji: '🟪', name: 'Violet (Très difficile)' }
            };
            const label = colorLabels[color];
            
            return (
              <div key={color} className={`category-section category-${index}`}>
                <h3>{label.emoji} {label.name}</h3>
                <div className="form-group">
                  <label htmlFor={`${color}.name`}>Nom de la catégorie *</label>
                  <input
                    type="text"
                    id={`${color}.name`}
                    name={`${color}.name`}
                    value={formData[color].name}
                    onChange={handleChange}
                    required
                    placeholder="ex: Couleurs, Animaux, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Les 4 mots *</label>
                  <div className="words-grid">
                    <input
                      type="text"
                      name={`${color}.word1`}
                      value={formData[color].word1}
                      onChange={handleChange}
                      required
                      placeholder="Mot 1"
                    />
                    <input
                      type="text"
                      name={`${color}.word2`}
                      value={formData[color].word2}
                      onChange={handleChange}
                      required
                      placeholder="Mot 2"
                    />
                    <input
                      type="text"
                      name={`${color}.word3`}
                      value={formData[color].word3}
                      onChange={handleChange}
                      required
                      placeholder="Mot 3"
                    />
                    <input
                      type="text"
                      name={`${color}.word4`}
                      value={formData[color].word4}
                      onChange={handleChange}
                      required
                      placeholder="Mot 4"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="form-group">
            <label htmlFor="submitterName">Votre nom (optionnel)</label>
            <input
              type="text"
              id="submitterName"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              placeholder="Votre nom ou pseudonyme"
            />
            <small>Le puzzle sera crédité à ce nom s'il est sélectionné.</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-submit">
              {isSubmitting ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PuzzleSubmissionForm;

