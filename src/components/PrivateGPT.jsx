// src/components/PrivateGPT.jsx
import React, { useState, useEffect } from 'react';
import './PrivateGPT.css';

const PrivateGPT = ({ t, currentLang }) => {
    const [selectedStars, setSelectedStars] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [showReviews, setShowReviews] = useState(false);

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
            alert(t('privategpt-rate-alert-missing'));
            return;
        }

        const locale = currentLang === 'de' ? 'de-DE' : currentLang === 'es' ? 'es-ES' : 'en-US';
        const review = {
            stars: selectedStars,
            comment: comment.trim(),
            date: new Date().toLocaleString(locale)
        };

        const updatedReviews = [...reviews, review];
        localStorage.setItem('privategxt-reviews', JSON.stringify(updatedReviews));

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

        setSelectedStars(0);
        setComment('');
        loadReviews();
        alert(t('privategpt-rate-alert-success'));
    };
    return (
        <section id="privategpt" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">04</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>07</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('privategpt-title')}
                </h2>

                <div style={{
                    background: 'rgba(15, 15, 35, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    borderRadius: '20px',
                    padding: '60px 40px',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '40px'
                    }}>
                        <div style={{ fontSize: '100px', marginBottom: '20px' }}>
                            🔒
                        </div>
                        <h3 style={{
                            fontSize: '32px',
                            color: '#ffd700',
                            marginBottom: '20px',
                            fontWeight: 'bold'
                        }}>
                            {t('privategpt-header')}
                        </h3>
                        <p style={{
                            fontSize: '18px',
                            color: '#ffffff',
                            lineHeight: '1.8',
                            marginBottom: '30px'
                        }}>
                            {t('privategpt-description')}
                        </p>
                    </div>

                    {/* Technical Architecture */}
                    <div style={{
                        background: 'rgba(79, 70, 229, 0.1)',
                        border: '1px solid rgba(79, 70, 229, 0.3)',
                        borderRadius: '15px',
                        padding: '30px',
                        marginBottom: '30px'
                    }}>
                        <h4 style={{
                            fontSize: '24px',
                            color: '#4F46E5',
                            marginBottom: '20px',
                            fontWeight: 'bold'
                        }}>
                            {t('privategpt-tech-title')}
                        </h4>
                        <ul style={{
                            color: '#ffffff',
                            fontSize: '16px',
                            lineHeight: '2',
                            listStyle: 'none',
                            padding: 0
                        }}>
                            <li>🤖 {t('privategpt-tech-llm')}</li>
                            <li>🔍 {t('privategpt-tech-vector')}</li>
                            <li>🔐 {t('privategpt-tech-privacy')}</li>
                            <li>📄 {t('privategpt-tech-pdf')}</li>
                            <li>⚡ {t('privategpt-tech-rag')}</li>
                        </ul>
                    </div>

                    {/* CTA Button */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <a
                            href="https://www.dabrock.eu/privategpt/"
                            className="cta-button"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                fontSize: '20px',
                                padding: '18px 40px'
                            }}
                        >
                            {t('privategpt-cta')}
                        </a>
                    </div>

                    {/* Rating Section */}
                    <div className="homepage-rating-section">
                        <h4 style={{
                            fontSize: '24px',
                            color: '#ffd700',
                            marginBottom: '20px',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}>
                            {t('privategpt-rate-title')}
                        </h4>

                        <div className="rating-form-homepage">
                            <p style={{ textAlign: 'center', color: '#ffffff', marginBottom: '15px' }}>
                                {t('privategpt-rate-question')}
                            </p>
                            <div className="stars-homepage">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <span
                                        key={value}
                                        className={`star-homepage ${selectedStars >= value ? 'selected' : ''}`}
                                        onClick={() => handleStarClick(value)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={t('privategpt-rate-placeholder')}
                                className="comment-textarea-homepage"
                                rows={4}
                            />

                            <button onClick={handleSubmit} className="submit-btn-homepage">
                                {t('privategpt-rate-submit')}
                            </button>
                        </div>

                        {reviews.length > 0 && (
                            <div className="reviews-summary-homepage">
                                <button
                                    onClick={() => setShowReviews(!showReviews)}
                                    className="toggle-reviews-btn-homepage"
                                >
                                    {showReviews ? '▼' : '▶'} {t('privategpt-rate-toggle')} ({reviews.length})
                                </button>
                                <div className="average-homepage">⭐ {t('privategpt-rate-average')}: {average} {t('privategpt-rate-stars')}</div>
                            </div>
                        )}

                        {showReviews && reviews.length > 0 && (
                            <div className="reviews-list-homepage">
                                {reviews.slice().reverse().map((review, index) => (
                                    <div key={index} className="review-item-homepage">
                                        <div className="review-stars-homepage">
                                            {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
                                        </div>
                                        <p className="review-comment-homepage">{review.comment}</p>
                                        <small className="review-date-homepage">{review.date}</small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivateGPT;
