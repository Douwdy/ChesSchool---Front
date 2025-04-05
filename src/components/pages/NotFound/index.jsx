import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './index.scss';

const NotFound = () => {
    const { t } = useTranslation();
    
    return (
        <div className="not-found-container">
            <h1>{t('notFound.title')}</h1>
            <span className="chess-piece">♞</span>
            <div className="chessboard"></div>
            <h2>{t('notFound.subtitle')}</h2> 
            <p>{t('notFound.description')}</p>
            <Link to="/" className="home-link">
                {t('notFound.backHome')}
            </Link>
        </div>
    );
};

export default NotFound;