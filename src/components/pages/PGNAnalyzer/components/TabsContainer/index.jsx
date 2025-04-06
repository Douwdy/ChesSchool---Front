import React from 'react';
import MovesList from './MovesList';
import StatsTab from './StatsTab';
import LegendTab from './LegendTab';

const TabsContainer = ({ 
    activeTab, 
    setActiveTab, 
    organizedMoves, 
    movesWithQuality,
    currentMoveIndex,
    gameAnalysis,
    gameStats,
    gameMetadata,
    moves,
    goToMove,
    movesListRef,
    showEvaluationChart,
    t 
}) => {
    return (
        <div className="tabs-container">
            <div className="tabs-nav">
                <button 
                    className={activeTab === 'moves' ? 'active' : ''} 
                    onClick={() => setActiveTab('moves')}
                >
                    {t('pgnAnalyzer.tabs.moves')}
                </button>
                <button 
                    className={activeTab === 'stats' ? 'active' : ''} 
                    onClick={() => setActiveTab('stats')}
                    disabled={!gameStats}
                >
                    {t('pgnAnalyzer.tabs.stats')}
                </button>
                <button 
                    className={activeTab === 'legend' ? 'active' : ''} 
                    onClick={() => setActiveTab('legend')}
                >
                    {t('pgnAnalyzer.tabs.legend')}
                </button>
            </div>
            
            <div className="tabs-content">
                {activeTab === 'moves' && (
                    <MovesList 
                        organizedMoves={organizedMoves}
                        movesWithQuality={movesWithQuality}
                        currentMoveIndex={currentMoveIndex}
                        goToMove={goToMove}
                        movesListRef={movesListRef}
                        t={t}
                    />
                )}
                
                {activeTab === 'stats' && (
                    <StatsTab 
                        gameStats={gameStats}
                        gameAnalysis={gameAnalysis}
                        gameMetadata={gameMetadata}
                        moves={moves}
                        goToMove={goToMove}
                        showEvaluationChart={showEvaluationChart}
                        t={t}
                    />
                )}
                
                {activeTab === 'legend' && (
                    <LegendTab t={t} />
                )}
            </div>
        </div>
    );
};

export default TabsContainer;