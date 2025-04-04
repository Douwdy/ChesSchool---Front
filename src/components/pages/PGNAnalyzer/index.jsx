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
    const [isLoading, setIsLoading] = useState(false);
    // Nouveaux états pour l'analyse de partie
    const [gameAnalysis, setGameAnalysis] = useState([]);
    const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    // Ajoutez un nouvel état pour stocker les métadonnées
    const [gameMetadata, setGameMetadata] = useState({
        white: '',
        whiteElo: '',
        black: '',
        blackElo: '',
        date: '',
        event: '',
        site: '',
        result: ''
    });
    // Nouvel état pour les onglets
    const [activeTab, setActiveTab] = useState('moves');

    const movesListRef = useRef(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError('');
        setGameAnalysis([]);
        
        try {
            const parsedGames = parse(pgn);
            
            if (!parsedGames || parsedGames.length === 0) {
                setError('Aucune partie n\'a pu être extraite du PGN.');
                setIsLoading(false);
                return;
            }
            
            const parsedGame = parsedGames[0];
            console.log("Partie analysée:", parsedGame);
            
            // Convertir le tableau d'en-têtes en objet pour un accès plus facile
            const headersObject = {};
            parsedGame.headers.forEach(header => {
                headersObject[header.name] = header.value;
            });
            
            // Extraire les métadonnées
            const metadata = {
                white: headersObject.White || 'Joueur inconnu',
                whiteElo: headersObject.WhiteElo || '?',
                black: headersObject.Black || 'Joueur inconnu',
                blackElo: headersObject.BlackElo || '?',
                date: headersObject.Date || '?',
                event: headersObject.Event || 'Partie',
                site: headersObject.Site || '',
                result: headersObject.Result || '*'
            };
            setGameMetadata(metadata);
            
            const newGame = new Chess();
            const moveHistory = [];
            const rawMoves = [];
            
            for (const moveObj of parsedGame.moves) {
                try {
                    const move = newGame.move(moveObj.move);
                    if (move) {
                        moveHistory.push(move);
                        rawMoves.push(moveObj.move);
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
            
            // Réinitialiser le jeu et mettre à jour les coups
            const initialGame = new Chess();
            setGame(initialGame);
            setMoves(moveHistory);
            setCurrentMoveIndex(0);
            
            // Analyser la position initiale
            await analyzePosition(initialGame.fen());
            
            // Lancer l'analyse complète de la partie en arrière-plan
            analyzeFullGame(rawMoves);
            
        } catch (e) {
            console.error('Erreur de parsing PGN:', e);
            setError(`Erreur de parsing: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Modification de la fonction analyzeFullGame pour envoyer le PGN
    const analyzeFullGame = async (rawMoves) => {
        if (!rawMoves || rawMoves.length === 0) return;
        
        setIsAnalyzingGame(true);
        setAnalysisProgress(0);
        
        try {
            // Ajouter plus de logs pour le débogage
            console.log("Envoi de la requête d'analyse avec le PGN:");
            console.log("PGN envoyé:", pgn);
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analyze-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pgn }),
            });

            console.log("Status de la réponse:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Contenu de l'erreur:", errorText);
                throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
            }

            // Log de la réponse brute
            const responseText = await response.text();
            console.log("Réponse brute:", responseText);
            
            // Tenter de parser la réponse JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`Réponse invalide du serveur: ${e.message}. Réponse: ${responseText}`);
            }
            
            console.log("Réponse parsée:", data);
            
            if (data.success && data.analysis) {
                console.log("Analyse reçue avec succès, nombre d'entrées:", data.analysis.length);
                setGameAnalysis(data.analysis);
            } else {
                throw new Error('Format de réponse inattendu: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            setError(`Erreur d'analyse: ${error.message}`);
        } finally {
            setIsAnalyzingGame(false);
        }
    };

    // Fonction pour analyser une position unique
    const analyzePosition = async (fen) => {
        try {
            // Ajout de l'URL complète
            const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erreur d'analyse:", errorText);
                throw new Error(`Erreur d'analyse: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Réponse d'analyse de position:", data);
            setEvaluation(data.evaluation);
        } catch (error) {
            console.error("Erreur lors de l'analyse:", error);
            setEvaluation(null);
        }
    };

    // Fonction pour convertir les évaluations de mate en valeurs numériques pour comparaison
    const convertToNumeric = (evaluation) => {
        if (evaluation === undefined || evaluation === null) return 0;
        if (typeof evaluation !== 'string') return evaluation;
        
        if (evaluation.startsWith('#')) {
            const moveNumber = parseInt(evaluation.replace(/[#-]/g, ''));
            const baseValue = 20;
            
            if (evaluation.includes('-')) {
                return -baseValue + (moveNumber * 0.1);
            } else {
                return baseValue - (moveNumber * 0.1);
            }
        }
        
        return parseFloat(evaluation);
    };

    // Fonction améliorée pour la classification des coups
    const getMoveQuality = (prevEval, currentEval, bestMoveEval, isWhite) => {
        // Convertir toutes les valeurs en numérique pour comparaison
        const numericPrevEval = convertToNumeric(prevEval);
        const numericCurrentEval = convertToNumeric(currentEval);
        const numericBestEval = convertToNumeric(bestMoveEval || currentEval);
        
        // Calculer la différence entre le coup joué et le meilleur coup
        // Pour les blancs, une valeur positive est bonne, pour les noirs c'est l'inverse
        let lostValue;
        
        if (isWhite) {
            // Pour les blancs: la différence entre la valeur du meilleur coup et celle du coup joué
            lostValue = numericBestEval - numericCurrentEval;
        } else {
            // Pour les noirs: la différence entre la valeur du coup joué et celle du meilleur coup
            // (car pour les noirs, une valeur négative est meilleure)
            lostValue = numericCurrentEval - numericBestEval;
        }
        
        // Ne retourner "brilliant" que si le coup est réellement excellent
        if (lostValue <= 0) return { class: 'brilliant', label: '!!' };     // Le coup est meilleur ou égal au coup suggéré
        if (lostValue <= 0.15) return { class: 'excellent', label: '!' };   // Presque aussi bon
        if (lostValue <= 0.3) return { class: 'good', label: '' };          // Légèrement inférieur
        if (lostValue <= 0.5) return { class: 'best', label: '' };          // Relativement bon
        if (lostValue <= 0.9) return { class: 'neutral', label: '' };       // Coup correct
        if (lostValue <= 1.5) return { class: 'inaccuracy', label: '⟳' };   // Imprécision
        if (lostValue <= 3.0) return { class: 'mistake', label: '?' };      // Erreur
        return { class: 'blunder', label: '??' };                           // Gaffe
    };

    // Fonction pour l'affichage de l'évaluation dans la barre d'évaluation
    const getEvalPosition = (evaluation) => {
        if (evaluation === null) return 50;
        
        if (typeof evaluation === 'string' && evaluation.includes('#')) {
            if (!evaluation.includes('-')) {
                return 10; // Mat en faveur des blancs
            } else {
                return 90; // Mat en faveur des noirs
            }
        }
        
        const normalizedEval = 50 - (evaluation * 5);
        return Math.min(Math.max(normalizedEval, 5), 95);
    };

    // Fonction pour formater l'affichage de l'évaluation
    const formatEvaluation = (evalValue) => {  // Renommer le paramètre 'eval' en 'evalValue'
        if (evalValue === null) return '0.0';
        
        if (typeof evalValue === 'string') {
            if (evalValue.startsWith('#')) {
                return evalValue; // Affiche directement #5 ou #-3
            }
            return evalValue;
        }
        
        const sign = evalValue > 0 ? '+' : '';
        return `${sign}${evalValue.toFixed(2)}`;
    };

    // Modification de goToMove pour utiliser les données d'analyse correctement
    const goToMove = async (index) => {
        const newGame = new Chess();
        
        // Jouer tous les coups jusqu'à l'index
        for (let i = 0; i < index; i++) {
            newGame.move(moves[i]);
        }
        
        setGame(newGame);
        setCurrentMoveIndex(index);
        
        console.log("Aller au coup", index);
        console.log("Analyse disponible:", gameAnalysis.length, "positions");
        
        // Vérifier si nous avons une analyse pour ce coup
        if (gameAnalysis && gameAnalysis.length > 0) {
            // Trouver l'analyse correspondante (index-1 car la première analyse est pour le premier coup)
            const analysisIndex = index > 0 ? index - 1 : 0;
            console.log("Recherche d'analyse à l'index:", analysisIndex);
            
            if (analysisIndex < gameAnalysis.length) {
                const analysisData = gameAnalysis[analysisIndex];
                console.log("Donnée d'analyse trouvée:", analysisData);
                
                if (analysisData.evaluation !== undefined) {
                    setEvaluation(analysisData.evaluation);
                }
            } else {
                console.log("Pas d'analyse disponible pour cet index");
                // Analyser la position à la volée
                await analyzePosition(newGame.fen());
            }
        } else {
            console.log("Aucune analyse disponible, analyse à la volée");
            // Aucune analyse disponible, analyser à la volée
            await analyzePosition(newGame.fen());
        }
    };

    // Effet pour mettre à jour la progression de l'analyse
    useEffect(() => {
        if (gameAnalysis.length > 0 && moves.length > 0) {
            setAnalysisProgress(Math.min(100, (gameAnalysis.length / moves.length) * 100));
        }
    }, [gameAnalysis, moves]);

    // Effet pour faire défiler jusqu'au coup actuel
    useEffect(() => {
        setTimeout(() => {
            if (currentMoveIndex >= 0 && movesListRef.current) {
                const activeMoveElement = movesListRef.current.querySelector('.current');
                
                if (activeMoveElement) {
                    activeMoveElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    const currentScrollY = window.scrollY;
                    window.scrollTo(0, currentScrollY);
                }
            }
        }, 50);
    }, [currentMoveIndex]);

    // Ajoutez cet effet pour gérer la connexion SSE
    useEffect(() => {
        let eventSource = null;
        
        if (isAnalyzingGame) {
            // Établir une connexion SSE
            eventSource = new EventSource(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analysis-status`);
            
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.status === 'analyzing') {
                        console.log('Mise à jour SSE reçue:', data);
                        // Mettre à jour la progression
                        setAnalysisProgress(data.progress);
                        // Optionnellement, mettre à jour d'autres états pour refléter l'avancement
                    }
                } catch (e) {
                    console.error('Erreur lors du parsing des données SSE:', e);
                }
            };
            
            eventSource.onerror = () => {
                console.error('Erreur de connexion SSE');
                if (eventSource) {
                    eventSource.close();
                }
            };
        }
        
        // Nettoyer la connexion à la désactivation
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [isAnalyzingGame]);

    // Calculer la qualité des coups selon l'analyse
    const getMovesWithQuality = () => {
        const movesWithQuality = [];
        
        if (!gameAnalysis || gameAnalysis.length === 0) {
            return moves.map(move => ({
                ...move,
                quality: { class: 'neutral', label: '' }
            }));
        }
        
        let lastEval = gameAnalysis[0]?.evaluation || 0;
        
        for (let i = 0; i < moves.length; i++) {
            const currentEval = gameAnalysis[i + 1]?.evaluation;
            const bestMoveEval = gameAnalysis[i + 1]?.bestMoves?.[0]?.evaluation || currentEval;
            const isWhite = i % 2 === 0;
            
            if (currentEval !== undefined) {
                const quality = getMoveQuality(lastEval, currentEval, bestMoveEval, isWhite);
                movesWithQuality.push({
                    ...moves[i],
                    quality
                });
                lastEval = currentEval;
            } else {
                movesWithQuality.push({
                    ...moves[i],
                    quality: { class: 'neutral', label: '' }
                });
            }
        }
        
        return movesWithQuality;
    };

    // Utilisez cette fonction pour obtenir les coups avec leur qualité
    const movesWithQuality = getMovesWithQuality();

    const organizedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
        organizedMoves.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            black: i + 1 < moves.length ? moves[i + 1] : null
        });
    }

    const evalPos = getEvalPosition(evaluation);
    const whiteHeight = `${evalPos}%`;
    const blackHeight = `${100 - evalPos}%`;

    // Ajoutez une fonction pour calculer les statistiques de la partie
    const calculateGameStats = () => {
        if (!gameAnalysis || gameAnalysis.length === 0) {
            return null;
        }
        
        const stats = {
            white: { 
                brilliant: 0, good: 0, excellent: 0, best: 0, 
                neutral: 0, inaccuracy: 0, mistake: 0, blunder: 0 
            },
            black: { 
                brilliant: 0, good: 0, excellent: 0, best: 0, 
                neutral: 0, inaccuracy: 0, mistake: 0, blunder: 0 
            },
            averageEvaluation: 0
        };
        
        let lastEval = gameAnalysis[0]?.evaluation || 0;
        let evalSum = 0;
        let validEvalCount = 0;
        
        for (let i = 0; i < moves.length; i++) {
            const currentEval = gameAnalysis[i + 1]?.evaluation;
            const bestMoveEval = gameAnalysis[i + 1]?.bestMoves?.[0]?.evaluation || currentEval;
            const isWhite = i % 2 === 0;
            const player = isWhite ? 'white' : 'black';
            
            if (currentEval !== undefined) {
                const quality = getMoveQuality(lastEval, currentEval, bestMoveEval, isWhite);
                
                if (stats[player][quality.class] !== undefined) {
                    stats[player][quality.class]++;
                }
                
                lastEval = currentEval;
                
                if (typeof currentEval === 'number') {
                    evalSum += Math.abs(currentEval);
                    validEvalCount++;
                }
            }
        }
        
        stats.averageEvaluation = validEvalCount > 0 ? evalSum / validEvalCount : 0;
        return stats;
    };

    // Utilisez ce composant mis à jour pour afficher les statistiques
    const GameStats = ({ stats }) => {
        if (!stats) return null;
        
        return (
            <div className="game-stats">
                <h3>Statistiques de la partie</h3>
                <div className="stats-container">
                    <div className="player-stats white-stats">
                        <h4>{gameMetadata.white || 'Blancs'}</h4>
                        <div className="stat-item brilliant">{stats.white.brilliant} coup(s) brillant(s)</div>
                        <div className="stat-item good">{stats.white.good} bon(s) coup(s)</div>
                        <div className="stat-item excellent">{stats.white.excellent} excellent(s) coup(s)</div>
                        <div className="stat-item best">{stats.white.best} meilleur(s) coup(s)</div>
                        <div className="stat-item neutral">{stats.white.neutral} coup(s) correct(s)</div>
                        <div className="stat-item inaccuracy">{stats.white.inaccuracy} imprécision(s)</div>
                        <div className="stat-item mistake">{stats.white.mistake} erreur(s)</div>
                        <div className="stat-item blunder">{stats.white.blunder} gaffe(s)</div>
                    </div>
                    <div className="player-stats black-stats">
                        <h4>{gameMetadata.black || 'Noirs'}</h4>
                        <div className="stat-item brilliant">{stats.black.brilliant} coup(s) brillant(s)</div>
                        <div className="stat-item good">{stats.black.good} bon(s) coup(s)</div>
                        <div className="stat-item excellent">{stats.black.excellent} excellent(s) coup(s)</div>
                        <div className="stat-item best">{stats.black.best} meilleur(s) coup(s)</div>
                        <div className="stat-item neutral">{stats.black.neutral} coup(s) correct(s)</div>
                        <div className="stat-item inaccuracy">{stats.black.inaccuracy} imprécision(s)</div>
                        <div className="stat-item mistake">{stats.black.mistake} erreur(s)</div>
                        <div className="stat-item blunder">{stats.black.blunder} gaffe(s)</div>
                    </div>
                </div>
                <div className="average-eval">
                    Évaluation moyenne: {stats.averageEvaluation.toFixed(2)}
                </div>
            </div>
        );
    };

    // Dans votre composant React
    const QualityLegend = () => (
        <div className="quality-legend">
            <h3>Légende des coups</h3>
            <div className="legend-items">
                <div className="legend-item">
                    <span className="color-box brilliant"></span>
                    <span className="label">Coup brillant (!!) - Coup équivalent ou meilleur que celui suggéré par le moteur (≤0.05)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box excellent"></span>
                    <span className="label">Excellent coup (!) - Presque aussi bon que le meilleur coup (≤0.15)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box good"></span>
                    <span className="label">Bon coup - Coup légèrement sous-optimal (≤0.3)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box best"></span>
                    <span className="label">Meilleur coup - Coup correct mais des alternatives existent (≤0.5)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box neutral"></span>
                    <span className="label">Coup correct - Coup acceptable (≤0.9)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box inaccuracy"></span>
                    <span className="label">Imprécision (⟳) - Perte de valeur modérée (≤1.5)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box mistake"></span>
                    <span className="label">Erreur (?) - Perte significative de valeur (≤3.0)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box blunder"></span>
                    <span className="label">Gaffe (??) - Grave erreur (&gt;3.0)</span>
                </div>
            </div>
        </div>
    );

    const gameStats = calculateGameStats();

    const inBuild = false;
    if (inBuild) {
        return (
            <div className="pgn-analyzer">
                <h1>Analyseur PGN</h1>
                <p>Cette fonctionnalité est en cours de développement.</p>
            </div>
        );
    } else {
        return (
            <div className="pgn-analyzer">
                {(gameMetadata.white || gameMetadata.black) && (
                    <div className="game-metadata">
                        <div className="players-info">
                            <div className="player white">
                                <div className="player-name">{gameMetadata.white}</div>
                                {gameMetadata.whiteElo !== '?' && (
                                    <div className="player-elo">{gameMetadata.whiteElo}</div>
                                )}
                            </div>
                            <div className="versus">vs</div>
                            <div className="player black">
                                <div className="player-name">{gameMetadata.black}</div>
                                {gameMetadata.blackElo !== '?' && (
                                    <div className="player-elo">{gameMetadata.blackElo}</div>
                                )}
                            </div>
                        </div>
                        <div className="game-details">
                            {gameMetadata.event !== '?' && (
                                <div className="event">{gameMetadata.event}</div>
                            )}
                            {gameMetadata.date !== '?' && (
                                <div className="date">{gameMetadata.date}</div>
                            )}
                            {gameMetadata.site && (
                                <div className="site">{gameMetadata.site}</div>
                            )}
                            {gameMetadata.result !== '*' && (
                                <div className="result">Résultat: {gameMetadata.result}</div>
                            )}
                        </div>
                    </div>
                )}
                <div className="pgn-container">
                    {/* Colonne gauche - Entrée PGN */}
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
                                disabled={isLoading || isAnalyzingGame}
                            >
                                {isLoading ? 'Chargement...' : 'Analyser'}
                            </button>
                            
                            {/* Affichage amélioré de la progression d'analyse */}
                            {isAnalyzingGame && (
                                <div className="analysis-progress">
                                    <p>
                                        <span className="analysis-spinner">⏳</span>
                                        Analyse en cours... {Math.floor(analysisProgress)}%
                                    </p>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ 
                                                width: `${analysisProgress}%`,
                                                transition: 'width 0.3s ease-in-out'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            
                            {error && <p className="error-message">{error}</p>}
                        </div>
                    </div>
                    
                    {/* Colonne centrale - Échiquier avec barre d'évaluation à gauche et navigation */}
                    <div className="center-column">
                        <div className="current-player">
                            <div className={`player-indicator ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
                                <span className="piece-symbol">{game.turn() === 'w' ? '♔' : '♚'}</span>
                                <span className="player-name">
                                    {game.turn() === 'w' ? gameMetadata.white : gameMetadata.black} à jouer
                                </span>
                            </div>
                            <div className="move-number">
                                Coup {Math.floor(currentMoveIndex / 2) + 1}
                                {game.turn() === 'w' ? '' : '...'}
                            </div>
                        </div>
                        <div className="board-with-eval">
                            <div className="evaluation-bar">
                                <div className="eval-container">
                                    <div className="white-eval" style={{ height: whiteHeight }}></div>
                                    <div className="black-eval" style={{ height: blackHeight }}></div>
                                    <div 
                                        className="eval-value" 
                                        style={{ top: `${evalPos}%` }}
                                    >
                                        {formatEvaluation(evaluation)}
                                    </div>
                                </div>
                            </div>
                            <div className="board-container">
                                <Chessboard position={game.fen()} />
                            </div>
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
                    </div>
                    
                    {/* Colonne droite avec système d'onglets */}
                    <div className="right-column">
                        <div className="tabs-container">
                            <div className="tabs-nav">
                                <button 
                                    className={activeTab === 'moves' ? 'active' : ''} 
                                    onClick={() => setActiveTab('moves')}
                                >
                                    Coups
                                </button>
                                <button 
                                    className={activeTab === 'stats' ? 'active' : ''} 
                                    onClick={() => setActiveTab('stats')}
                                    disabled={!gameStats}
                                >
                                    Statistiques
                                </button>
                                <button 
                                    className={activeTab === 'legend' ? 'active' : ''} 
                                    onClick={() => setActiveTab('legend')}
                                >
                                    Légende
                                </button>
                            </div>
                            
                            <div className="tabs-content">
                                {/* Onglet Liste des coups */}
                                {activeTab === 'moves' && (
                                    <div className="tab-pane">
                                        <div className="moves-list" ref={movesListRef}>
                                            <ul>
                                                {organizedMoves.map((moveGroup, groupIndex) => (
                                                    <React.Fragment key={groupIndex}>
                                                        <li className="move-number">{moveGroup.number}.</li>
                                                        <li 
                                                            className={`white-move ${currentMoveIndex === groupIndex * 2 ? 'current' : ''} ${
                                                                movesWithQuality[groupIndex * 2]?.quality?.class || ''
                                                            }`}
                                                            onClick={() => goToMove(groupIndex * 2)}
                                                        >
                                                            {moveGroup.white.san} 
                                                            <span className={`move-quality ${movesWithQuality[groupIndex * 2]?.quality?.class || ''}`}>
                                                                {movesWithQuality[groupIndex * 2]?.quality?.label || ''}
                                                            </span>
                                                        </li>
                                                        <li 
                                                            className={`black-move ${moveGroup.black && currentMoveIndex === groupIndex * 2 + 1 ? 'current' : ''} ${
                                                                moveGroup.black ? (movesWithQuality[groupIndex * 2 + 1]?.quality?.class || '') : ''
                                                            }`}
                                                            onClick={() => moveGroup.black && goToMove(groupIndex * 2 + 1)}
                                                        >
                                                            {moveGroup.black ? moveGroup.black.san : ''}
                                                            {moveGroup.black && (
                                                                <span className="move-quality">
                                                                    {movesWithQuality[groupIndex * 2 + 1]?.quality?.label || ''}
                                                                </span>
                                                            )}
                                                        </li>
                                                    </React.Fragment>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Onglet Statistiques */}
                                {activeTab === 'stats' && (
                                    <div className="tab-pane">
                                        {gameStats ? (
                                            <GameStats stats={gameStats} />
                                        ) : (
                                            <div className="no-stats">
                                                Aucune statistique disponible. Analysez une partie d'abord.
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Onglet Légende */}
                                {activeTab === 'legend' && (
                                    <div className="tab-pane">
                                        <QualityLegend />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Supprimer ces éléments car ils sont maintenant dans les onglets */}
            </div>
        );
    };
}
export default PGNAnalyzer;