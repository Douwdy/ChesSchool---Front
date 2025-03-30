import React from 'react';
import { Link } from 'react-router-dom';
import './index.scss';

const Landing = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <h1>Bienvenue sur Chess School</h1>
                <p>Apprenez et améliorez vos compétences aux échecs avec nous.</p>
                <Link to="/training" className="cta-button">Commencer maintenant</Link>
            </header>
            <section className="features">
                <div className="feature">
                    <h2>Entraînement personnalisé</h2>
                    <p>Des exercices adaptés à votre niveau pour progresser rapidement.</p>
                </div>
                <div className="feature">
                    <h2>Parties locales</h2>
                    <p>Jouez contre vos amis ou entraînez-vous en solo.</p>
                </div>
                <div className="feature">
                    <h2>Analyse de parties</h2>
                    <p>Analysez vos parties pour identifier vos forces et faiblesses.</p>
                </div>
            </section>
        </div>
    );
};

export default Landing;