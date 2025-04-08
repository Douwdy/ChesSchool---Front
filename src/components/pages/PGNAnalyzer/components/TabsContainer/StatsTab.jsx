import React from 'react';
import CompactEvaluationChart from '../../utils/CompactEvaluationChart';
import CompactGameStats from '../../utils/CompactGameStats';
import AnalysisExport from '../../utils/AnalysisExport';

const StatsTab = ({ 
    gameStats, 
    gameAnalysis, 
    gameMetadata, 
    moves, 
    goToMove, 
    showEvaluationChart,
    t 
}) => {
    return (
        <div className="tab-pane">
            {gameStats ? (
                <div className="stats-container">
                    
                    {showEvaluationChart && (
                        <CompactEvaluationChart 
                            gameAnalysis={gameAnalysis} 
                            moves={moves} 
                            onSelectMove={goToMove}
                            t={t}
                        />
                    )}
                    <CompactGameStats stats={gameStats} gameMetadata={gameMetadata} t={t} />
                    <div className="stats-header">
                        <AnalysisExport 
                            gameAnalysis={gameAnalysis}
                            moves={moves}
                            gameMetadata={gameMetadata}
                            gameStats={gameStats}
                            t={t}
                        />
                    </div>
                </div>
            ) : (
                <div className="no-stats">
                    {t('pgnAnalyzer.stats.noStats')}
                </div>
            )}
        </div>
    );
};

export default StatsTab;