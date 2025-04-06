import convertToNumeric from './convertToNumeric';
import formatEvaluation from './formatEvaluation';

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
              title={`${data.isWhite ? t('training.status.white') : t('training.status.black')}: ${data.san} (${formatEvaluation(data.evalValue)})`}
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

export default CompactEvaluationChart;