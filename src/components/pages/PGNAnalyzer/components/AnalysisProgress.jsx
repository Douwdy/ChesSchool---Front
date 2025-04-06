import React from 'react';

const AnalysisProgress = ({ progress, t }) => {
    return (
        <div className="analysis-progress">
            <p>
                <span className="analysis-spinner">⏳</span>
                {t('pgnAnalyzer.input.analyzing')} {Math.floor(progress)}%
            </p>
            <div className="progress-bar">
                <div 
                    className="progress-fill" 
                    style={{ 
                        width: `${progress}%`,
                        transition: 'width 0.3s ease-in-out'
                    }}
                ></div>
            </div>
        </div>
    );
};

export default AnalysisProgress;