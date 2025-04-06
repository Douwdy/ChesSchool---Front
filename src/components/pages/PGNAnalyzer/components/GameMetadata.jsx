import React from 'react';
import { useTranslation } from 'react-i18next';

const GameMetadata = ({ metadata }) => {
    const { t } = useTranslation();

    if (!metadata.white && !metadata.black) return null;

    return (
        <div className="game-metadata">
            <div className="players-info">
                <div className="player white">
                    <div className="player-name">{metadata.white}</div>
                    {metadata.whiteElo !== '?' && (
                        <div className="player-elo">{metadata.whiteElo}</div>
                    )}
                </div>
                <div className="versus">{t('pgnAnalyzer.versus')}</div>
                <div className="player black">
                    <div className="player-name">{metadata.black}</div>
                    {metadata.blackElo !== '?' && (
                        <div className="player-elo">{metadata.blackElo}</div>
                    )}
                </div>
            </div>
            <div className="game-details">
                {metadata.event !== '?' && (
                    <div className="event">{metadata.event}</div>
                )}
                {metadata.date !== '?' && (
                    <div className="date">{metadata.date}</div>
                )}
                {metadata.site && (
                    <div className="site">{metadata.site}</div>
                )}
                {metadata.result !== '*' && (
                    <div className="result">{t('pgnAnalyzer.result')} {metadata.result}</div>
                )}
            </div>
        </div>
    );
};

export default GameMetadata;