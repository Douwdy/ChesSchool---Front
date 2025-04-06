import React from 'react';
import formatEvaluation from '../../utils/formatEvaluation';

const MovesList = ({ organizedMoves, movesWithQuality, currentMoveIndex, goToMove, movesListRef, t }) => {
    return (
        <div className="tab-pane">
            <div className="moves-list" ref={movesListRef}>
                <ul>
                    {organizedMoves.map((moveGroup, groupIndex) => {
                        const whiteMoveWithQuality = movesWithQuality[groupIndex * 2];
                        const blackMoveWithQuality = movesWithQuality[groupIndex * 2 + 1];
                        
                        const whiteIndex = groupIndex * 2 + 1;
                        const blackIndex = groupIndex * 2 + 2;
                        
                        return (
                            <React.Fragment key={groupIndex}>
                                <li className="move-number">{moveGroup.number}.</li>
                                <li 
                                    className={`white-move ${currentMoveIndex === whiteIndex ? 'current' : ''} ${
                                        whiteMoveWithQuality?.quality?.class || ''
                                    } ${whiteMoveWithQuality?.alternatives?.length > 0 ? 'has-alternatives' : ''}`}
                                    onClick={() => goToMove(whiteIndex)}
                                    style={{ paddingLeft: whiteMoveWithQuality?.quality?.class ? '12px' : '8px' }}
                                >
                                    {moveGroup.white.san}
                                    <span className={`move-quality ${whiteMoveWithQuality?.quality?.class || ''}`}>
                                        {whiteMoveWithQuality?.quality?.label || ''}
                                    </span>
                                    
                                    {whiteMoveWithQuality?.alternatives?.length > 0 && (
                                        <div className="move-alternatives">
                                            <span className="alternative-indicator">•••</span>
                                            <div className="alternative-details">
                                                <p>Alternatives:</p>
                                                {whiteMoveWithQuality.alternatives.map((alt, idx) => (
                                                    <div key={idx} className="alternative-move">
                                                        <span className="alt-san">{alt.san}</span>
                                                        <span className="alt-eval">{formatEvaluation(alt.evaluation)}</span>
                                                        <span className="alt-advantage">(+{alt.advantage.toFixed(2)})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                                
                                <li 
                                    className={`black-move ${moveGroup.black && currentMoveIndex === blackIndex ? 'current' : ''} ${
                                        moveGroup.black ? (blackMoveWithQuality?.quality?.class || '') : ''
                                    } ${blackMoveWithQuality?.alternatives?.length > 0 ? 'has-alternatives' : ''}`}
                                    onClick={() => {
                                        if (moveGroup.black) {
                                            goToMove(blackIndex);
                                        }
                                    }}
                                    style={{ paddingRight: blackMoveWithQuality?.quality?.class ? '12px' : '8px' }}
                                >
                                    {moveGroup.black ? moveGroup.black.san : ''}
                                    {moveGroup.black && (
                                        <>
                                            <span className="move-quality">
                                                {blackMoveWithQuality?.quality?.label || ''}
                                            </span>
                                            
                                            {blackMoveWithQuality?.alternatives?.length > 0 && (
                                                <div className="move-alternatives">
                                                    <span className="alternative-indicator">•••</span>
                                                    <div className="alternative-details">
                                                        <p>Alternatives:</p>
                                                        {blackMoveWithQuality.alternatives.map((alt, idx) => (
                                                            <div key={idx} className="alternative-move">
                                                                <span className="alt-san">{alt.san}</span>
                                                                <span className="alt-eval">{formatEvaluation(alt.evaluation)}</span>
                                                                <span className="alt-advantage">(+{alt.advantage.toFixed(2)})</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </li>
                            </React.Fragment>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default MovesList;