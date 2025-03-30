import React, { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './index.scss';

const PGNAnalyzer = () => {
    const [pgn, setPgn] = useState('');
    const [game, setGame] = useState(new Chess());
    const [moves, setMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [error, setError] = useState('');

    const handleAnalyze = () => {
        const newGame = new Chess();
        if (newGame.loadPgn(pgn)) {
            setGame(newGame);
            setMoves(newGame.history({ verbose: true }));
            setCurrentMoveIndex(0);
            setError(''); // Réinitialise l'erreur
        } else {
            setError('PGN invalide. Veuillez vérifier votre entrée.');
        }
    };

    const goToMove = (index) => {
        const newGame = new Chess();
        newGame.loadPgn(pgn); // Utilisation de loadPgn
        for (let i = 0; i < index; i++) {
            newGame.move(moves[i]);
        }
        setGame(newGame);
        setCurrentMoveIndex(index);
    };

    return (
        <div className="pgn-analyzer">
            <h1>Analyseur PGN</h1>
            <div className="pgn-container">
                {/* Section d'entrée PGN */}
                <div className="pgn-input">
                    <textarea
                        placeholder="Collez votre PGN ici..."
                        value={pgn}
                        onChange={(e) => setPgn(e.target.value)}
                        rows="10"
                        cols="50"
                    />
                    <button onClick={handleAnalyze}>Analyser</button>
                    {error && <p className="error-message">{error}</p>}
                </div>

                {/* Section de l'échiquier */}
                <div className="pgn-board">
                    <Chessboard position={game.fen()} />
                    <div className="navigation-buttons">
                        <button
                            onClick={() => goToMove(Math.max(0, currentMoveIndex - 1))}
                            disabled={currentMoveIndex === 0}
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => goToMove(Math.min(moves.length, currentMoveIndex + 1))}
                            disabled={currentMoveIndex === moves.length}
                        >
                            Suivant
                        </button>
                    </div>
                </div>

                {/* Section des résultats */}
                <div className="pgn-results">
                    <h2>Liste des coups</h2>
                    <ul>
                        {moves.map((move, index) => (
                            <li
                                key={index}
                                style={{
                                    fontWeight: index === currentMoveIndex ? 'bold' : 'normal',
                                }}
                            >
                                {index + 1}. {move.san}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PGNAnalyzer;