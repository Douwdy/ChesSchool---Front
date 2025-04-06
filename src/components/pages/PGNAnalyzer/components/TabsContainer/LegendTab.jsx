import React from 'react';

const LegendTab = ({ t }) => {
    return (
        <div className="tab-pane">
            <div className="quality-legend">
                <h3>{t('pgnAnalyzer.legend.title')}</h3>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="color-box excellent"></span>
                        <span className="label">{t('pgnAnalyzer.legend.excellent')}</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box good"></span>
                        <span className="label">{t('pgnAnalyzer.legend.good')}</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box inaccuracy"></span>
                        <span className="label">{t('pgnAnalyzer.legend.inaccuracy')}</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box mistake"></span>
                        <span className="label">{t('pgnAnalyzer.legend.mistake')}</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box blunder"></span>
                        <span className="label">{t('pgnAnalyzer.legend.blunder')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegendTab;