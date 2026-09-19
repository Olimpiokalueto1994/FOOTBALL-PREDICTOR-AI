/**
 * Elo Rating Model for Football Teams
 * Incorporates Home Advantage (+65 Elo), Goal Difference Margin, and Empirical Draw Curve
 */

export interface EloOutput {
  probHome: number;
  probDraw: number;
  probAway: number;
  adjustedEloDiff: number; // Home Elo + 65 - Away Elo
}

export const DEFAULT_HOME_ELO_ADVANTAGE = 25;

/**
 * Calculates dynamic home advantage based on Elo difference
 */
export function getDynamicHomeAdvantage(homeElo: number, awayElo: number): number {
  let advantage = DEFAULT_HOME_ELO_ADVANTAGE;
  // Se a diferença de Elo base entre o visitante e o mandante for superior a 150 pontos
  // (grande disparidade técnica), a vantagem de campo é atenuada em 50%.
  if (Math.abs(homeElo - awayElo) > 150) {
    advantage *= 0.5;
  }
  return advantage;
}

/**
 * Predict match probabilities using Elo differential
 */
export function calculateEloProbabilities(
  homeElo: number,
  awayElo: number,
  homeAdvantage?: number
): EloOutput {
  const actualAdvantage = homeAdvantage !== undefined ? homeAdvantage : getDynamicHomeAdvantage(homeElo, awayElo);
  const eloDiff = (homeElo + actualAdvantage) - awayElo;

  // Logistic win expectation for Home Win (not accounting for draw yet)
  const homeWinExp = 1 / (1 + Math.pow(10, -eloDiff / 400));
  const awayWinExp = 1 - homeWinExp;

  // Empirical football draw probability curve:
  // Around 0 eloDiff, draw is ~27-29%. When eloDiff is +/-400, draw drops to ~12-14%.
  const baseDraw = 0.28;
  const drawDecay = Math.exp(-Math.pow(eloDiff / 450, 2));
  let probDraw = baseDraw * drawDecay;

  // Allocate remaining probability between Home and Away proportional to logistic expectations
  const remaining = 1 - probDraw;
  let probHome = remaining * homeWinExp;
  let probAway = remaining * awayWinExp;

  // Normalization
  const sum = probHome + probDraw + probAway;
  probHome /= sum;
  probDraw /= sum;
  probAway /= sum;

  return {
    probHome,
    probDraw,
    probAway,
    adjustedEloDiff: eloDiff,
  };
}

/**
 * Update Elo ratings after a completed match
 */
export function updateEloRating(
  currentElo: number,
  opponentElo: number,
  actualScore: 1 | 0.5 | 0, // 1 = Win, 0.5 = Draw, 0 = Loss
  goalDiff: number = 1,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, -(currentElo - opponentElo) / 400));
  
  // Margin multiplier G
  let g = 1;
  const absDiff = Math.abs(goalDiff);
  if (absDiff === 2) g = 1.5;
  else if (absDiff >= 3) g = (11 + absDiff) / 8;

  const delta = kFactor * g * (actualScore - expectedScore);
  return Math.round(currentElo + delta);
}
