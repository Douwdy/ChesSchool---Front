import React, { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import './index.scss';

const LocalChessGame = () => {
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [boardWidth, setBoardWidth] = useState(window.innerWidth * 0.8);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
            setBoardWidth(newWidth);
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setGame(new Chess(fen));
    }, [fen]);

    const handleMove = (sourceSquare, targetSquare) => {
        const gameCopy = new Chess(game.fen());
        const possibleMoves = gameCopy.moves({ square: sourceSquare, verbose: true });
        const isValidMove = possibleMoves.some(
            (move) => move.to === targetSquare && move.from === sourceSquare
        );

        if (!isValidMove) {
            setErrorMessage(`Coup invalide : de ${sourceSquare} à ${targetSquare}`);
            return false;
        }

        const move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) {
            setErrorMessage(`Coup invalide : de ${sourceSquare} à ${targetSquare}`);
            return false;
        }

        if (gameCopy.isCheckmate()) { // Utiliser isCheckmate() au lieu de in_checkmate()
            setErrorMessage('Échec et mat ! La partie est terminée.');
        } else {
            setErrorMessage('');
        }

        setErrorMessage('');
        setGame(gameCopy);
        setFen(gameCopy.fen());
        return true;
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setFen(newGame.fen());
        setErrorMessage('');
    };

    return (
        <div className="local-game">
            <div className="local-game-container">
                <div className="local-game-content">
                    <h1>Partie d'échecs</h1>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button onClick={resetGame}>Réinitialiser la partie</button>
                </div>
                <div className="chessboard-container">
                    <Chessboard
                        position={fen}
                        onPieceDrop={handleMove}
                        boardWidth={boardWidth}
                        autoPromoteToQueen={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default LocalChessGame;