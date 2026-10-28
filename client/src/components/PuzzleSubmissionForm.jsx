import React, { useState } from 'react';

// Cloudflare Worker in submission-worker/: files each submission as an issue for the review routine
const SUBMIT_ENDPOINT = 'https://french-connections-submissions.f-leroux.workers.dev';

const COLORS = ['yellow', 'green', 'blue', 'purple'];
const EMPTY_GROUP = { name: '', word1: '', word2: '', word3: '', word4: '' };
const EMPTY_FORM = {
  yellow: EMPTY_GROUP,
  green: EMPTY_GROUP,
  blue: EMPTY_GROUP,
  purple: EMPTY_GROUP,
  submitterName: '',
  email: '',
  comment: '',
  website: '' // honeypot, hidden from people
};

function PuzzleSubmissionForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error' or 'limit'

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [category, field] = name.split('.');

    if (!field) {
      setFormData(prev => ({
        ...prev,
        [category]: value
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
    for (const category of COLORS) {
      const cat = formData[category];
      if (!cat.name || !cat.word1 || !cat.word2 || !cat.word3 || !cat.word4) {
        return false;
      }
    }
    return formData.submitterName.trim() !== '';
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
      const response = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groups: COLORS.map(color => {
            const group = formData[color];
            return { name: group.name, words: [group.word1, group.word2, group.word3, group.word4] };
          }),
          author: formData.submitterName,
          email: formData.email,
          comment: formData.comment,
          website: formData.website
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData(EMPTY_FORM);
          setTimeout(() => {
            onClose();
            setSubmitStatus(null);
          }, 2000);
        }, 2000);
      } else {
        setSubmitStatus(response.status === 429 ? 'limit' : 'error');
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
          Les meilleurs ont des mots qui semblent aller dans deux groupes,
          et parfois un jeu de mots bien trouvé.
        </p>

        {submitStatus === 'success' && (
          <div className="submit-success">
            ✓ Merci ! Votre puzzle a bien été reçu. S'il est retenu, il sera publié sur le site
            avec votre nom.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="submit-error">
            ✗ Erreur lors de l'envoi. Veuillez réessayer.
          </div>
        )}

        {submitStatus === 'limit' && (
          <div className="submit-error">
            ✗ Beaucoup de puzzles reçus aujourd'hui, réessayez demain !
          </div>
        )}

        <form onSubmit={handleSubmit} className="puzzle-submission-form">
          {COLORS.map((color, index) => {
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
                    maxLength={60}
                    placeholder="ex: Couleurs, Animaux, etc."
                  />
                </div>
                <div className="form-group">
                  <label>Les 4 mots *</label>
                  <div className="words-grid">
                    {[1, 2, 3, 4].map(n => (
                      <input
                        key={n}
                        type="text"
                        name={`${color}.word${n}`}
                        value={formData[color][`word${n}`]}
                        onChange={handleChange}
                        required
                        maxLength={30}
                        placeholder={`Mot ${n}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="form-group">
            <label htmlFor="submitterName">Votre nom *</label>
            <input
              type="text"
              id="submitterName"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              required
              maxLength={40}
              placeholder="Votre nom ou pseudonyme"
            />
            <small>Le puzzle sera crédité à ce nom s'il est sélectionné.</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Votre email (optionnel)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={100}
              placeholder="vous@exemple.fr"
            />
            <small>
              Pour vous prévenir de la date de publication ou vous faire un retour.
              Il ne sera jamais affiché sur le site.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Commentaire (optionnel)</label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              placeholder="Une explication sur une catégorie, une précision, un petit mot…"
            />
          </div>

          <div className="form-honeypot" aria-hidden="true">
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
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
