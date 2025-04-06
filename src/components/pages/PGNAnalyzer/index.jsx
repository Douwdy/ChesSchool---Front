import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { parse } from 'pgn-parser';
import { useTranslation } from 'react-i18next';
import './index.scss';

// Déplacez ces fonctions utilitaires à l'extérieur du composant principal
// pour qu'elles soient accessibles partout
const convertToNumeric = (evaluation) => {
    if (evaluation === undefined || evaluation === null) return 0;
    if (typeof evaluation !== 'string') return evaluation;
    
    if (evaluation.startsWith('#')) {
        const moveNumber = parseInt(evaluation.replace(/[#-]/g, ''));
        // Utiliser 1000 au lieu de 20 pour être cohérent avec le backend
        const baseValue = 1000;
        
        if (evaluation.includes('-')) {
            return -baseValue + (moveNumber * 0.1); // Mat contre nous
        } else {
            return baseValue - (moveNumber * 0.1); // Mat en notre faveur
        }
    }
    
    return parseFloat(evaluation);
};

const formatEvaluation = (evalValue) => {
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

const calculateAccuracy = (playerStats) => {
    const totalMoves = playerStats.excellent + playerStats.good + 
                    playerStats.inaccuracy + playerStats.mistake + 
                    playerStats.blunder;
    
    if (!totalMoves) return 0;
    
    // Weight each move type differently
    const weightedScore = 
    (playerStats.excellent * 100) + 
    (playerStats.good * 80) +
    (playerStats.inaccuracy * 50) +
    (playerStats.mistake * 20) +
    (playerStats.blunder * 0);
    
    return Math.round((weightedScore / (totalMoves * 100)) * 100);
};

// Nouvelle version plus compacte du graphique d'évaluation
const CompactEvaluationChart = ({ gameAnalysis, moves, onSelectMove, t }) => {
  if (!gameAnalysis || gameAnalysis.length === 0) return null;
  
  // Préparer les données pour le graphique
  const chartData = gameAnalysis.map((analysis, index) => {
    let evalValue = convertToNumeric(analysis.evaluation);
    // Limiter les valeurs entre -5 et +5 pour une meilleure visualisation
    evalValue = Math.min(Math.max(evalValue, -5), 5);
    
    return {
      moveIndex: index,
      moveNumber: Math.floor(index / 2) + 1,
      isWhite: index % 2 === 0,
      evalValue: evalValue,
      san: index < moves.length ? moves[index].san : ''
    };
  });
  
  return (
    <div className="compact-evaluation-chart">
      {/* Ligne de base (0.0) */}
      <div className="chart-baseline"></div>
      
      {/* Barres du graphique */}
      {chartData.map((data, idx) => {
        // Calculer la hauteur de la barre proportionnellement à l'évaluation
        const value = data.evalValue;
        const height = Math.min(Math.abs(value * 10), 50); // max 50px
        const top = value > 0 ? 50 - height : 50;
        
        return (
          <div 
            key={idx}
            className="chart-bar"
            onClick={() => onSelectMove && onSelectMove(data.moveIndex)}
            title={`${data.isWhite ? t('pgnAnalyzer.status.white') : t('pgnAnalyzer.status.black')}: ${data.san} (${formatEvaluation(data.evalValue)})`}
          >
            <div 
              className="bar-fill"
              style={{ 
                height: `${height}px`, 
                top: `${top}px`,
                backgroundColor: value > 0 ? '#e6e6e6' : '#333'
              }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

// Nouveau composant compact pour les statistiques de jeu
const CompactGameStats = ({ stats, gameMetadata, t }) => {
  if (!stats) return null;
  
  // Calculer le total des coups pour chaque joueur
  const whiteTotalMoves = stats.white.excellent + stats.white.good + 
                         stats.white.inaccuracy + stats.white.mistake + 
                         stats.white.blunder;
                         
  const blackTotalMoves = stats.black.excellent + stats.black.good + 
                         stats.black.inaccuracy + stats.black.mistake + 
                         stats.black.blunder;
  
  // Calculer la précision
  const whiteAccuracy = calculateAccuracy(stats.white);
  const blackAccuracy = calculateAccuracy(stats.black);
  
  return (
    <div className="compact-game-stats">
      {/* En-tête avec les précisions */}
      <div className="stats-header">
        <div className="player-column white">
          <div className="player-name">{gameMetadata.white || t('pgnAnalyzer.status.white')}</div>
          <div className="player-accuracy">{whiteAccuracy}%</div>
        </div>
        <div className="stat-label">{t('pgnAnalyzer.stats.accuracy')}</div>
        <div className="player-column black">
        <div className="player-name">{gameMetadata.black || t('pgnAnalyzer.status.black')}</div>
          <div className="player-accuracy">{blackAccuracy}%</div>
        </div>
      </div>
      
      {/* Tableau de statistiques */}
      <table className="moves-quality-table">
        <tbody>
          <tr className="excellent-row">
            <td className="white-count">{stats.white.excellent}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.excellent')}</td>
            <td className="black-count">{stats.black.excellent}</td>
          </tr>
          <tr className="good-row">
            <td className="white-count">{stats.white.good}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.good')}</td>
            <td className="black-count">{stats.black.good}</td>
          </tr>
          <tr className="inaccuracy-row">
            <td className="white-count">{stats.white.inaccuracy}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.inaccuracy')}</td>
            <td className="black-count">{stats.black.inaccuracy}</td>
          </tr>
          <tr className="mistake-row">
            <td className="white-count">{stats.white.mistake}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.mistake')}</td>
            <td className="black-count">{stats.black.mistake}</td>
          </tr>
          <tr className="blunder-row">
            <td className="white-count">{stats.white.blunder}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.blunder')}</td>
            <td className="black-count">{stats.black.blunder}</td>
          </tr>
          <tr className="total-row">
            <td className="white-count">{whiteTotalMoves}</td>
            <td className="quality-name">{t('pgnAnalyzer.stats.moveQuality.total')}</td>
            <td className="black-count">{blackTotalMoves}</td>
          </tr>
        </tbody>
      </table>
      
      {/* Analyse simplifiée */}
      <div className="game-analysis-summary">
        {whiteAccuracy > blackAccuracy + 10 && (
          <p>{t('pgnAnalyzer.stats.analysis.whiteSuperiority')}</p>
        )}
        {blackAccuracy > whiteAccuracy + 10 && (
          <p>{t('pgnAnalyzer.stats.analysis.blackSuperiority')}</p>
        )}
        {Math.abs(whiteAccuracy - blackAccuracy) <= 10 && (
          <p>{t('pgnAnalyzer.stats.analysis.equal')}</p>
        )}
        
        {stats.white.blunder > 0 && stats.white.blunder > stats.black.blunder && (
          <p>{t('pgnAnalyzer.stats.analysis.whiteBlunders', { count: stats.white.blunder })}</p>
        )}
        {stats.black.blunder > 0 && stats.black.blunder > stats.white.blunder && (
          <p>{t('pgnAnalyzer.stats.analysis.blackBlunders', { count: stats.black.blunder })}</p>
        )}
      </div>
    </div>
  );
};

// Nouveau composant pour l'affichage des alternatives dans la zone gauche
const AlternativesCard = ({ currentMoveIndex, movesWithQuality, gameAnalysis, t }) => {
  // Si aucun coup sélectionné ou pas d'analyse disponible
  if (currentMoveIndex <= 0 || !gameAnalysis || gameAnalysis.length === 0) {
    return (
      <div className="alternatives-card empty">
        <h3>{t('pgnAnalyzer.alternatives.title')}</h3>
        <p className="no-alternatives">{t('pgnAnalyzer.alternatives.noAlternatives')}</p>
      </div>
    );
  }

  // S'assurer que l'index est valide et ajuster car currentMoveIndex représente la position après avoir joué le coup
  // Nous voulons l'analyse du coup qui vient d'être joué, donc currentMoveIndex - 1
  const analysisIndex = Math.min(currentMoveIndex - 1, gameAnalysis.length - 1);
  const moveAnalysis = gameAnalysis[analysisIndex];
  
  if (!moveAnalysis || !moveAnalysis.bestMoves || moveAnalysis.bestMoves.length === 0) {
    return (
      <div className="alternatives-card empty">
        <h3>{t('pgnAnalyzer.alternatives.title')}</h3>
        <p className="no-alternatives">{t('pgnAnalyzer.alternatives.notAvailable')}</p>
      </div>
    );
  }

  // Comme currentMoveIndex représente la position après le coup, on l'utilise directement
  // pour afficher le coup qui vient d'être joué
  const moveNumber = Math.floor((currentMoveIndex - 1) / 2) + 1;
  const isWhite = (currentMoveIndex - 1) % 2 === 0;
  const moveWithQuality = movesWithQuality[currentMoveIndex - 1];
  
  return (
    <div className="alternatives-card">
      <h3>
        {t('pgnAnalyzer.alternatives.alternativeTo')} {moveNumber}{!isWhite ? '...' : '.'} 
        <span className="played-move">{moveWithQuality?.san || ''}</span>
      </h3>
      
      <div className="alternatives-grid">
        {moveAnalysis.bestMoves.map((alt, idx) => (
          <div key={idx} className={`alternative ${idx === 0 ? 'best-move' : ''}`}>
            <div className="alt-rank">{idx + 1}</div>
            {/* Assurez-vous que la notation san est bien affichée */}
            <div className="alt-san">{alt.san || "?"}</div>
            <div className="alt-eval">{formatEvaluation(alt.evaluation)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PGNAnalyzer = () => {
    const { t } = useTranslation();
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
                white: headersObject.White || t('pgnAnalyzer.status.white'),
                whiteElo: headersObject.WhiteElo || '?',
                black: headersObject.Black || t('pgnAnalyzer.status.black'),
                blackElo: headersObject.BlackElo || '?',
                date: headersObject.Date || '?',
                event: headersObject.Event || t('pgnAnalyzer.input.title'),
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

    // Cette fonction convertit la qualité du coup reçue du serveur en format d'affichage
    const getMoveDisplayQuality = (moveQuality) => {
        switch(moveQuality) {
            case 'excellent':
                return { class: 'excellent', label: '!' };
            case 'good':
                return { class: 'good', label: '' };
            case 'inaccuracy':
                return { class: 'inaccuracy', label: '⟳' };
            case 'mistake':
                return { class: 'mistake', label: '?' };
            case 'blunder':
                return { class: 'blunder', label: '??' };
            default:
                return { class: 'neutral', label: '' };
        }
    };

    // Mettre à jour la fonction getMovesWithQuality pour utiliser directement la qualité du serveur
    const getMovesWithQuality = () => {
        const movesWithQuality = [];
        
        if (!gameAnalysis || gameAnalysis.length === 0) {
            return moves.map(move => ({
                ...move,
                quality: { class: 'neutral', label: '' }
            }));
        }
        
        for (let i = 0; i < moves.length; i++) {
            const analysisData = gameAnalysis[i];
            
            if (analysisData) {
                const quality = getMoveDisplayQuality(analysisData.moveQuality);
                
                // Calculer les alternatives (comme avant)
                const bestMoves = analysisData.bestMoves || [];
                const alternatives = bestMoves.map(move => ({
                    san: move.san,
                    evaluation: move.evaluation,
                    advantage: analysisData.evalDifference / 100 // Convertir centipions en pions
                })).filter(move => move.advantage > 0.1);
                
                movesWithQuality.push({
                    ...moves[i],
                    quality,
                    alternatives: alternatives.slice(0, 2),
                    actualEval: analysisData.evaluation
                });
            } else {
                movesWithQuality.push({
                    ...moves[i],
                    quality: { class: 'neutral', label: '' },
                    alternatives: []
                });
            }
        }
        
        return movesWithQuality;
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
                excellent: 0, good: 0, 
                inaccuracy: 0, mistake: 0, blunder: 0
            },
            black: { 
                excellent: 0, good: 0, 
                inaccuracy: 0, mistake: 0, blunder: 0
            },
            averageEvaluation: 0
        };
        
        let evalSum = 0;
        let validEvalCount = 0;
        
        for (let i = 0; i < gameAnalysis.length; i++) {
            const analysis = gameAnalysis[i];
            const player = analysis.isWhite ? 'white' : 'black';
            
            if (analysis.moveQuality && stats[player][analysis.moveQuality] !== undefined) {
                stats[player][analysis.moveQuality]++;
            }
            
            // Ajouter à la moyenne d'évaluation
            if (typeof analysis.evaluation === 'number') {
                evalSum += Math.abs(analysis.evaluation);
                validEvalCount++;
            }
        }
        
        stats.averageEvaluation = validEvalCount > 0 ? evalSum / validEvalCount : 0;
        return stats;
    };

    // Dans votre composant React
    const QualityLegend = () => (
        <div className="quality-legend">
            <h3>{t('pgnAnalyzer.legend.title')}</h3>
            <div className="legend-items">
                <div className="legend-item">
                    <span className="color-box excellent"></span>
                    <span className="label">{t('pgnAnalyzer.legend.excellent')}</span>
                </div>
                <div className="legend-item">
                    <span className="color-box good"></span>
                    <span className="label">{t('pgnAnalyzer.legend.good')}</span>
                </div>
                <div className="legend-item">
                    <span className="color-box inaccuracy"></span>
                    <span className="label">{t('pgnAnalyzer.legend.inaccuracy')}</span>
                </div>
                <div className="legend-item">
                    <span className="color-box mistake"></span>
                    <span className="label">{t('pgnAnalyzer.legend.mistake')}</span>
                </div>
                <div className="legend-item">
                    <span className="color-box blunder"></span>
                    <span className="label">{t('pgnAnalyzer.legend.blunder')}</span>
                </div>
            </div>
        </div>
    );

    const gameStats = calculateGameStats();
    // Ajouter cette ligne pour calculer movesWithQuality
    const movesWithQuality = getMovesWithQuality();

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
                            <div className="versus">{t('pgnAnalyzer.versus')}</div>
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
                                <div className="result">{t('pgnAnalyzer.result')} {gameMetadata.result}</div>
                            )}
                        </div>
                    </div>
                )}
                <div className="pgn-container">
                    {/* Colonne gauche - Entrée PGN */}
                    <div className="left-column">
                        <div className="pgn-input">
                            <h2>{t('pgnAnalyzer.input.title')}</h2>
                            <textarea
                                placeholder={t('pgnAnalyzer.input.placeholder')}
                                value={pgn}
                                onChange={(e) => setPgn(e.target.value)}
                            />
                            <button 
                                onClick={handleAnalyze}
                                disabled={isLoading || isAnalyzingGame}
                            >
                                {isLoading ? t('pgnAnalyzer.input.loading') : t('pgnAnalyzer.input.analyze')}
                            </button>
                            
                            {/* Affichage amélioré de la progression d'analyse */}
                            {isAnalyzingGame && (
                                <div className="analysis-progress">
                                    <p>
                                        <span className="analysis-spinner">⏳</span>
                                        {t('pgnAnalyzer.input.analyzing')} {Math.floor(analysisProgress)}%
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
                        
                        {/* Nouvel encart pour les alternatives qui reste toujours visible */}
                        <AlternativesCard 
                            currentMoveIndex={currentMoveIndex}
                            movesWithQuality={movesWithQuality}
                            gameAnalysis={gameAnalysis}
                            t={t}
                        />
                    </div>
                    
                    {/* Colonne centrale - Échiquier avec barre d'évaluation à gauche et navigation */}
                    <div className="center-column">
                        <div className="current-player">
                            <div className={`player-indicator ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
                                <span className="piece-symbol">{game.turn() === 'w' ? '♔' : '♚'}</span>
                                <span className="player-name">
                                    {t('pgnAnalyzer.player.turn')} {game.turn() === 'w' ? gameMetadata.white : gameMetadata.black}
                                </span>
                            </div>
                            <div className="move-number">
                                {t('pgnAnalyzer.player.move')} {Math.floor(currentMoveIndex / 2) + 1}
                                {game.turn() === 'w' ? '' : '...'}
                            </div>
                        </div>
                        <div className="board-with-eval">
                            <div className="evaluation-bar">
                                <div className="eval-container">
                                    <div className="white-eval" style={{ height: blackHeight }}></div>
                                    <div className="black-eval" style={{ height: whiteHeight }}></div>
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
                                {t('pgnAnalyzer.navigation.previous')}
                            </button>
                            <button
                                onClick={() => goToMove(Math.min(moves.length, currentMoveIndex + 1))}
                                disabled={currentMoveIndex === moves.length || isLoading}
                            >
                                {t('pgnAnalyzer.navigation.next')}
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
                                    {t('pgnAnalyzer.tabs.moves')}
                                </button>
                                <button 
                                    className={activeTab === 'stats' ? 'active' : ''} 
                                    onClick={() => setActiveTab('stats')}
                                    disabled={!gameStats}
                                >
                                    {t('pgnAnalyzer.tabs.stats')}
                                </button>
                                <button 
                                    className={activeTab === 'legend' ? 'active' : ''} 
                                    onClick={() => setActiveTab('legend')}
                                >
                                    {t('pgnAnalyzer.tabs.legend')}
                                </button>
                            </div>
                            
                            <div className="tabs-content">
                                {/* Onglet Liste des coups */}
                                {activeTab === 'moves' && (
                                    <div className="tab-pane">
                                        {/* Votre liste de coups existante */}
                                        <div className="moves-list" ref={movesListRef}>
                                            <ul>
                                                {organizedMoves.map((moveGroup, groupIndex) => {
                                                    const whiteMoveWithQuality = movesWithQuality[groupIndex * 2];
                                                    const blackMoveWithQuality = movesWithQuality[groupIndex * 2 + 1];
                                                    
                                                    // Index basés sur 1 pour la classe 'current'
                                                    // moveIndex 0 = position initiale (aucun coup joué)
                                                    // moveIndex 1 = après le premier coup blanc
                                                    // moveIndex 2 = après le premier coup noir
                                                    const whiteIndex = groupIndex * 2 + 1;  // +1 parce que l'index 0 est la position initiale
                                                    const blackIndex = groupIndex * 2 + 2;
                                                    
                                                    return (
                                                        <React.Fragment key={groupIndex}>
                                                            <li className="move-number">{moveGroup.number}.</li>
                                                            <li 
                                                                className={`white-move ${currentMoveIndex === whiteIndex ? 'current' : ''} ${
                                                                    whiteMoveWithQuality?.quality?.class || ''
                                                                } ${whiteMoveWithQuality?.alternatives?.length > 0 ? 'has-alternatives' : ''}`}
                                                                onClick={() => goToMove(whiteIndex)}
                                                                style={{ paddingLeft: whiteMoveWithQuality?.quality?.class ? '12px' : '8px' }}
                                                            >
                                                                {moveGroup.white.san}
                                                                <span className={`move-quality ${whiteMoveWithQuality?.quality?.class || ''}`}>
                                                                    {whiteMoveWithQuality?.quality?.label || ''}
                                                                </span>
                                                                
                                                                {/* Ajouter les alternatives comme info-bulles */}
                                                                {whiteMoveWithQuality?.alternatives?.length > 0 && (
                                                                    <div className="move-alternatives">
                                                                        <span className="alternative-indicator">•••</span>
                                                                        <div className="alternative-details">
                                                                            <p>Alternatives:</p>
                                                                            {whiteMoveWithQuality.alternatives.map((alt, idx) => (
                                                                                <div key={idx} className="alternative-move">
                                                                                    <span className="alt-san">{alt.san}</span>
                                                                                    <span className="alt-eval">{formatEvaluation(alt.evaluation)}</span>
                                                                                    <span className="alt-advantage">(+{alt.advantage.toFixed(2)})</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </li>
                                                            
                                                            <li 
                                                                className={`black-move ${moveGroup.black && currentMoveIndex === blackIndex ? 'current' : ''} ${
                                                                    moveGroup.black ? (blackMoveWithQuality?.quality?.class || '') : ''
                                                                } ${blackMoveWithQuality?.alternatives?.length > 0 ? 'has-alternatives' : ''}`}
                                                                onClick={() => {
                                                                    if (moveGroup.black) {
                                                                        goToMove(blackIndex);
                                                                    }
                                                                }}
                                                                style={{ paddingRight: blackMoveWithQuality?.quality?.class ? '12px' : '8px' }}
                                                            >
                                                                {moveGroup.black ? moveGroup.black.san : ''}
                                                                {moveGroup.black && (
                                                                    <>
                                                                        <span className="move-quality">
                                                                            {blackMoveWithQuality?.quality?.label || ''}
                                                                        </span>
                                                                        
                                                                        {/* Ajouter les alternatives pour les noirs aussi */}
                                                                        {blackMoveWithQuality?.alternatives?.length > 0 && (
                                                                            <div className="move-alternatives">
                                                                                <span className="alternative-indicator">•••</span>
                                                                                <div className="alternative-details">
                                                                                    <p>Alternatives:</p>
                                                                                    {blackMoveWithQuality.alternatives.map((alt, idx) => (
                                                                                        <div key={idx} className="alternative-move">
                                                                                            <span className="alt-san">{alt.san}</span>
                                                                                            <span className="alt-eval">{formatEvaluation(alt.evaluation)}</span>
                                                                                            <span className="alt-advantage">(+{alt.advantage.toFixed(2)})</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </li>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Onglet Statistiques */}
                                {activeTab === 'stats' && (
                                    <div className="tab-pane">
                                        {gameStats ? (
                                            <div className="stats-container">
                                                <CompactEvaluationChart 
                                                    gameAnalysis={gameAnalysis} 
                                                    moves={moves} 
                                                    onSelectMove={goToMove}
                                                    t={t}
                                                />
                                                <CompactGameStats stats={gameStats} gameMetadata={gameMetadata} t={t} />
                                            </div>
                                        ) : (
                                            <div className="no-stats">
                                                {t('pgnAnalyzer.stats.noStats')}
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