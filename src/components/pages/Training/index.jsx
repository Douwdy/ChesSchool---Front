import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useTranslation } from 'react-i18next';
import './index.scss';

let isFetching = false;

const Training = () => {
    const { t } = useTranslation();
    const [problem, setProblem] = useState(null);
    const [chess, setChess] = useState(new Chess());
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [solutionIndex, setSolutionIndex] = useState(0);
    const [boardWidth, setBoardWidth] = useState(400);
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [isProblemLoaded, setIsProblemLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProblem = async () => {
        if (isFetching) return;
        isFetching = true;
        setIsLoading(true);

        try {
            setIsProblemLoaded(false);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/problems`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP : ${response.status}`);
            }

            const data = await response.json();

            if (!data.FEN || !data.Moves) {
                throw new Error('Les données du problème sont incomplètes.');
            }

            setProblem(data);
            const newChess = new Chess(data.FEN);
            setChess(newChess);
            setSolutionIndex(0);

            const isWhiteToPlay = data.FEN.split(' ')[1] === 'w';
            setBoardOrientation(isWhiteToPlay ? 'black' : 'white');

            const solutionMoves = data.Moves.split(' ');
            setTimeout(() => {
                try {
                    playNextMove(solutionMoves[0], newChess);
                    setSolutionIndex(1);
                } catch (error) {
                    setErrorMessage(`Erreur lors de l'exécution du premier coup : ${error.message}`);
                }
                setIsProblemLoaded(true);
                setIsLoading(false);
            }, 100);
        } catch (error) {
            setErrorMessage(`Impossible de charger un problème : ${error.message}`);
            setIsLoading(false);
        } finally {
            isFetching = false;
        }
    };

    useEffect(() => {
        fetchProblem();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Math.min(
                Math.max(
                    window.innerWidth > 768 
                        ? (window.innerWidth * 0.4) 
                        : (window.innerWidth * 0.8), 
                    300
                ), 
                480
            );
            setBoardWidth(newWidth);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onPieceDrop = (sourceSquare, targetSquare) => {
        if (!problem || !isProblemLoaded) return false;

        const solutionMoves = problem.Moves.split(' ');
        const expectedMove = solutionMoves[solutionIndex];

        if (solutionIndex % 2 !== 1) {
            setErrorMessage(t('training.messages.notYourTurn'));
            return false;
        }

        const isPromotion = expectedMove.length > 4;
        const promotionPiece = isPromotion ? expectedMove[4] : undefined;
        
        const expectedSourceTarget = expectedMove.slice(0, 4);
        const playedSourceTarget = `${sourceSquare}${targetSquare}`;

        if (playedSourceTarget !== expectedSourceTarget) {
            setErrorMessage(t('training.messages.wrongMove', { move: playedSourceTarget }));
            setSuccessMessage('');
            return false;
        }

        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: promotionPiece
        });

        if (move === null) {
            setErrorMessage(t('training.messages.invalidMove', { from: sourceSquare, to: targetSquare }));
            setSuccessMessage('');
            return false;
        }

        const nextIndex = solutionIndex + 1;
        setSolutionIndex(nextIndex);

        if (nextIndex >= solutionMoves.length) {
            setErrorMessage('');
            setSuccessMessage(t('training.messages.success'));
        } else {
            setErrorMessage('');
            setSuccessMessage(t('training.messages.correctMove'));

            if (nextIndex % 2 === 0) {
                playNextMove(solutionMoves[nextIndex], chess);
            }
        }

        return true;
    };

    const playNextMove = (move, chessInstance) => {
        const from = move.slice(0, 2);
        const to = move.slice(2, 4);
        const promotion = move.length > 4 ? move[4] : undefined;

        const result = chessInstance.move({ from, to, promotion });

        if (!result) {
            throw new Error(`Coup invalide : ${JSON.stringify({ from, to, promotion })}`);
        }

        setChess(new Chess(chessInstance.fen()));
        setSolutionIndex((prevIndex) => prevIndex + 1);
    };

    const getInstructionFromThemes = (rating) => {
        if (rating < 1200) return t('training.difficulty.easy');
        if (rating < 1800) return t('training.difficulty.medium');
        return t('training.difficulty.hard');
    };

    return (
        <div className="training">
            <div className="training-container">
                <div className="training-content">
                    <h2>{t('training.title')}</h2>
                    <p>{t('training.description')}</p>
                    
                    <button 
                        onClick={fetchProblem}
                        disabled={isLoading}
                    >
                        {isLoading ? t('training.loading') : t('training.newProblem')}
                    </button>
                    
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                    {successMessage && <div className="success-message">{successMessage}</div>}
                    
                    {problem && (
                        <>
                            <div className="instruction">
                                {getInstructionFromThemes(problem.Rating)}
                            </div>
                            
                            <div className="problem-info">
                                <div className="info-item">
                                    <div className="label">{t('training.info.level')}</div>
                                    <div className="value">{problem.Rating} Elo</div>
                                </div>
                                <div className="info-item">
                                    <div className="label">{t('training.info.turn')}</div>
                                    <div className="value">{chess.turn() === 'w' ? t('training.status.white') : t('training.status.black')}</div>
                                </div>
                                <div className="info-item">
                                    <div className="label">{t('training.info.moves')}</div>
                                    <div className="value">{Math.ceil(problem.Moves.split(' ').length / 2)}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="chessboard-container">
                    {isProblemLoaded ? (
                        <>
                            <Chessboard
                                position={chess.fen()}
                                boardWidth={boardWidth}
                                onPieceDrop={onPieceDrop}
                                animationDuration={300}
                                boardOrientation={boardOrientation}
                            />
                            <div className="turn-indicator">
                                <div className={`indicator-dot ${chess.turn() === 'w' ? 'white' : 'black'}`}></div>
                                {chess.turn() === 'w' ? t('training.turnIndicator.white') : t('training.turnIndicator.black')}
                            </div>
                        </>
                    ) : (
                        <div className="loading-board">
                            <p>{t('training.loadingProblem')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Training;