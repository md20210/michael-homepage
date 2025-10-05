// src/components/Profile.jsx
import React from 'react';

const Profile = ({ t }) => {
    return (
        <section id="profile" className="section">
            <div style={{ width: '100%' }}>
                <div className="step-indicator">
                    <div className="step-number">02</div>
                    <div className="step-line"></div>
                    <div className="step-number" style={{ color: '#ffd700' }}>02</div>
                </div>

                <h2 className="main-title" style={{ fontSize: '48px', marginBottom: '30px', textAlign: 'center' }}>
                    {t('profile-title')}
                </h2>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                    <div className="intro-content">
                        <div className="intro-block">
                            <h3 className="intro-title">{t('intro-what-done-title')}</h3>
                            <p className="intro-text">{t('intro-what-done-text')}</p>
                        </div>

                        <div className="intro-block">
                            <h3 className="intro-title">{t('intro-what-bring-title')}</h3>
                            <p className="intro-text">{t('intro-what-bring-text')}</p>
                        </div>

                        <div className="intro-block">
                            <h3 className="intro-title">{t('intro-what-looking-title')}</h3>
                            <p className="intro-text">{t('intro-what-looking-text')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;