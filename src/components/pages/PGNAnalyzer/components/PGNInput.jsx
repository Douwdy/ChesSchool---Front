import React from 'react';
import AnalysisProgress from './AnalysisProgress';

const PGNInput = ({ pgn, setPgn, handleAnalyze, isLoading, isAnalyzingGame, analysisProgress, error, t }) => {
    return (
        <div className="pgn-input">
            <h2>{t('pgnAnalyzer.input.title')}</h2>
            <textarea
                placeholder={t('pgnAnalyzer.input.placeholder')}
                value={pgn}
                onChange={(e) => setPgn(e.target.value)}
            />
            <button 
                onClick={handleAnalyze}
                disabled={isLoading || isAnalyzingGame}
            >
                {isLoading ? t('pgnAnalyzer.input.loading') : t('pgnAnalyzer.input.analyze')}
            </button>
            
            {isAnalyzingGame && (
                <AnalysisProgress 
                    progress={analysisProgress} 
                    t={t} 
                />
            )}
            
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default PGNInput;