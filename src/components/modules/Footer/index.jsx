import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.scss';

const Footer = () => {
    const { t } = useTranslation();
    
    return (
        <footer className="footer">
            <div className="footer__content">
                <div className="footer__links">
                    <a href="/contact">{t('footer.contact')}</a>
                </div>
                <div className="footer__copyright">
                    <p>&copy; {new Date().getFullYear()} ChesSchool. {t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;