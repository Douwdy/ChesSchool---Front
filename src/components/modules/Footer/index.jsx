import React from 'react';
import './index.scss';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__content">
                <div className="footer__links">
                    <a href="/about">À propos</a>
                    <a href="/contact">Contact</a>
                    <a href="/privacy">Politique de confidentialité</a>
                </div>
                <div className="footer__copyright">
                    <p>&copy; {new Date().getFullYear()} ChesSchool. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;