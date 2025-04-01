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
            
            const response = await fetch('http://localhost:5001/api/analyze-game', {
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
            const response = await fetch('http://localhost:5001/api/analyze', {
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
            eventSource = new EventSource('http://localhost:5001/api/analysis-status');
            
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

    // Ajoutez cette fonction helper corrigée
    const getMoveQuality = (prevEval, currentEval, isWhite) => {
        // Gestion des valeurs de mat
        if (typeof prevEval === 'string' || typeof currentEval === 'string') {
            // Si l'une des évaluations est un mat, traitement spécial
            return handleMateEvaluation(prevEval, currentEval, isWhite);
        }

        // Pour les coups blancs, une augmentation d'évaluation est bonne
        // Pour les coups noirs, une diminution d'évaluation est bonne
        const evalChange = isWhite ? currentEval - prevEval : prevEval - currentEval;
        
        // Classifier la qualité du coup en s'inspirant des seuils de chess.com
        if (evalChange > 5) return { class: 'brilliant', label: '!!' };     // Brillant (gain exceptionnel)
        if (evalChange > 2.5) return { class: 'good', label: '!' };         // Bon coup (gain très significatif)
        if (evalChange > 1.2) return { class: 'excellent', label: '!' };    // Excellent (gain significatif)
        if (evalChange > 0.5) return { class: 'best', label: '' };          // Meilleur coup (gain modéré)
        if (evalChange >= -0.2) return { class: 'neutral', label: '' };     // Coup correct (neutre)
        if (evalChange >= -0.6) return { class: 'inaccuracy', label: '⟳' }; // Imprécision (perte mineure)
        if (evalChange >= -1.5) return { class: 'mistake', label: '?' };    // Erreur (perte significative)
        return { class: 'blunder', label: '??' };                          // Gaffe (perte grave)
    };

    // Fonction auxiliaire pour traiter les évaluations de mat
    const handleMateEvaluation = (prevEval, currentEval, isWhite) => {
        // Convertir les valeurs de mat en nombres
        const prevValue = convertMateToValue(prevEval);
        const currentValue = convertMateToValue(currentEval);
        
        // Calculer le changement d'évaluation
        const evalChange = isWhite ? currentValue - prevValue : prevValue - currentValue;
        
        // Utiliser les mêmes seuils que pour les évaluations normales
        if (evalChange > 5) return { class: 'brilliant', label: '!!' };
        if (evalChange > 3) return { class: 'good', label: '!' }; 
        if (evalChange > 1) return { class: 'excellent', label: '!' };
        if (evalChange > 0) return { class: 'best', label: '' };
        if (evalChange >= -1) return { class: 'neutral', label: '' };
        if (evalChange >= -3) return { class: 'inaccuracy', label: '⟳' };
        if (evalChange >= -5) return { class: 'mistake', label: '?' };
        return { class: 'blunder', label: '??' };
    };

    // Fonction pour convertir une valeur de mat en nombre pour comparaison
    const convertMateToValue = (evaluation) => {
        if (typeof evaluation !== 'string') return evaluation;
        
        // Mat en faveur des blancs (ex: "#5")
        if (evaluation.startsWith('#') && !evaluation.startsWith('#-')) {
            const moves = parseInt(evaluation.slice(1));
            return 100 - moves; // Plus le mat est proche, plus la valeur est élevée
        }
        // Mat en faveur des noirs (ex: "#-3")
        else if (evaluation.startsWith('#-')) {
            const moves = Math.abs(parseInt(evaluation.slice(2)));
            return -100 + moves; // Plus le mat est proche, plus la valeur est basse
        }
        
        return 0; // Valeur par défaut
    };

    // Calculer la qualité des coups selon l'analyse
    const getMovesWithQuality = () => {
        const movesWithQuality = [];
        
        if (!gameAnalysis || gameAnalysis.length === 0) {
            return moves.map(move => ({
                ...move,
                quality: { class: 'neutral', label: '' }
            }));
        }
        
        // Évaluation initiale (position de départ)
        let lastEval = gameAnalysis[0]?.evaluation || 0;
        
        // Pour chaque coup, déterminer la qualité
        for (let i = 0; i < moves.length; i++) {
            const currentEval = gameAnalysis[i + 1]?.evaluation;
            const isWhite = i % 2 === 0;
            
            if (currentEval !== undefined) {
                const quality = getMoveQuality(lastEval, currentEval, isWhite);
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

    const evalPosition = evaluation === null ? 50 : Math.min(Math.max(50 - evaluation / 0.3, 5), 95);

    // Calculer les hauteurs pour les parties blanche et noire
    const whiteHeight = `${evalPosition}%`;
    const blackHeight = `${100 - evalPosition}%`;

    // Ajoutez une fonction pour calculer les statistiques de la partie
    const calculateGameStats = () => {
        if (!gameAnalysis || gameAnalysis.length === 0) {
            return null;
        }
        
        // Initialiser les compteurs avec toutes les catégories
        const stats = {
            white: { 
                brilliant: 0, 
                good: 0, 
                excellent: 0, 
                best: 0, 
                neutral: 0, 
                inaccuracy: 0, 
                mistake: 0, 
                blunder: 0 
            },
            black: { 
                brilliant: 0, 
                good: 0, 
                excellent: 0, 
                best: 0, 
                neutral: 0, 
                inaccuracy: 0, 
                mistake: 0, 
                blunder: 0 
            },
            averageEvaluation: 0
        };
        
        // Évaluation initiale
        let lastEval = gameAnalysis[0]?.evaluation || 0;
        let evalSum = 0;
        
        // Parcourir tous les coups
        for (let i = 0; i < moves.length; i++) {
            const currentEval = gameAnalysis[i + 1]?.evaluation;
            const isWhite = i % 2 === 0;
            const player = isWhite ? 'white' : 'black';
            
            if (currentEval !== undefined) {
                // Obtenir la qualité avec notre fonction améliorée
                const quality = getMoveQuality(lastEval, currentEval, isWhite);
                
                // Incrémenter le compteur approprié
                if (stats[player][quality.class] !== undefined) {
                    stats[player][quality.class]++;
                }
                
                // Mettre à jour pour le prochain coup
                lastEval = currentEval;
                evalSum += typeof currentEval === 'number' ? Math.abs(currentEval) : 0;
            }
        }
        
        // Calculer l'évaluation moyenne
        const validEvaluations = gameAnalysis.filter(a => typeof a.evaluation === 'number').length;
        stats.averageEvaluation = validEvaluations > 0 ? evalSum / validEvaluations : 0;
        
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
                    <span className="label">Coup brillant (!!) - Coup exceptionnel qui change radicalement l'évaluation (&gt;3 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box good"></span>
                    <span className="label">Bon coup (!) - Coup fort qui améliore significativement la position (&gt;1.5 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box excellent"></span>
                    <span className="label">Excellent coup - Coup solide qui améliore la position (&gt;0.5 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box best"></span>
                    <span className="label">Meilleur coup - Coup optimal ou très bon (&gt;0.2 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box neutral"></span>
                    <span className="label">Coup correct - Sans gain ni perte significative</span>
                </div>
                <div className="legend-item">
                    <span className="color-box inaccuracy"></span>
                    <span className="label">Imprécision (⟳) - Coup qui n'est pas optimal (-0.3 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box mistake"></span>
                    <span className="label">Erreur (?) - Coup qui détériore la position (-0.9 points)</span>
                </div>
                <div className="legend-item">
                    <span className="color-box blunder"></span>
                    <span className="label">Gaffe (??) - Grave erreur qui perd un avantage significatif (-2 points ou plus)</span>
                </div>
            </div>
        </div>
    );

    const gameStats = calculateGameStats();

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
                                    style={{ top: `${evalPosition}%` }}
                                >
                                    {evaluation !== null ? (evaluation > 0 ? '+' : '') + evaluation / 100 : '0.0'}
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

export default PGNAnalyzer;