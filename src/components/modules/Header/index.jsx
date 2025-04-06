import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.scss';
import { ReactComponent as Logo } from '../../../assets/svg/logo.svg';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const languageMenuRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const toggleLanguageMenu = () => {
        setIsLanguageMenuOpen(!isLanguageMenuOpen);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setIsLanguageMenuOpen(false);
    };

    // Ferme le menu de langue lors d'un clic en dehors
    useEffect(() => {
        function handleClickOutside(event) {
            if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
                setIsLanguageMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Obtenir le texte à afficher pour la langue actuelle
    const getCurrentLanguageLabel = () => {
        switch(i18n.language) {
          case 'en': return 'English';
          case 'it': return 'Italiano';
          case 'zh': return '中文';
          case 'ja': return '日本語';
          case 'hi': return 'हिन्दी';
          default: return 'Français';
        }
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
                <div className="header__nav__container">
                    <ul className="header__nav__menu">
                        <li className="header__nav__menu__item">
                            <Link 
                                to="/" 
                                className={`header__nav__menu__item__link ${location.pathname === '/' ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                {t('header.home')}
                            </Link>
                        </li>
                        <li className="header__nav__menu__item">
                            <Link 
                                to="/local" 
                                className={`header__nav__menu__item__link ${location.pathname === '/local' ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                {t('header.playChess')}
                            </Link>
                        </li>
                        <li className="header__nav__menu__item disable">
                            <Link 
                                to="/analyze" 
                                className={`header__nav__menu__item__link ${location.pathname === '/analyze' ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                {t('header.gameAnalysis')}
                            </Link>
                        </li>
                        <li className="header__nav__menu__item">
                            <Link 
                                to="/training" 
                                className={`header__nav__menu__item__link ${location.pathname === '/training' ? 'active' : ''}`} 
                                onClick={closeMenu}
                            >
                                {t('header.training')}
                            </Link>
                        </li>
                        <li className="header__nav__menu__item">
                            <Link 
                                to="/openings" 
                                className={`header__nav__menu__item__link ${location.pathname === '/openings' ? 'active' : ''}`}
                                onClick={closeMenu}
                            >
                                {t('header.openings')}
                            </Link>
                        </li>
                    </ul>
                    
                    <div className="header__language-dropdown" ref={languageMenuRef}>
                        <button 
                            className="header__language-selector" 
                            onClick={toggleLanguageMenu}
                        >
                            {getCurrentLanguageLabel()}
                            <span className={`header__language-arrow ${isLanguageMenuOpen ? 'up' : 'down'}`}>▼</span>
                        </button>
                        
                        {isLanguageMenuOpen && (
                            <div className="header__language-menu">
                                <button 
                                    className={`header__language-option ${i18n.language === 'fr' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('fr')}
                                >
                                    Français
                                </button>
                                <button 
                                    className={`header__language-option ${i18n.language === 'en' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    English (BETA)
                                </button>
                                <button 
                                    className={`header__language-option ${i18n.language === 'it' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('it')}
                                >
                                    Italiano (BETA)
                                </button>
                                <button 
                                    className={`header__language-option ${i18n.language === 'zh' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('zh')}
                                >
                                    普通话 (BETA)
                                </button>
                                <button 
                                    className={`header__language-option ${i18n.language === 'ja' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('ja')}
                                >
                                    日本語 (BETA)
                                </button>
                                <button 
                                    className={`header__language-option ${i18n.language === 'hi' ? 'active' : ''}`}
                                    onClick={() => changeLanguage('hi')}
                                >
                                    हिन्दी (BETA)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;