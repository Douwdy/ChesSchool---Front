/**
 * Formate une évaluation pour l'affichage
 * @param {*} evaluation - Évaluation à formater
 * @returns {string} - Évaluation formatée pour l'affichage
 */
const formatEvaluation = (evaluation) => {
  if (evaluation === null || evaluation === undefined) {
    return '0.0';
  }
  
  // Affichage cohérent des mats
  if (typeof evaluation === 'string' && evaluation.startsWith('#')) {
    const mateIn = parseInt(evaluation.substring(1));
    return mateIn > 0 ? `#${mateIn}` : `#${Math.abs(mateIn)}`;
  }
  
  // Conversion en nombre
  const numericEval = typeof evaluation === 'number' ? 
    evaluation : parseFloat(evaluation);
  
  if (isNaN(numericEval)) {
    return '0.0';
  }
  
  // Limiter à une décimale et ajouter le signe approprié
  const formattedValue = Math.abs(numericEval).toFixed(1);
  return numericEval > 0 ? `+${formattedValue}` : `-${formattedValue}`;
};

export default formatEvaluation;