import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useTranslation } from 'react-i18next';
import './index.scss';
import openings from './openings.json';

const Openings = () => {
    const { t } = useTranslation();
    const [selectedOpening, setSelectedOpening] = useState(null);
    const [chess, setChess] = useState(new Chess());
    const [boardWidth, setBoardWidth] = useState(400);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moveHistory, setMoveHistory] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Math.min(Math.max(window.innerWidth * 0.8, 300), 500);
            setBoardWidth(newWidth);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpeningChange = (event) => {
        const opening = openings.find((o) => o.name === event.target.value);
        setSelectedOpening(opening);
        resetBoard(opening);
    };

    const resetBoard = (opening) => {
        if (!opening) return;
        
        const newChess = new Chess();
        const moves = opening.moves.split(' ');
        const history = [{ position: newChess.fen(), move: null }];
        
        moves.forEach((move) => {
            const moveObject = {
                from: move.slice(0, 2),
                to: move.slice(2, 4),
                promotion: move.length === 5 ? move[4] : undefined
            };
            
            newChess.move(moveObject);
            history.push({
                position: newChess.fen(),
                move: moveObject
            });
        });
        
        setChess(new Chess());
        setMoveHistory(history);
        setCurrentMoveIndex(0);
    };

    const goToMove = (index) => {
        setCurrentMoveIndex(index);
        const newChess = new Chess();
        
        for (let i = 1; i <= index; i++) {
            newChess.move(moveHistory[i].move);
        }
        
        setChess(newChess);
    };

    const goToNextMove = () => {
        if (currentMoveIndex < moveHistory.length - 1) {
            goToMove(currentMoveIndex + 1);
        }
    };

    const goToPreviousMove = () => {
        if (currentMoveIndex > 0) {
            goToMove(currentMoveIndex - 1);
        }
    };

    const goToFirstMove = () => {
        goToMove(0);
    };

    const goToLastMove = () => {
        goToMove(moveHistory.length - 1);
    };

    return (
        <div className="openings">
            <div className="openings-container">
                <div className="openings-list">
                    <h2>{t('openings.title')}</h2>
                    <select onChange={handleOpeningChange} defaultValue="">
                        <option value="" disabled>
                            {t('openings.selectPlaceholder')}
                        </option>
                        {openings.map((opening, index) => (
                            <option key={index} value={opening.name}>
                                {opening.name}
                            </option>
                        ))}
                    </select>
                    
                    {selectedOpening && (
                        <div className="opening-info">
                            <h3>{t('openings.about')}</h3>
                            <p>
                                <strong>{selectedOpening.name}</strong> {t('openings.aboutText')} <code>{selectedOpening.moves}</code>.
                            </p>
                            <p>
                                {t('openings.instructions')}
                            </p>
                        </div>
                    )}
                </div>
                <div className="openings-board">
                    {selectedOpening ? (
                        <div className="board-container">
                            <h2>{selectedOpening.name}</h2>
                            <p>{t('openings.moves')} {selectedOpening.moves}</p>
                            <div
                                className="chessboard-container"
                                style={{ width: `${boardWidth}px`, height: `${boardWidth}px` }}
                            >
                                <Chessboard
                                    position={chess.fen()}
                                    boardWidth={boardWidth}
                                    animationDuration={300}
                                />
                            </div>
                            
                            <div className="navigation-buttons">
                                <button onClick={goToFirstMove} disabled={currentMoveIndex === 0}>
                                    &lt;&lt;
                                </button>
                                <button onClick={goToPreviousMove} disabled={currentMoveIndex === 0}>
                                    &lt;
                                </button>
                                <span>{currentMoveIndex} / {moveHistory.length - 1}</span>
                                <button onClick={goToNextMove} disabled={currentMoveIndex === moveHistory.length - 1}>
                                    &gt;
                                </button>
                                <button onClick={goToLastMove} disabled={currentMoveIndex === moveHistory.length - 1}>
                                    &gt;&gt;
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="board-container">
                            <h2>{t('openings.welcome.title')}</h2>
                            <p>{t('openings.welcome.description')}</p>
                            <div
                                className="chessboard-container"
                                style={{ width: `${boardWidth}px`, height: `${boardWidth}px` }}
                            >
                                <Chessboard
                                    position={chess.fen()}
                                    boardWidth={boardWidth}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Openings;