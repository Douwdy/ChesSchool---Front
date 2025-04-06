import React from 'react';
import { Chessboard } from 'react-chessboard';
import formatEvaluation from '../utils/formatEvaluation';

const BoardDisplay = ({ game, evaluation, showEvaluationBar }) => {
    // Helper function to determine evaluation bar position
    const getEvalPosition = (evaluation) => {
        if (evaluation === null || evaluation === undefined) return 50;
        
        if (typeof evaluation === 'string' && evaluation.startsWith('#')) {
            return !evaluation.includes('-') ? 10 : 90;
        }
        
        const numericEval = typeof evaluation === 'string' ? parseFloat(evaluation) : evaluation;
        const clampedEval = Math.min(Math.max(numericEval, -5), 5);
        const position = 50 - (clampedEval * 8);
        
        return Math.min(Math.max(position, 5), 95);
    };

    const evalPos = getEvalPosition(evaluation);
    const whiteHeight = `${evalPos}%`;
    const blackHeight = `${100 - evalPos}%`;

    return (
        <div className="board-with-eval">
            {showEvaluationBar && (
                <div className="evaluation-bar">
                    <div className="eval-container">
                        <div className="white-eval" style={{ height: blackHeight }}></div>
                        <div className="black-eval" style={{ height: whiteHeight }}></div>
                        <div 
                            className="eval-value" 
                            style={{ top: `${evalPos}%` }}
                        >
                            {formatEvaluation(evaluation)}
                        </div>
                    </div>
                </div>
            )}
            <div className="board-container">
                <Chessboard position={game.fen()} />
            </div>
        </div>
    );
};

export default BoardDisplay;