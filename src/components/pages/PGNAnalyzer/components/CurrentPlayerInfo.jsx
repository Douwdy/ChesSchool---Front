import React from 'react';

const CurrentPlayerInfo = ({ game, currentMoveIndex, gameMetadata, t }) => {
    return (
        <div className="current-player">
            <div className={`player-indicator ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
                <span className="piece-symbol">{game.turn() === 'w' ? '♔' : '♚'}</span>
                <span className="player-name">
                    {t('pgnAnalyzer.player.turn')} {game.turn() === 'w' ? gameMetadata.white : gameMetadata.black}
                </span>
            </div>
            <div className="move-number">
                {t('pgnAnalyzer.player.move')} {Math.floor(currentMoveIndex / 2) + 1}
                {game.turn() === 'w' ? '' : '...'}
            </div>
        </div>
    );
};

export default CurrentPlayerInfo;