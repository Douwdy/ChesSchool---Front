// Function to analyze a single position
export const analyzePosition = async (fen) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fen }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur d'analyse:", errorText);
            throw new Error(`Erreur d'analyse: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.evaluation;
    } catch (error) {
        console.error("Erreur lors de l'analyse:", error);
        return null;
    }
};

// Function to analyze a full game
export const analyzeFullGame = async (pgn, setGameAnalysis, setIsAnalyzingGame, setError) => {
    if (!pgn) return;
    
    setIsAnalyzingGame(true);
    
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/analyze-game`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pgn }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Contenu de l'erreur:", errorText);
            throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
        }

        // Log de la réponse brute
        const responseText = await response.text();
        
        // Tenter de parser la réponse JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error(`Réponse invalide du serveur: ${e.message}. Réponse: ${responseText}`);
        }
        
        if (data.success && data.analysis) {
            setGameAnalysis(data.analysis);
        } else {
            throw new Error('Format de réponse inattendu: ' + JSON.stringify(data));
        }
    } catch (error) {
        console.error('Erreur détaillée:', error);
        setError(`Erreur d'analyse: ${error.message}`);
    } finally {
        setIsAnalyzingGame(false);
    }
};