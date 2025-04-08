import formatEvaluation from './formatEvaluation';

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
          <span className={`move-quality ${moveWithQuality?.quality?.class || ''}`}>
            {moveWithQuality?.quality?.label}
          </span>
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

export default AlternativesCard;