import React from 'react';

const NavigationControls = ({ currentMoveIndex, movesLength, goToMove, isLoading, t }) => {
    return (
        <div className="navigation-buttons">
            <button
                onClick={() => goToMove(Math.max(0, currentMoveIndex - 1))}
                disabled={currentMoveIndex === 0 || isLoading}
            >
                {t('pgnAnalyzer.navigation.previous')}
            </button>
            <button
                onClick={() => goToMove(Math.min(movesLength, currentMoveIndex + 1))}
                disabled={currentMoveIndex === movesLength || isLoading}
            >
                {t('pgnAnalyzer.navigation.next')}
            </button>
        </div>
    );
};

export default NavigationControls;