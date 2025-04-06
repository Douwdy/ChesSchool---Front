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

export default calculateAccuracy;