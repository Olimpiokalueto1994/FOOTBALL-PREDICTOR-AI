import { GoogleGenAI, Type } from '@google/genai';
import { Match, AIAnalysisOutput } from '../types/football';
import { EnsembleResult } from './engine/mlEnsemble';

/**
 * ARCHITECTURAL INVARIANT: STRICT ISOLATION OF THE GENERATIVE AI LAYER
 * 
 * Google Gemini 3.8 Flash operates exclusively as a qualitative statistical analyst / explainer.
 * - INPUT: Receives the pre-calculated probabilistic outputs from the deterministic mathematical ensemble.
 * - OUTPUT: Produces qualitative reasoning (arguments favoring home/away, uncertainties, tactical overview).
 * - CRITICAL CONSTRAINT: Gemini NEVER calculates, alters, or fabricates 1X2 probabilities, score matrices,
 *   or expected goals. All quantitative metrics are generated deterministically by the mathematical core.
 */

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Deterministic statistical explanation fallback when GEMINI_API_KEY is not configured or offline
 */
export function generateStatisticalExplanation(match: Match, ensemble: EnsembleResult): AIAnalysisOutput {
  const home = match.homeTeam;
  const away = match.awayTeam;
  const probs = ensemble.probabilities.oneXTwo;

  const favorsHome: string[] = [];
  const favorsAway: string[] = [];
  const mainUncertainties: string[] = [];
  const whatCouldChange: string[] = [];

  // Home factors
  favorsHome.push(`Vantagem do mando de campo no ${match.venue} com ${home.stats.homeRecord?.wins ?? 10} vitórias.`);
  favorsHome.push(`Rating Elo ponderado de ${home.stats.eloRating} (+65 de vantagem caseira).`);
  if (home.stats.attackingStrength > 1.2) {
    favorsHome.push(`Produção ofensiva consistente com média de ${home.stats.shotsOnTargetAvg} chutes certos por partida.`);
  }

  // Away factors
  if (away.stats.eloRating > 1900) {
    favorsAway.push(`Qualidade técnica individual de nível de elite internacional (Elo ${away.stats.eloRating}).`);
  }
  if (away.stats.attackingStrength > 1.2) {
    favorsAway.push(`Ameaça em transições rápidas com ${away.stats.goalsFor} gols marcados na competição.`);
  }
  if (away.stats.defensiveStrength < 0.85) {
    favorsAway.push(`Solidez defensiva fora de casa (xGA de ${away.stats.xGA}).`);
  }

  // Uncertainties
  if (ensemble.signalStrength === 'NO_SIGNAL' || ensemble.signalStrength === 'WEAK') {
    mainUncertainties.push('Equilíbrio estatístico elevado entre as forças de ataque e defesa dos dois lados.');
  }
  if (match.awayTeam.injuries.some(i => i.status === 'DOUBTFUL')) {
    mainUncertainties.push('Dúvidas médicas em titulares que podem alterar a escalação final.');
  }
  if (match.homeTeam.stats.fatigueIndex > 60 || match.awayTeam.stats.fatigueIndex > 60) {
    mainUncertainties.push('Impacto do desgaste físico e possível rotação no decorrer da partida.');
  }

  // What could change
  whatCouldChange.push('Divulgação das escalações oficiais 1h antes com eventuais ausências não previstas.');
  whatCouldChange.push('Golo prematuro nos primeiros 15 minutos alterando o plano tático do adversário.');
  whatCouldChange.push('Condições climáticas adversas que possam impactar o índice de passes e finalizações.');

  const summary = `Os modelos indicam favoritismo probabilístico de ${probs.home}% para o ${home.shortName}, com ${probs.draw}% de chance de empate e ${probs.away}% para o ${away.shortName}. O diferencial de xG e a força no estádio sustentam a maior inclinação do modelo.`;

  return {
    summary,
    favorsHome,
    favorsAway,
    mainUncertainties,
    whatCouldChange,
    tacticalOverview: `${home.shortName} tende a reter a posse (${home.stats.possessionAvg}%) controlando o ritmo pelo meio, enquanto ${away.shortName} buscará transições verticais e explorar bolas paradas.`,
    isAiGenerated: false,
    modelUsed: 'Deterministic Statistical Explainability Engine v1.4.2',
  };
}

