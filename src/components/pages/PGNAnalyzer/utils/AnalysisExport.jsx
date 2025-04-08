import React, { useState } from 'react';
import calculateAccuracy from './calculateAccuracy';
import formatEvaluation from './formatEvaluation';
import { Chess } from 'chess.js'; // Import correct de la classe Chess


const LOGO_BASE64 = "PHN2ZyB3aWR0aD0iMzg0IiBoZWlnaHQ9IjQ3MiIgdmlld0JveD0iMCAwIDM4NCA0NzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0zMjYgMzkySDU4QzQzLjY0MDYgMzkyIDMyIDQwMy42NDEgMzIgNDE4VjQ0NkMzMiA0NjAuMzU5IDQzLjY0MDYgNDcyIDU4IDQ3MkgzMjZDMzQwLjM1OSA0NzIgMzUyIDQ2MC4zNTkgMzUyIDQ0NlY0MThDMzUyIDQwMy42NDEgMzQwLjM1OSAzOTIgMzI2IDM5MloiIGZpbGw9IiNGRkM3NTkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0wIDI2VjE2MEMwIDE2OC45NTEgMy42OTExMiAxNzcuNDMgMTAuMTY4NiAxODMuNDJDMTEuODM0NyAxODQuOTYgMTMuODY4OSAxODYuMDIyIDE1Ljk3OTUgMTg2Ljg1NkwzMS41NDk1IDE5My4wMDRDNDEuNDc2OSAxOTYuOTI0IDQ4IDIwNi41MTMgNDggMjE3LjE4N1YzNDJDNDggMzU2LjM1OSA1OS42NDA2IDM2OCA3NCAzNjhIMzEwQzMyNC4zNTkgMzY4IDMzNiAzNTYuMzU5IDMzNiAzNDJWMjE3LjE4N0MzMzYgMjA2LjUxMyAzNDIuNTIzIDE5Ni45MjQgMzUyLjQ1MSAxOTMuMDA0TDM2OC4wMiAxODYuODU2QzM3MC4xMzEgMTg2LjAyMiAzNzIuMTY1IDE4NC45NiAzNzMuODMxIDE4My40MkMzODAuMzA5IDE3Ny40MyAzODQgMTY4Ljk1MSAzODQgMTYwVjI2QzM4NCAxNy4yIDM3Ni44IDEwIDM2OCAxMEgzMDRDMjk1LjIgMTAgMjg4IDE3LjIgMjg4IDI2VjU2QzI4OCA2MC40IDI4NC40IDY0IDI4MCA2NEgyNDhDMjQzLjYgNjQgMjQwIDYwLjQgMjQwIDU2VjE2QzI0MCA3LjIgMjMyLjggMCAyMjQgMEgxNjBDMTUxLjIgMCAxNDQgNy4yIDE0NCAxNlY1NkMxNDQgNjAuNCAxNDAuNCA2NCAxMzYgNjRIMTA0Qzk5LjYgNjQgOTYgNjAuNCA5NiA1NlYyNkM5NiAxNy4yIDg4LjggMTAgODAgMTBIMTZDNy4yIDEwIDAgMTcuMiAwIDI2Wk0xNDcgOTlIMTYxQzE3MS40OTMgOTkgMTgwIDEwNy41MDcgMTgwIDExOFYyNDJDMTgwIDI1Mi40OTMgMTcxLjQ5MyAyNjEgMTYxIDI2MUgxNDdDMTM2LjUwNyAyNjEgMTI4IDI1Mi40OTMgMTI4IDI0MlYxMThDMTI4IDEwNy41MDcgMTM2LjUwNyA5OSAxNDcgOTlaTTIzNyA5OUgyMjNDMjEyLjUwNyA5OSAyMDQgMTA3LjUwNyAyMDQgMTE4VjI0MkMyMDQgMjUyLjQ5MyAyMTIuNTA3IDI2MSAyMjMgMjYxSDIzN0MyNDcuNDkzIDI2MSAyNTYgMjUyLjQ5MyAyNTYgMjQyVjExOEMyNTYgMTA3LjUwNyAyNDcuNDkzIDk5IDIzNyA5OVpNMjU2IDMwNUMyNTYgMzE5LjM1OSAyNDQuMzU5IDMzMSAyMzAgMzMxQzIxNS42NDEgMzMxIDIwNCAzMTkuMzU5IDIwNCAzMDVDMjA0IDI5MC42NDEgMjE1LjY0MSAyNzkgMjMwIDI3OUMyNDQuMzU5IDI3OSAyNTYgMjkwLjY0MSAyNTYgMzA1Wk0xNTQgMzMxQzE2OC4zNTkgMzMxIDE4MCAzMTkuMzU5IDE4MCAzMDVDMTgwIDI5MC42NDEgMTY4LjM1OSAyNzkgMTU0IDI3OUMxMzkuNjQxIDI3OSAxMjggMjkwLjY0MSAxMjggMzA1QzEyOCAzMTkuMzU5IDEzOS42NDEgMzMxIDE1NCAzMzFaIiBmaWxsPSIjRkZDNzU5Ii8+Cjwvc3ZnPgo=";
// Modifiez la fonction getBoardImageUrl

