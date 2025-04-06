import calculateAccuracy from './calculateAccuracy';

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
            <div className="player-name">{gameMetadata.white || t('training.status.white')}</div>
            <div className="player-accuracy">{whiteAccuracy}%</div>
          </div>
          <div className="stat-label">{t('pgnAnalyzer.stats.accuracy')}</div>
          <div className="player-column black">
          <div className="player-name">{gameMetadata.black || t('training.status.black')}</div>
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

  export default CompactGameStats;