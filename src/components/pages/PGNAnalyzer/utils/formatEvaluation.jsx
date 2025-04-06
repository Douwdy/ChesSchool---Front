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

export default formatEvaluation;