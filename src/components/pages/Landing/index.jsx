import React from 'react';
import { Link } from 'react-router-dom';
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
    return (
        <div className="landing-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Chess School</h1>
                    <p>
                        Apprenez, jouez et maîtrisez l'art des échecs. Une plateforme complète pour améliorer 
                        vos compétences, analyser vos parties et progresser à votre rythme.
                    </p>
                    <div className="cta-buttons">
                        <Link to="/training" className="cta-button">
                            <FontAwesomeIcon icon={faChessPawn} size='xl'/> S'entraîner maintenant
                        </Link>
                        <Link to="/openings" className="cta-button secondary">
                            <FontAwesomeIcon icon={faBook} size='xl'/> Explorer les ouvertures
                        </Link>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <h2 className="section-title">Nos fonctionnalités</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faGraduationCap} size='xl'/>
                        </div>
                        <h3>Entraînement personnalisé</h3>
                        <p>
                            Améliorez vos compétences avec des exercices tactiques adaptés à votre niveau.
                            Des problèmes variés pour progresser rapidement et efficacement.
                        </p>
                        <Link to="/training" className="feature-link">Commencer l'entraînement →</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faChess} size='xl'/>
                        </div>
                        <h3>Parties locales</h3>
                        <p>
                            Jouez contre un ami sur le même appareil. Parfait pour pratiquer, enseigner
                            ou simplement profiter d'une partie d'échecs à tout moment.
                        </p>
                        <Link to="/local" className="feature-link">Jouer maintenant →</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faSearch} size='xl'/>
                        </div>
                        <h3>Analyse de parties</h3>
                        <p>
                            Importez vos parties au format PGN et analysez-les en profondeur. Identifiez vos erreurs
                            et découvrez les meilleures alternatives à chaque position.
                        </p>
                        <Link to="/analyze" className="feature-link">Analyser une partie →</Link>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <FontAwesomeIcon icon={faBookOpen} size='xl'/>
                        </div>
                        <h3>Bibliothèque d'ouvertures</h3>
                        <p>
                            Explorez notre large collection d'ouvertures d'échecs. Apprenez les principes,
                            les variantes et les stratégies associées à chaque ouverture.
                        </p>
                        <Link to="/openings" className="feature-link">Explorer les ouvertures →</Link>
                    </div>
                </div>
            </section>

            <section className="get-started-section">
                <div className="section-content">
                    <h2>Prêt à devenir un meilleur <span>joueur d'échecs</span> ?</h2>
                    <p>
                        Rejoignez notre communauté de joueurs passionnés et commencez votre parcours 
                        vers la maîtrise des échecs. Tous les outils dont vous avez besoin sont à portée de main.
                    </p>
                    <Link to="/training" className="cta-button">
                        Commencer maintenant <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Landing;