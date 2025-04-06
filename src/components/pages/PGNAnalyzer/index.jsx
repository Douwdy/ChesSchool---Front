import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { parse } from 'pgn-parser';
import { useTranslation } from 'react-i18next';

// Import components
import GameMetadata from './components/GameMetadata';
import PGNInput from './components/PGNInput';
import BoardDisplay from './components/BoardDisplay';
import CurrentPlayerInfo from './components/CurrentPlayerInfo';
import NavigationControls from './components/NavigationControls';
import TabsContainer from './components/TabsContainer';
import AlternativesCard from './utils/AlternativesCard';

// Import utilities
import { analyzePosition, analyzeFullGame } from './utils/gameAnalysis';
import { getMovesWithQuality, calculateGameStats } from './utils/evalHelpers';

import './index.scss';

const CONFIG = {
  showEvaluationBar: false,    // Activer/désactiver la barre d'évaluation
  showEvaluationChart: false,  // Activer/désactiver le graphique d'évaluation
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
    const [gameAnalysis, setGameAnalysis] = useState([]);
    const [isAnalyzingGame, setIsAnalyzingGame] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
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
            
            // Convertir le tableau d'en-têtes en objet pour un accès plus facile
            const headersObject = {};
            parsedGame.headers.forEach(header => {
                headersObject[header.name] = header.value;
            });
            
            // Extraire les métadonnées
            const metadata = {
                white: headersObject.White || t('training.status.white'),
                whiteElo: headersObject.WhiteElo || '?',
                black: headersObject.Black || t('training.status.black'),
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
            const initialEvaluation = await analyzePosition(initialGame.fen());
            setEvaluation(initialEvaluation);
            
            // Lancer l'analyse complète de la partie en arrière-plan
            analyzeFullGame(pgn, setGameAnalysis, setIsAnalyzingGame, setError);
            
        } catch (e) {
            console.error('Erreur de parsing PGN:', e);
            setError(`Erreur de parsing: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour naviguer vers un coup spécifique
    const goToMove = async (index) => {
        const newGame = new Chess();
        
        // Jouer tous les coups jusqu'à l'index
        for (let i = 0; i < index; i++) {
            newGame.move(moves[i]);
        }
        
        setGame(newGame);
        setCurrentMoveIndex(index);
        
        // Vérifier si nous avons une analyse pour ce coup
        if (gameAnalysis && gameAnalysis.length > 0) {
            const analysisIndex = Math.min(index, gameAnalysis.length - 1);
            
            if (analysisIndex >= 0 && analysisIndex < gameAnalysis.length) {
                const analysisData = gameAnalysis[analysisIndex];
                
                if (analysisData.evaluation !== undefined) {
                    setEvaluation(analysisData.evaluation);
                } else {
                    const newEvaluation = await analyzePosition(newGame.fen());
                    setEvaluation(newEvaluation);
                }
            } else {
                const newEvaluation = await analyzePosition(newGame.fen());
                setEvaluation(newEvaluation);
            }
        } else {
            const newEvaluation = await analyzePosition(newGame.fen());
            setEvaluation(newEvaluation);
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

    // Gérer la connexion SSE pour les mises à jour d'analyse
    useEffect(() => {
        let eventSource = null;
        
        if (isAnalyzingGame) {
            // Établir une connexion SSE
            eventSource = new EventSource(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analysis-status`);
            
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    if (data.status === 'analyzing') {
                        setAnalysisProgress(data.progress);
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

    // Préparer les données pour l'affichage
    const organizedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
        organizedMoves.push({
            number: Math.floor(i / 2) + 1,
            white: moves[i],
            black: i + 1 < moves.length ? moves[i + 1] : null
        });
    }

    const gameStats = calculateGameStats(gameAnalysis);
    const movesWithQuality = getMovesWithQuality(moves, gameAnalysis);

    return (
        <div className="pgn-analyzer">
            <GameMetadata metadata={gameMetadata} />
            
            <div className="pgn-container">
                {/* Colonne gauche - Entrée PGN */}
                <div className="left-column">
                    <PGNInput 
                        pgn={pgn}
                        setPgn={setPgn}
                        handleAnalyze={handleAnalyze}
                        isLoading={isLoading}
                        isAnalyzingGame={isAnalyzingGame}
                        analysisProgress={analysisProgress}
                        error={error}
                        t={t}
                    />
                    
                    <AlternativesCard 
                        currentMoveIndex={currentMoveIndex}
                        movesWithQuality={movesWithQuality}
                        gameAnalysis={gameAnalysis}
                        t={t}
                    />
                </div>
                
                {/* Colonne centrale - Échiquier et navigation */}
                <div className="center-column">
                    <CurrentPlayerInfo 
                        game={game} 
                        currentMoveIndex={currentMoveIndex} 
                        gameMetadata={gameMetadata}
                        t={t}
                    />
                    
                    <BoardDisplay 
                        game={game}
                        evaluation={evaluation} 
                        showEvaluationBar={CONFIG.showEvaluationBar}
                    />
                    
                    <NavigationControls 
                        currentMoveIndex={currentMoveIndex}
                        movesLength={moves.length}
                        goToMove={goToMove}
                        isLoading={isLoading}
                        t={t}
                    />
                </div>
                
                {/* Colonne droite avec système d'onglets */}
                <div className="right-column">
                    <TabsContainer 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        organizedMoves={organizedMoves}
                        movesWithQuality={movesWithQuality}
                        currentMoveIndex={currentMoveIndex}
                        gameAnalysis={gameAnalysis}
                        gameStats={gameStats}
                        gameMetadata={gameMetadata}
                        moves={moves}
                        goToMove={goToMove}
                        movesListRef={movesListRef}
                        showEvaluationChart={CONFIG.showEvaluationChart}
                        t={t}
                    />
                </div>
            </div>
        </div>
    );
};

export default PGNAnalyzer;