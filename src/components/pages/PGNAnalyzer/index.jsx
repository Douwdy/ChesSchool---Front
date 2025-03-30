import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { parse } from 'pgn-parser';
import './index.scss';

const PGNAnalyzer = () => {
    const [pgn, setPgn] = useState('');
    const [game, setGame] = useState(new Chess());
    const [moves, setMoves] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [error, setError] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [bestMove, setBestMove] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const movesListRef = useRef(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            // Utiliser pgn-parser pour analyser le PGN
            const parsedGames = parse(pgn);
            
            if (!parsedGames || parsedGames.length === 0) {
                setError('Aucune partie n\'a pu être extraite du PGN.');
                setIsLoading(false);
                return;
            }
            
            // Prendre la première partie trouvée
            const parsedGame = parsedGames[0];
            
            // Créer un nouvel échiquier et jouer les coups
            const newGame = new Chess();
            const moveHistory = [];
            
            // Jouer tous les mouvements
            for (const moveObj of parsedGame.moves) {
                try {
                    const move = newGame.move(moveObj.move);
                    if (move) {
                        moveHistory.push(move);
                    } else {
                        throw new Error(`Coup invalide: ${moveObj.move}`);
                    }
                } catch (moveError) {
                    console.error('Erreur lors du déplacement:', moveError);
                    setError(`Erreur de coup: ${moveObj.move}. Vérifiez le format PGN.`);
                    setIsLoading(false);
                    return;
                }
            }
            
            // Mettre à jour l'état
            setGame(newGame);
            setMoves(moveHistory);
            setCurrentMoveIndex(0);
            
            // Analyser la position initiale
            await analyzePosition(newGame.fen());
            
        } catch (e) {
            console.error('Erreur de parsing PGN:', e);
            setError(`Erreur de parsing: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const goToMove = async (index) => {
        // Créer un nouvel échiquier à partir de la position initiale
        const newGame = new Chess();
        
        // Jouer tous les coups jusqu'à l'index spécifié
        for (let i = 0; i < index; i++) {
            newGame.move(moves[i]);
        }
        
        setGame(newGame);
        setCurrentMoveIndex(index);
        
        // Analyser la nouvelle position
        await analyzePosition(newGame.fen());
    };

    const analyzePosition = async (fen) => {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'analyse de la position.');
            }

            const data = await response.json();
            setEvaluation(data.evaluation);
            setBestMove(data.bestMove);
        } catch (error) {
            console.error(error);
            setEvaluation(null);
            setBestMove('');
        }
    };

    // Organiser les coups par paires (blanc/noir)
    const organizedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
        organizedMoves.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            black: i + 1 < moves.length ? moves[i + 1] : null
        });
    }

    // Calculer la position de l'indicateur d'évaluation (%)
    const evalPosition = evaluation !== null 
        ? Math.max(0, Math.min(100, 50 - (evaluation / 10) * 5)) 
        : 50;

        useEffect(() => {
            // Attendre que le DOM soit complètement rendu
            setTimeout(() => {
                // Si un coup est sélectionné et que la référence à la liste existe
                if (currentMoveIndex >= 0 && movesListRef.current) {
                    // Trouver l'élément actif (coup blanc ou noir selon le cas)
                    const activeMoveElement = movesListRef.current.querySelector('.current');
                    
                    if (activeMoveElement) {
                        // Méthode simplifiée pour faire défiler l'élément en vue
                        activeMoveElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                        
                        // Empêcher le défilement de la page entière en rétablissant la position
                        const currentScrollY = window.scrollY;
                        window.scrollTo(0, currentScrollY);
                    }
                }
            }, 50); // Petit délai pour s'assurer que le DOM est à jour
        }, [currentMoveIndex]);

    return (
        <div className="pgn-analyzer">
            <h1>Analyseur PGN</h1>
            
            <div className="pgn-container">
                {/* Colonne gauche - Entrée PGN et barre d'évaluation */}
                <div className="left-column">
                    <div className="pgn-input">
                        <h2>PGN</h2>
                        <textarea
                            placeholder="Collez votre PGN ici..."
                            value={pgn}
                            onChange={(e) => setPgn(e.target.value)}
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Analyse en cours...' : 'Analyser'}
                        </button>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                    
                    <div className="evaluation-bar">
                        <h2>Évaluation</h2>
                        <div className="eval-container">
                            <div 
                                className="eval-marker" 
                                style={{ top: `${evalPosition}%` }}
                            ></div>
                            <div 
                                className="eval-value" 
                                style={{ top: `${evalPosition}%` }}
                            >
                                {evaluation !== null ? (evaluation > 0 ? '+' : '') + evaluation / 100 : '0.0'}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Colonne centrale - Échiquier et navigation */}
                <div className="center-column">
                    <div className="board-container">
                        <Chessboard position={game.fen()} />
                    </div>
                    
                    <div className="navigation-buttons">
                        <button
                            onClick={() => goToMove(Math.max(0, currentMoveIndex - 1))}
                            disabled={currentMoveIndex === 0 || isLoading}
                        >
                            ← Précédent
                        </button>
                        <button
                            onClick={() => goToMove(Math.min(moves.length, currentMoveIndex + 1))}
                            disabled={currentMoveIndex === moves.length || isLoading}
                        >
                            Suivant →
                        </button>
                    </div>
                    
                    <div className="best-move">
                        <h2>Meilleur coup</h2>
                        <p>{bestMove || 'En attente d\'analyse...'}</p>
                    </div>
                </div>
                
                {/* Colonne droite - Liste des coups */}
                <div className="right-column">
                    <h2>Liste des coups</h2>
                    <div className="moves-list" ref={movesListRef}>
                        <ul>
                            {organizedMoves.map((moveGroup, groupIndex) => (
                                <React.Fragment key={groupIndex}>
                                    <li className="move-number">{moveGroup.number}.</li>
                                    <li 
                                        className={`white-move ${currentMoveIndex === groupIndex * 2 ? 'current' : ''}`}
                                        onClick={() => goToMove(groupIndex * 2)}
                                    >
                                        {moveGroup.white.san}
                                    </li>
                                    <li 
                                        className={`black-move ${moveGroup.black && currentMoveIndex === groupIndex * 2 + 1 ? 'current' : ''}`}
                                        onClick={() => moveGroup.black && goToMove(groupIndex * 2 + 1)}
                                    >
                                        {moveGroup.black ? moveGroup.black.san : ''}
                                    </li>
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PGNAnalyzer;