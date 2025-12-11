// src/components/RatingPanel.jsx
import { useState, useEffect } from 'react';
import './RatingPanel.css';

export default function RatingPanel() {
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  // Load reviews from localStorage
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const stored = localStorage.getItem('privategxt-reviews');
    if (stored) {
      const reviewsData = JSON.parse(stored);
      setReviews(reviewsData);
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.stars, 0) / reviewsData.length;
        setAverage(avg.toFixed(1));
      }
    }
  };

  const handleStarClick = (value) => {
    setSelectedStars(value);
  };

  const handleSubmit = () => {
    if (selectedStars === 0 || !comment.trim()) {
      alert('Bitte wähle Sterne und gib ein Feedback ein!');
      return;
    }

    const review = {
      stars: selectedStars,
      comment: comment.trim(),
      date: new Date().toLocaleString('de-DE')
    };

    // Save to localStorage
    const updatedReviews = [...reviews, review];
    localStorage.setItem('privategxt-reviews', JSON.stringify(updatedReviews));

    // Create download file
    const content = updatedReviews
      .map(r => `Bewertung: ${r.stars}/5 Sterne\nKommentar: ${r.comment}\nDatum: ${r.date}\n\n`)
      .join('');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privategxt-bewertungen.txt';
    a.click();
    URL.revokeObjectURL(url);

    // Reset form
    setSelectedStars(0);
    setComment('');
    loadReviews();
    alert('Bewertung gespeichert und als Textdatei heruntergeladen!');
  };

  return (
    <div className="rating-panel">
      <h3>Bewerte PrivateGxT</h3>

      <div className="rating-form">
        <p className="rating-label">Wie findest du PrivateGxT?</p>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((value) => (
            <span
              key={value}
              className={`star ${selectedStars >= value ? 'selected' : ''}`}
              onClick={() => handleStarClick(value)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Was sollte besser sein oder welche Funktion sollte es zusätzlich geben?"
          rows={4}
        />

        <button onClick={handleSubmit} className="submit-btn">
          Bewertung absenden
        </button>
      </div>

      {reviews.length > 0 && (
        <div className="reviews-summary">
          <button
            onClick={() => setShowReviews(!showReviews)}
            className="toggle-reviews-btn"
          >
            {showReviews ? '▼' : '▶'} Bewertungen anzeigen ({reviews.length})
          </button>
          <div className="average">⭐ Durchschnitt: {average} Sterne</div>
        </div>
      )}

      {showReviews && reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.slice().reverse().map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-stars">
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
              </div>
              <p className="review-comment">{review.comment}</p>
              <small className="review-date">{review.date}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