const getBoardImageUrl = (fen, lastMoveSan = null) => {
  // Utiliser chessvision.ai pour générer l'image de l'échiquier
  // Ce service prend directement le FEN et peut indiquer le trait
  const isWhiteTurn = fen.includes(' w ');
  const turn = isWhiteTurn ? 'black' : 'white';
  
  // Construire l'URL avec les bons paramètres
  const url = `https://fen2image.chessvision.ai/${encodeURIComponent(fen)}?turn=${turn}&pov=${turn}`;
  
  return url;
};

// Ajoutez cette fonction pour reconstruire une position FEN
const reconstructFen = (moves, moveIndex) => {
  try {
    // Créer une nouvelle instance du jeu d'échecs
    const chess = new Chess();
    
    // Jouer tous les coups jusqu'à l'index spécifié
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      if (moves[i] && moves[i].san) {
        chess.move(moves[i].san);
      }
    }
    
    // Retourner la position FEN actuelle
    return chess.fen();
  } catch (error) {
    console.error('Erreur lors de la reconstruction du FEN:', error);
    return null;
  }
};

const AnalysisExport = ({ gameAnalysis, moves, gameMetadata, gameStats, t }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Fonction pour générer le markdown à partir de l'analyse
  const generateMarkdown = () => {
    if (!gameAnalysis || !moves || !gameMetadata || !gameStats) return '';

    let markdown = '';
    
    // En-tête avec informations de la partie
    markdown += `<div class="header">\n`;
    markdown += `<img src="data:image/svg+xml;base64,${LOGO_BASE64}" alt="Logo ChesSchool" class="logo" />\n\n`;
    markdown += `# Analyse de Partie d'Échecs\n\n`;
    markdown += `${gameMetadata.white} (${gameMetadata.whiteElo}) vs ${gameMetadata.black} (${gameMetadata.blackElo})\n\n`;
    markdown += `${gameMetadata.event} • ${gameMetadata.date} • Résultat: ${gameMetadata.result}\n`;
    markdown += `</div>\n\n`;
    
    // Sommaire
    markdown += `## Sommaire\n\n`;
    markdown += `1. [Résumé de la partie](#résumé-de-la-partie)\n`;
    markdown += `2. [Statistiques](#statistiques)\n`;
    markdown += `3. [Analyse détaillée](#analyse-détaillée)\n`;
    markdown += `4. [Positions critiques](#positions-critiques)\n\n`;
    
    // Calcul des précisions
    const whiteAccuracy = calculateAccuracy(gameStats.white);
    const blackAccuracy = calculateAccuracy(gameStats.black);
    
    // Résumé de la partie
    markdown += `## Résumé de la partie\n\n`;
    markdown += `<div class="player-stats">\n`;
    markdown += `**${gameMetadata.white}**: ${whiteAccuracy}% de précision\n\n`;
    markdown += `**${gameMetadata.black}**: ${blackAccuracy}% de précision\n`;
    markdown += `</div>\n\n`;
    
    // Statistiques détaillées
    markdown += `## Statistiques\n\n`;
    markdown += `### Qualité des coups\n\n`;
    
    // Tableau des statistiques
    markdown += `| | ${gameMetadata.white} | ${gameMetadata.black} |\n`;
    markdown += `|---|---:|---:|\n`;
    markdown += `| <span class="excellent">Excellents</span> | ${gameStats.white.excellent} | ${gameStats.black.excellent} |\n`;
    markdown += `| <span class="good">Bons</span> | ${gameStats.white.good} | ${gameStats.black.good} |\n`;
    markdown += `| <span class="inaccuracy">Imprécisions</span> | ${gameStats.white.inaccuracy} | ${gameStats.black.inaccuracy} |\n`;
    markdown += `| <span class="mistake">Erreurs</span> | ${gameStats.white.mistake} | ${gameStats.black.mistake} |\n`;
    markdown += `| <span class="blunder">Graves erreurs</span> | ${gameStats.white.blunder} | ${gameStats.black.blunder} |\n\n`;
    
    // Analyse du style de jeu
    markdown += `### Analyse du style de jeu\n\n`;
    
    if (whiteAccuracy > blackAccuracy + 10) {
      markdown += `${gameMetadata.white} a joué avec plus de précision tout au long de la partie.\n\n`;
    } else if (blackAccuracy > whiteAccuracy + 10) {
      markdown += `${gameMetadata.black} a joué avec plus de précision tout au long de la partie.\n\n`;
    } else {
      markdown += `Les deux joueurs ont joué avec une précision similaire.\n\n`;
    }
    
    if (gameStats.white.blunder > 2) {
      markdown += `${gameMetadata.white} a commis plusieurs graves erreurs qui ont impacté le cours de la partie.\n\n`;
    }
    
    if (gameStats.black.blunder > 2) {
      markdown += `${gameMetadata.black} a commis plusieurs graves erreurs qui ont impacté le cours de la partie.\n\n`;
    }
    
    markdown += `<div class="page-break"></div>\n\n`;
    
    // Analyse détaillée des coups
    markdown += `## Analyse détaillée\n\n`;
    
    const organizedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
      organizedMoves.push({
        number: Math.floor(i / 2) + 1,
        white: i < moves.length ? moves[i] : null,
        black: i + 1 < moves.length ? moves[i + 1] : null,
        whiteAnalysis: i < gameAnalysis.length ? gameAnalysis[i] : null,
        blackAnalysis: i + 1 < gameAnalysis.length ? gameAnalysis[i + 1] : null
      });
    }
    
    markdown += `| Coup | Blanc | Évaluation | Noir | Évaluation |\n`;
    markdown += `|---:|---|---:|---|---:|\n`;
    
    organizedMoves.forEach(move => {
      let whiteMoveQuality = '';
      let blackMoveQuality = '';
      
      if (move.whiteAnalysis && move.whiteAnalysis.moveQuality) {
        whiteMoveQuality = getMoveQualitySymbol(move.whiteAnalysis.moveQuality);
      }
      
      if (move.blackAnalysis && move.blackAnalysis.moveQuality) {
        blackMoveQuality = getMoveQualitySymbol(move.blackAnalysis.moveQuality);
      }
      
      const whiteEval = move.whiteAnalysis ? formatEvaluation(move.whiteAnalysis.evaluation) : '';
      const blackEval = move.blackAnalysis ? formatEvaluation(move.blackAnalysis.evaluation) : '';
      
      markdown += `| ${move.number}. | ${move.white ? move.white.san + whiteMoveQuality : ''} | ${whiteEval} | ${move.black ? move.black.san + blackMoveQuality : ''} | ${blackEval} |\n`;
    });
    
    markdown += `\n<div class="page-break"></div>\n\n`;
    
    // Positions critiques
    markdown += `## Positions critiques\n\n`;

    // Identifier les positions critiques (erreurs graves et excellents coups)
    const criticalPositions = gameAnalysis.filter(move => {
      return move && (
        move.moveQuality === 'blunder' || 
        (move.moveQuality === 'excellent' && move.evalDifference > 150)
      );
    }).slice(0, 5); // Limiter à 5 positions critiques
    
    if (criticalPositions.length === 0) {
      markdown += `Aucune position critique significative n'a été identifiée dans cette partie.\n\n`;
    } else {
      criticalPositions.forEach((position, index) => {
        // Récupérer l'index du coup dans l'analyse
        const moveIndex = position.moveIndex;
        
        if (moveIndex === undefined) {
          // Gérer le cas où moveIndex n'est pas défini
          markdown += `### Position critique #${index + 1}\n\n`;
        } else {
          // Calculer le numéro de coup et si c'est un coup blanc ou noir
          const moveNumber = Math.floor(moveIndex / 2) + 1;
          const isWhite = moveIndex % 2 === 0;
          const colorText = isWhite ? 'Blancs' : 'Noirs';
          
          // Récupérer le coup joué à cette position
          const move = moveIndex < moves.length ? moves[moveIndex] : null;
          const moveSan = move ? move.san : '';
          
          // Numéro de coup sous la forme classique des échecs (1. e4 ou 1...e5)
          const moveNotation = isWhite ? `${moveNumber}. ${moveSan}` : `${moveNumber}... ${moveSan}`;
          
          // Générer l'en-tête avec le bon numéro de coup et le coup joué
          markdown += `### Position critique #${index + 1} - Coup ${moveNotation} (${colorText})\n\n`;
        }
        
        // Ajouter le diagramme d'échiquier avec une flèche pour le dernier coup joué
        const fen = position.fen || (moveIndex !== undefined ? reconstructFen(moves, moveIndex) : null);
        if (fen) {
          // Récupérer le coup qui vient d'être joué pour afficher la flèche
          const move = moveIndex < moves.length ? moves[moveIndex] : null;
          const moveSan = move ? move.san : null;
          
          markdown += `![Position après ${moveSan || 'le coup'}](${getBoardImageUrl(fen, moveSan)})\n\n`;
          
          // Ajouter un texte explicatif sur le coup qui vient d'être joué
          if (moveSan) {
            const isWhite = moveIndex % 2 === 0;
            const player = isWhite ? gameMetadata.white : gameMetadata.black;
            markdown += `> ${player} vient de jouer **${moveSan}**\n\n`;
          }
        }
        
        // Ajouter une description de la position
        if (position.moveQuality === 'blunder') {
          markdown += `Une grave erreur qui change significativement l'évaluation de la position. `;
        } else if (position.moveQuality === 'excellent') {
          markdown += `Un excellent coup qui améliore considérablement la position. `;
        }
        
        // Ajouter l'évaluation
        markdown += `Évaluation: ${formatEvaluation(position.evaluation)}\n\n`;
        
        // Ajouter les meilleurs coups alternatifs
        if (position.bestMoves && position.bestMoves.length > 0) {
          markdown += `**Alternatives:**\n\n`;
          
          position.bestMoves.forEach((alt) => {
            markdown += `- ${alt.san}: ${formatEvaluation(alt.evaluation)}\n`;
          });
          
          markdown += `\n`;
        }
        
        if (index < criticalPositions.length - 1) {
          markdown += `<div class="page-break"></div>\n\n`;
        }
      });
    }
    
    return markdown;
  };

  // Fonction auxiliaire pour obtenir le symbole de qualité du coup
  const getMoveQualitySymbol = (quality) => {
    switch (quality) {
      case 'excellent': return ' !';
      case 'good': return '';
      case 'inaccuracy': return ' ⟳';
      case 'mistake': return ' ?';
      case 'blunder': return ' ??';
      default: return '';
    }
  };

  // Fonction pour exporter vers PDF
  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportError(null);
    
    try {
      const markdown = generateMarkdown();
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}/api/markdown-to-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du rapport');
      }
      
      if (data.downloadUrl) {
        window.open(`${process.env.REACT_APP_API_URL}:${process.env.REACT_APP_API_PORT}${data.downloadUrl}`, '_blank');
      } else {
        throw new Error('URL de téléchargement non disponible');
      }
    } catch (error) {
      console.error('Erreur d\'export:', error);
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-container">
      <button 
        className="export-button"
        onClick={handleExport}
        disabled={isExporting || !gameAnalysis || gameAnalysis.length === 0}
      >
        {isExporting ? t('pgnAnalyzer.export.generating') : t('pgnAnalyzer.export.pdf')}
      </button>
      
      {exportError && (
        <div className="export-error">{exportError}</div>
      )}
    </div>
  );
};

export default AnalysisExport;