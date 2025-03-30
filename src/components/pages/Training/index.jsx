import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './index.scss';

let isFetching = false;

const Training = () => {
    const [problem, setProblem] = useState(null);
    const [chess, setChess] = useState(new Chess());
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [solutionIndex, setSolutionIndex] = useState(0);
    const [boardWidth, setBoardWidth] = useState(window.innerWidth * 0.8);
    const [boardOrientation, setBoardOrientation] = useState('white');
    const [isProblemLoaded, setIsProblemLoaded] = useState(false);

    const fetchProblem = async () => {
        if (isFetching) return;
        isFetching = true;

        try {
            setIsProblemLoaded(false);
            setErrorMessage('');
            setSuccessMessage('');
            const response = await fetch('https://chesschool-back-production.up.railway.app/problems');
            console.log('Response:', response);
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
            }, 100);
        } catch (error) {
            setErrorMessage(`Impossible de charger un problème : ${error.message}`);
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
            const newWidth = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
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
            setErrorMessage('Ce n\'est pas à vous de jouer.');
            return false;
        }

        const playedMove = `${sourceSquare}${targetSquare}`;

        if (playedMove !== expectedMove) {
            setErrorMessage(`Coup incorrect : ${playedMove}. Essayez encore !`);
            setSuccessMessage('');
            return false;
        }

        const move = chess.move({
            from: sourceSquare,
            to: targetSquare,
        });

        if (move === null) {
            setErrorMessage(`Coup invalide : de ${sourceSquare} à ${targetSquare}`);
            setSuccessMessage('');
            return false;
        }

        const nextIndex = solutionIndex + 1;
        setSolutionIndex(nextIndex);

        if (nextIndex >= solutionMoves.length) {
            setErrorMessage('');
            setSuccessMessage('Bravo ! Vous avez résolu le problème.');
        } else {
            setErrorMessage('');
            setSuccessMessage('Coup correct. Continuez !');

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
        if (rating < 1200) return "Problème facile. Trouvez le meilleur coup.";
        if (rating < 1800) return "Problème intermédiaire. Analysez attentivement.";
        return "Problème difficile. Soyez précis dans vos calculs.";
    };

    return (
        <div className="training">
            <div className="training-container">
                <div className="training-content" style={{ marginBottom: '20px' }}>
                    <h1>Entrainement !</h1>
                    <p>Améliorez vos compétences avec des problèmes d'échecs générés aléatoirement.</p>
                    <button onClick={fetchProblem}>Charger un nouveau problème</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {problem && (
                        <>
                            <p className="instruction">
                                {getInstructionFromThemes(problem.Rating)}
                            </p>
                            <p>Niveau : {problem.Rating} Elo</p>
                            <p>{chess.turn() === 'w' ? 'Trait aux Blancs' : 'Trait aux Noirs'}</p>
                        </>
                    )}
                </div>
                <div className="chessboard-container" style={{ display: 'flex', justifyContent: 'center' }}>
                    {isProblemLoaded ? (
                        <Chessboard
                            position={chess.fen()}
                            boardWidth={boardWidth}
                            onPieceDrop={onPieceDrop}
                            animationDuration={300}
                            boardOrientation={boardOrientation}
                        />
                    ) : (
                        <div
                            style={{
                                width: boardWidth,
                                height: boardWidth,
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #ccc',
                            }}
                        >
                            <p>Chargement...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Training;