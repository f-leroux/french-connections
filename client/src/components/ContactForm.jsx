import React, { useState } from 'react';

// Formspree emails each message to the site owner, with the sender's email (if given) as reply-to
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpqjlren';

const EMPTY_FORM = { message: '', email: '', _gotcha: '' }; // _gotcha: Formspree's honeypot

function ContactForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: 'Message via frenchconnections.fr',
          ...formData
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          setFormData(EMPTY_FORM);
          onClose();
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        <h2>Contact</h2>
        <p className="form-description">
          Une remarque, un bug, une idée ? Écrivez-nous !
        </p>

        {submitStatus === 'success' && (
          <div className="submit-success">
            ✓ Merci ! Votre message a bien été envoyé.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="submit-error">
            ✗ Erreur lors de l'envoi. Veuillez réessayer.
          </div>
        )}

        <form onSubmit={handleSubmit} className="puzzle-submission-form">
          <div className="form-group">
            <label htmlFor="message">Votre message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              maxLength={2000}
            />
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
            <small>Seulement pour pouvoir vous répondre.</small>
          </div>

          <div className="form-honeypot" aria-hidden="true">
            <input
              type="text"
              name="_gotcha"
              value={formData._gotcha}
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
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContactForm;
