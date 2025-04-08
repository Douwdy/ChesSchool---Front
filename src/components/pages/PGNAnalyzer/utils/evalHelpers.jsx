// Cette fonction convertit la qualité du coup reçue du serveur en format d'affichage
export const getMoveDisplayQuality = (moveQuality) => {
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

// Améliorer l'évaluation de la qualité des coups
export const evaluateMoveQuality = (evalDifference, isMatePosition) => {
  // Cas spécial: dans les positions de mat
  if (isMatePosition) {
    // Si la différence est très petite, c'est qu'on reste sur le chemin du mat
    if (evalDifference < 50) return "excellent";
    return "blunder"; // Rater un mat est toujours une bévue
  }
  
  // Échelle normale
  if (evalDifference <= 30) return "excellent";
  if (evalDifference <= 90) return "good";
  if (evalDifference <= 200) return "inaccuracy";
  if (evalDifference <= 500) return "mistake";
  return "blunder";
};

// Mettre à jour la fonction getMovesWithQuality pour utiliser directement la qualité du serveur
export const getMovesWithQuality = (moves, gameAnalysis) => {
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
            
            // Calculer les alternatives
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

// Function to calculate game statistics
export const calculateGameStats = (gameAnalysis) => {
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
            evalSum += analysis.evaluation;
            validEvalCount++;
        }
    }
    
    stats.averageEvaluation = validEvalCount > 0 ? evalSum / validEvalCount : 0;
    return stats;
};