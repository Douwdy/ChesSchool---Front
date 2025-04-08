/**
 * Convertit n'importe quelle forme d'évaluation (numérique, mat, etc.) en valeur numérique
 * @param {*} evaluation - L'évaluation à convertir
 * @returns {number} - La valeur numérique de l'évaluation
 */
const convertToNumeric = (evaluation) => {
  if (evaluation === null || evaluation === undefined) {
    return 0;
  }
  
  // Traiter les valeurs de mat
  if (typeof evaluation === 'string' && evaluation.startsWith('#')) {
    const mateNumber = parseInt(evaluation.substring(1));
    // Calculer une valeur basée sur la distance du mat
    return mateNumber > 0 ? 
      9999 - mateNumber : // Mat pour les blancs (valeur positive)
      -9999 + Math.abs(mateNumber); // Mat pour les noirs (valeur négative)
  }
  
  // Convertir les chaînes en nombres
  if (typeof evaluation === 'string') {
    const numValue = parseFloat(evaluation);
    return isNaN(numValue) ? 0 : numValue;
  }
  
  return typeof evaluation === 'number' ? evaluation : 0;
};

export default convertToNumeric;