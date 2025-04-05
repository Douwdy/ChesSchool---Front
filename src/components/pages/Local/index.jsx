import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useTranslation } from "react-i18next";
import './index.scss';

const STORAGE_KEY = 'chess_local_game_state';

const LocalChessGame = () => {
    const { t } = useTranslation();
    
    const initializeGameFromStorage = () => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                const loadedGame = new Chess();
                
                if (parsedState.fen && loadedGame.load(parsedState.fen)) {
                    return {
                        game: loadedGame,
                        moveHistory: parsedState.moveHistory || [],
                        capturedPieces: parsedState.capturedPieces || { white: [], black: [] },
                        boardOrientation: parsedState.boardOrientation || 'white'
                    };
                }
            }
        } catch (error) {
            console.error("Erreur lors du chargement de la partie sauvegardée:", error);
        }
        
        return {
            game: new Chess(),
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            boardOrientation: 'white'
        };
    };
    
    const initialState = initializeGameFromStorage();
    const [game, setGame] = useState(initialState.game);
    const [boardWidth, setBoardWidth] = useState(400);
    const [errorMessage, setErrorMessage] = useState('');
    const [moveHistory, setMoveHistory] = useState(initialState.moveHistory);
    const [boardOrientation, setBoardOrientation] = useState(initialState.boardOrientation);
    const [capturedPieces, setCapturedPieces] = useState(initialState.capturedPieces);
    const gameRef = useRef(null);
    
    useEffect(() => {
        gameRef.current = game;
        
        try {
            const gameState = {
                fen: game.fen(),
                moveHistory,
                capturedPieces,
                boardOrientation
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'état du jeu:", error);
        }
    }, [game, moveHistory, capturedPieces, boardOrientation]);
    
    useEffect(() => {
        const handleResize = () => {
            const newWidth = Math.min(
                Math.max(
                    window.innerWidth > 768 
                        ? (window.innerWidth * 0.4) 
                        : (window.innerWidth * 0.8), 
                    300
                ), 
                580
            );
            setBoardWidth(newWidth);
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const updateMoveHistoryAndCapturedPieces = (move) => {
        if (!move) return;
        
        try {
            const updatedHistory = [...moveHistory, move];
            setMoveHistory(updatedHistory);
            
            if (move.captured) {
                const updatedCapturedPieces = { ...capturedPieces };
                const captureColor = move.color === 'w' ? 'black' : 'white';
                updatedCapturedPieces[captureColor] = [...updatedCapturedPieces[captureColor], move.captured];
                setCapturedPieces(updatedCapturedPieces);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'historique:", error);
        }
    };

    const handleMove = (sourceSquare, targetSquare) => {
        try {
            const gameCopy = new Chess(gameRef.current.fen());
            
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q",
            });

            if (move === null) {
                setErrorMessage(t('localGame.messages.invalidMove', { from: sourceSquare, to: targetSquare }));
                return false;
            }

            setGame(gameCopy);
            
            updateMoveHistoryAndCapturedPieces(move);
            
            if (gameCopy.isCheckmate()) {
                const winner = gameCopy.turn() === 'w' ? t('localGame.messages.blackWins') : t('localGame.messages.whiteWins');
                setErrorMessage(t('localGame.messages.checkmate', { winner }));
            } else if (gameCopy.isDraw()) {
                if (gameCopy.isStalemate()) {
                    setErrorMessage(t('localGame.messages.stalemate'));
                } else if (gameCopy.isThreefoldRepetition()) {
                    setErrorMessage(t('localGame.messages.threefold'));
                } else if (gameCopy.isInsufficientMaterial()) {
                    setErrorMessage(t('localGame.messages.insufficient'));
                } else {
                    setErrorMessage(t('localGame.messages.draw'));
                }
            } else if (gameCopy.isCheck()) {
                const king = gameCopy.turn() === 'w' ? t('localGame.messages.whiteKing') : t('localGame.messages.blackKing');
                setErrorMessage(t('localGame.messages.check', { king }));
            } else {
                setErrorMessage('');
            }
            
            return true;
        } catch (error) {
            console.error("Erreur de déplacement:", error);
            setErrorMessage(`Erreur : ${error.message}`);
            return false;
        }
    };

    const resetGame = () => {
        try {
            const newGame = new Chess();
            setGame(newGame);
            setErrorMessage('');
            setMoveHistory([]);
            setCapturedPieces({ white: [], black: [] });
            
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Erreur lors de la réinitialisation:", error);
            setErrorMessage(t('localGame.messages.resetError') + " " + error.message);
        }
    };
    
    const flipBoard = () => {
        const newOrientation = boardOrientation === 'white' ? 'black' : 'white';
        setBoardOrientation(newOrientation);
    };
    
    const formattedHistory = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        formattedHistory.push({
            number: Math.floor(i / 2) + 1,
            white: moveHistory[i] ? moveHistory[i].san : null,
            black: moveHistory[i + 1] ? moveHistory[i + 1].san : null
        });
    }
    
    return (
        <div className="local-game">
            <div className="local-game-container">
                <div className="local-game-content">
                    <h2>{t('localGame.title')}</h2>
                    <p>{t('localGame.description')}</p>
                    
                    <div className="game-controls">
                        <button onClick={resetGame}>{t('localGame.controls.newGame')}</button>
                        <button onClick={flipBoard}>{t('localGame.controls.flipBoard')}</button>
                    </div>
                    
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    
                    <div className="game-status">
                        <div className="status-header">{t('localGame.status.header')}</div>
                        <div className="player-turn">
                            <div className={`turn-indicator ${game.turn() === 'w' ? 'white' : 'black'}`}></div>
                            {t('localGame.status.turn')} {game.turn() === 'w' ? t('localGame.status.white') : t('localGame.status.black')}
                        </div>
                        
                        <div className="game-info">
                            <div className="info-item">
                                <div className="label">{t('localGame.status.movesPlayed')}</div>
                                <div className="value">{moveHistory.length}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">{t('localGame.status.capturedPieces')} ({t('localGame.status.whites')})</div>
                                <div className="value">{capturedPieces.white.length || 0}</div>
                            </div>
                            <div className="info-item">
                                <div className="label">{t('localGame.status.capturedPieces')} ({t('localGame.status.blacks')})</div>
                                <div className="value">{capturedPieces.black.length || 0}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="game-history">
                        <h3>{t('localGame.history.title')}</h3>
                        {formattedHistory.length > 0 ? (
                            <div className="move-list">
                                {formattedHistory.map((move, index) => (
                                    <React.Fragment key={index}>
                                        <div className="move-number">{move.number}.</div>
                                        <div className={`move ${index === formattedHistory.length - 1 && !move.black ? 'last-move' : ''}`}>
                                            {move.white || ''}
                                        </div>
                                        <div className={`move ${index === formattedHistory.length - 1 && move.black ? 'last-move' : ''}`}>
                                            {move.black || ''}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        ) : (
                            <p>{t('localGame.history.noMoves')}</p>
                        )}
                    </div>
                </div>

                <div className="chessboard-container">
                    <div className="board-wrapper">
                        <Chessboard
                            position={game.fen()}
                            onPieceDrop={handleMove}
                            boardWidth={boardWidth}
                            autoPromoteToQueen={true}
                            boardOrientation={boardOrientation}
                            animationDuration={300}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocalChessGame;