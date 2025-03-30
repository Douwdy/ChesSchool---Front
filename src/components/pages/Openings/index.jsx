import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './index.scss';
import openings from './openings.json';

const Openings = () => {
    const [selectedOpening, setSelectedOpening] = useState(null);
    const [chess, setChess] = useState(new Chess());
    const [boardWidth, setBoardWidth] = useState(400); // Largeur par défaut du plateau

    useEffect(() => {
        const handleResize = () => {
            // Calculer la largeur dynamique entre 300px et 500px
            const newWidth = Math.min(Math.max(window.innerWidth * 0.8, 300), 500);
            setBoardWidth(newWidth);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Calcul initial
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleOpeningChange = (event) => {
        const opening = openings.find((o) => o.name === event.target.value);
        setSelectedOpening(opening);
        const newChess = new Chess();
        opening.moves.split(' ').forEach((move) => {
            newChess.move({ from: move.slice(0, 2), to: move.slice(2, 4) });
        });
        setChess(newChess);
    };

    return (
        <div className="openings">
            <div className="openings-container">
                <div className="openings-list">
                    <h2>Sélectionnez une ouverture</h2>
                    <select onChange={handleOpeningChange} defaultValue="">
                        <option value="" disabled>
                            Choisissez une ouverture
                        </option>
                        {openings.map((opening, index) => (
                            <option key={index} value={opening.name}>
                                {opening.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="openings-board">
                    {selectedOpening ? (
                        <>
                            <h2>{selectedOpening.name}</h2>
                            <p>Coups : {selectedOpening.moves}</p>
                            <div
                                className="chessboard-container"
                                style={{ width: `${boardWidth}px`, height: `${boardWidth}px` }} // Largeur et hauteur dynamiques
                            >
                                <Chessboard
                                    position={chess.fen()}
                                    boardWidth={boardWidth}
                                    animationDuration={300}
                                />
                            </div>
                        </>
                    ) : (
                        <p>Sélectionnez une ouverture pour voir ses coups.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Openings;