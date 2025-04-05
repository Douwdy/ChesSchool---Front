import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChessPawn,
  faBook, 
  faGraduationCap,
  faChess,
  faSearch,
  faBookOpen,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import './index.scss';

const Landing = () => {
    const { t } = useTranslation();
    
    return (
        <div className="landing-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>{t('landing.hero.title')}</h1>
                    <p>{t('landing.hero.description')}</p>
                    <div className="cta-buttons">
                        <Link to="/training" className="cta-button">
                            <FontAwesomeIcon icon={faChessPawn} size='xl'/> {t('landing.cta.train')}
                        </Link>
                        <Link to="/openings" className="cta-button secondary">
                            <FontAwesomeIcon icon={faBook} size='xl'/> {t('landing.cta.explore')}
                        </Link>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">{t('landing.features.title')}</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faGraduationCap} size='xl'/>
                        </div>
                        <h3>{t('landing.features.personalizedTraining.title')}</h3>
                        <p>{t('landing.features.personalizedTraining.description')}</p>
                        <Link to="/training" className="feature-link">{t('landing.features.personalizedTraining.cta')}</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faChess} size='xl'/>
                        </div>
                        <h3>{t('landing.features.localGames.title')}</h3>
                        <p>{t('landing.features.localGames.description')}</p>
                        <Link to="/local" className="feature-link">{t('landing.features.localGames.cta')}</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faSearch} size='xl'/>
                        </div>
                        <h3>{t('landing.features.gameAnalysis.title')}</h3>
                        <p>{t('landing.features.gameAnalysis.description')}</p>
                        <Link to="/analyze" className="feature-link">{t('landing.features.gameAnalysis.cta')}</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faBookOpen} size='xl'/>
                        </div>
                        <h3>{t('landing.features.openings.title')}</h3>
                        <p>{t('landing.features.openings.description')}</p>
                        <Link to="/openings" className="feature-link">{t('landing.features.openings.cta')}</Link>
                    </div>
                </div>
            </section>

            <section className="get-started-section">
                <div className="section-content">
                    <h2>{t('landing.getStarted.title')}</h2>
                    <p>{t('landing.getStarted.description')}</p>
                    <Link to="/training" className="cta-button">
                        {t('landing.getStarted.cta')} <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;