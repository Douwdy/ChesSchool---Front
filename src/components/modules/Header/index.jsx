import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.scss';
import { ReactComponent as Logo } from '../../../assets/svg/logo.svg';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header__logo">
                <Logo className="header__logo-svg" />
                <h1>ChesSchool</h1>
            </div>
            <button className="header__burger" onClick={toggleMenu}>
                <span className="header__burger-line"></span>
                <span className="header__burger-line"></span>
                <span className="header__burger-line"></span>
            </button>
            <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
                <ul className="header__nav__menu">
                    <li className="header__nav__menu__item">
                        <Link to="/" className="header__nav__menu__item__link" onClick={closeMenu}>Accueil</Link>
                    </li>
                    <li className="header__nav__menu__item">
                        <Link to="/local" className="header__nav__menu__item__link" onClick={closeMenu}>Partie en local</Link>
                    </li>
                    <li className="header__nav__menu__item">
                        <Link to="/analyze" className="header__nav__menu__item__link" onClick={closeMenu}>Analyseur PGN</Link>
                    </li>
                    <li className="header__nav__menu__item">
                        <Link to="/training" className="header__nav__menu__item__link" onClick={closeMenu}>Entraînement</Link>
                    </li>
                    <li className="header__nav__menu__item">
                        <Link to="/openings" className="header__nav__menu__item__link" onClick={closeMenu}>Ouvertures</Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;