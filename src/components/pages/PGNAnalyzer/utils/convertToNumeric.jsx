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

export default convertToNumeric;