/**
 * AI Football Analyst via Gemini 3.8 Flash
 */
export async function runAIFootballAnalyst(
  match: Match,
  ensemble: EnsembleResult
): Promise<AIAnalysisOutput> {
  const client = getGeminiClient();
  if (!client) {
    return generateStatisticalExplanation(match, ensemble);
  }

  const prompt = `Você é o AI Football Analyst do terminal "Football Predictor AI".
Analise com rigor estatístico, tom executivo e analítico (estilo Bloomberg / Linear / Vercel), SEM prometer certezas ou linguagem de apostas.
Trate cada previsão como estimativa probabilística sujeita à incerteza.

DADOS DA PARTIDA:
Confronto: ${match.homeTeam.name} vs ${match.awayTeam.name}
Competição: ${match.competition} (${match.round || 'Rodada regular'})
Estádio: ${match.venue}
Data/Hora: ${match.utcDate}

PROBABILIDADES DO MODELO ENSEMBLE (Poisson + Elo + Logistic Regression + ML Trees):
- Vitória Casa (${match.homeTeam.shortName}): ${ensemble.probabilities.oneXTwo.home}%
- Empate: ${ensemble.probabilities.oneXTwo.draw}%
- Vitória Fora (${match.awayTeam.shortName}): ${ensemble.probabilities.oneXTwo.away}%
- Gols Esperados (xG): ${ensemble.probabilities.expectedGoals.home} vs ${ensemble.probabilities.expectedGoals.away} (Total: ${ensemble.probabilities.expectedGoals.total})
- Ambas Marcam: Sim ${ensemble.probabilities.bothTeamsToScore.yes}% | Não ${ensemble.probabilities.bothTeamsToScore.no}%
- Placar mais provável: ${ensemble.probabilities.topScores.slice(0, 3).map(s => `${s.score} (${s.probability}%)`).join(', ')}
- Sinal Estatístico: ${ensemble.signalStrength}
- Data Confidence: ${ensemble.dataConfidence}%

FATORES EXTRAÍDOS:
${ensemble.factors.map(f => `* ${f.name} (${f.impactPercentage}% ${f.direction}): ${f.description}`).join('\n')}

DESFALQUES CONFIRMADOS:
- ${match.homeTeam.shortName}: ${match.homeTeam.injuries.map(i => `${i.player} (${i.status} - ${i.importance})`).join(', ') || 'Sem desfalques graves'}
- ${match.awayTeam.shortName}: ${match.awayTeam.injuries.map(i => `${i.player} (${i.status} - ${i.importance})`).join(', ') || 'Sem desfalques graves'}

Responda em formato JSON estrito com os campos:
- summary: Resumo analítico conciso (2 a 3 frases focadas nos fundamentos da previsão).
- favorsHome: Lista de 2 a 3 argumentos analíticos sustentados pelos dados que favorecem a equipe da casa.
- favorsAway: Lista de 2 a 3 argumentos analíticos que favorecem a equipe visitante.
- mainUncertainties: Lista de 2 riscos ou pontos de incerteza estatística nesta partida.
- whatCouldChange: Lista de 2 a 3 eventos ou fatores que alterariam a probabilidade antes do jogo.
- tacticalOverview: 1 parágrafo descrevendo o encaixe tático provável do jogo.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            favorsHome: { type: Type.ARRAY, items: { type: Type.STRING } },
            favorsAway: { type: Type.ARRAY, items: { type: Type.STRING } },
            mainUncertainties: { type: Type.ARRAY, items: { type: Type.STRING } },
            whatCouldChange: { type: Type.ARRAY, items: { type: Type.STRING } },
            tacticalOverview: { type: Type.STRING },
          },
          required: ['summary', 'favorsHome', 'favorsAway', 'mainUncertainties', 'whatCouldChange', 'tacticalOverview'],
        },
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return {
      summary: parsed.summary || 'Análise calculada com base nos modelos estatísticos.',
      favorsHome: parsed.favorsHome || [],
      favorsAway: parsed.favorsAway || [],
      mainUncertainties: parsed.mainUncertainties || [],
      whatCouldChange: parsed.whatCouldChange || [],
      tacticalOverview: parsed.tacticalOverview || '',
      isAiGenerated: true,
      modelUsed: 'Google Gemini 3.8 Flash (Grounding & Reasoning)',
    };
  } catch (error) {
    console.error('Error executing Gemini AI Football Analyst, falling back to statistical engine:', error);
    return generateStatisticalExplanation(match, ensemble);
  }
}

/**
 * Natural Language Query answering ("Pergunte ao Predictor")
 */
export async function queryFootballPredictor(
  userQuery: string,
  matchesContext: Match[]
): Promise<{ answer: string; relatedMatchId?: string }> {
  const client = getGeminiClient();

  // Find if a match was mentioned in the user query
  const normalizedQuery = userQuery.toLowerCase();
  const matchedFixture = matchesContext.find(m => 
    normalizedQuery.includes(m.homeTeam.shortName.toLowerCase()) ||
    normalizedQuery.includes(m.awayTeam.shortName.toLowerCase()) ||
    normalizedQuery.includes(m.competition.toLowerCase())
  );

  if (!client) {
    // Helpful deterministic fallback answering common questions
    if (matchedFixture) {
      return {
        answer: `Análise para ${matchedFixture.homeTeam.shortName} vs ${matchedFixture.awayTeam.shortName} (${matchedFixture.competition}): O modelo ensemble atribui maior probabilidade ao mandante, fundamentado no histórico em casa (${matchedFixture.homeTeam.stats.homeRecord?.wins} vitórias) e solidez defensiva (xGA ${matchedFixture.homeTeam.stats.xGA}). O principal fator de risco reside no calendário e na disponibilidade dos atletas do setor ofensivo.`,
        relatedMatchId: matchedFixture.id,
      };
    }
    return {
      answer: `O Football Predictor AI utiliza modelos estatísticos (Poisson, Elo com +65 de vantagem caseira, Regressão Logística e Heurísticas de Árvore) calibrados por Platt Scaling para estimar probabilidades de partidas de futebol. Selecione uma partida no dashboard para ver o detalhamento completo dos fatores ou pergunte citando um time específico (ex: "Analisa Arsenal vs Chelsea").`,
    };
  }

  const contextSnippet = matchesContext.slice(0, 5).map(m => `
- ${m.homeTeam.name} vs ${m.awayTeam.name} (${m.competition}, ${m.utcDate})
  Posições: ${m.homeTeam.shortName} (#${m.homeTeam.leaguePosition}) vs ${m.awayTeam.shortName} (#${m.awayTeam.leaguePosition})
  Elo: ${m.homeTeam.stats.eloRating} vs ${m.awayTeam.stats.eloRating}
  Forma últimos 5: ${m.homeTeam.shortName} [${m.homeTeam.stats.last5.join('')}], ${m.awayTeam.shortName} [${m.awayTeam.stats.last5.join('')}]
  Desfalques: ${m.homeTeam.injuries.length} em ${m.homeTeam.shortName}, ${m.awayTeam.injuries.length} em ${m.awayTeam.shortName}
`).join('\n');

  const prompt = `Você é o assistente inteligente do "Football Predictor AI".
Responda à pergunta do usuário de forma concisa, objetiva e fundamentada nos dados dos modelos matemáticos e estatísticos.
Nunca garanta resultados. Mantenha tom de terminal analítico de alta precisão.

PARTIDAS DISPONÍVEIS:
${contextSnippet}

PERGUNTA DO USUÁRIO:
"${userQuery}"

Responda em 1 a 3 parágrafos claros em português. Se a pergunta for sobre uma partida específica, indique os fatores quantitativos mais relevantes.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    return {
      answer: response.text?.trim() || 'Não foi possível processar a consulta no momento.',
      relatedMatchId: matchedFixture?.id,
    };
  } catch (error) {
    console.error('Error running natural language query:', error);
    return {
      answer: 'O motor de linguagem está operando em modo offline. As análises estatísticas continuam 100% ativas nas páginas individuais das partidas.',
    };
  }
}
