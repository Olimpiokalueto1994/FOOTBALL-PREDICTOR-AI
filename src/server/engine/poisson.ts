/**
 * Poisson & Dixon-Coles Goal Probability Modeling Engine
 */

export interface PoissonOutput {
  expectedGoalsHome: number;
  expectedGoalsAway: number;
  probHome: number; // 0-1
  probDraw: number; // 0-1
  probAway: number; // 0-1
  over05: number;
  under05: number;
  over15: number;
  under15: number;
  over25: number;
  under25: number;
  over35: number;
  under35: number;
  bttsYes: number;
  bttsNo: number;
  matrix: number[][]; // [homeGoals][awayGoals]
  topScores: { score: string; home: number; away: number; probability: number }[];
}

// Factorial cache
const factorials: number[] = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880];
function factorial(n: number): number {
  if (n < 0) return 1;
  if (n < factorials.length) return factorials[n];
  let res = factorials[factorials.length - 1];
  for (let i = factorials.length; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Poisson probability function P(k; lambda) = (lambda^k * e^-lambda) / k!
function poissonProb(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

// Dixon-Coles tau adjustment parameter for low scores
function tau(x: number, y: number, lambda: number, mu: number, rho: number = -0.11): number {
  if (x === 0 && y === 0) {
    return 1 - (lambda * mu * rho);
  } else if (x === 0 && y === 1) {
    return 1 + (lambda * rho);
  } else if (x === 1 && y === 0) {
    return 1 + (mu * rho);
  } else if (x === 1 && y === 1) {
    return 1 - rho;
  }
  return 1.0;
}

/**
 * Calculates match goal probabilities using Dixon-Coles modified bivariate Poisson distribution
 */
export function calculatePoissonProbabilities(
  homeAttack: number, // e.g. 1.15
  homeDefense: number, // e.g. 0.90 (lower is better defense)
  awayAttack: number, // e.g. 1.05
  awayDefense: number, // e.g. 1.10
  leagueAvgHomeGoals: number = 1.48,
  leagueAvgAwayGoals: number = 1.18,
  homeAdvantageFactor: number = 1.0, // Default to 1.0 (no home bias)
  homeRecord?: { played: number; gf: number; ga: number },
  awayRecord?: { played: number; gf: number; ga: number },
  homeXgPerGame?: number,
  homeXgAPerGame?: number,
  awayXgPerGame?: number,
  awayXgAPerGame?: number
): PoissonOutput {
  // Base calculation with attack/defense ratings
  let lambda = homeAttack * awayDefense * leagueAvgHomeGoals * homeAdvantageFactor;
  let mu = awayAttack * homeDefense * leagueAvgAwayGoals;

  // Se tivermos registros reais de desempenho Casa/Fora, refinamos dinamicamente (Dixon-Coles Recalibration)
  if (homeRecord && homeRecord.played > 0 && awayRecord && awayRecord.played > 0) {
    const homeGfReal = homeRecord.gf / homeRecord.played;
    const homeGaReal = homeRecord.ga / homeRecord.played;
    const awayGfReal = awayRecord.gf / awayRecord.played;
    const awayGaReal = awayRecord.ga / awayRecord.played;

    const homeXg = homeXgPerGame ?? homeGfReal;
    const homeXgA = homeXgAPerGame ?? homeGaReal;
    const awayXg = awayXgPerGame ?? awayGfReal;
    const awayXgA = awayXgAPerGame ?? awayGaReal;

    // lambda (Gols esperados do mandante em casa) = Média ponderada de gols marcados em casa + gols sofridos do rival fora + xG e xGA correspondentes
    const attackPart = (homeGfReal + homeXg) / 2;
    const defensePart = (awayGaReal + awayXgA) / 2;
    lambda = (attackPart + defensePart) / 2;

    // mu (Gols esperados do visitante fora) = Média ponderada de gols marcados fora do visitante + gols sofridos do mandante em casa
    const awayAttackPart = (awayGfReal + awayXg) / 2;
    const homeDefensePart = (homeGaReal + homeXgA) / 2;
    mu = (awayAttackPart + homeDefensePart) / 2;
  }

  lambda = Math.max(0.3, lambda);
  mu = Math.max(0.2, mu);

  const maxGoals = 7;
  const matrix: number[][] = [];

  let probHome = 0;
  let probDraw = 0;
  let probAway = 0;

  let over05 = 0;
  let over15 = 0;
  let over25 = 0;
  let over35 = 0;
  let bttsYes = 0;

  const scoreList: { score: string; home: number; away: number; probability: number }[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    matrix[h] = [];
    for (let a = 0; a <= maxGoals; a++) {
      const pHome = poissonProb(h, lambda);
      const pAway = poissonProb(a, mu);
      const adjustment = tau(h, a, lambda, mu, -0.09);
      const cellProb = Math.max(0, pHome * pAway * adjustment);

      matrix[h][a] = cellProb;

      // Sum outcomes
      if (h > a) probHome += cellProb;
      else if (h === a) probDraw += cellProb;
      else probAway += cellProb;

      const totalGoals = h + a;
      if (totalGoals > 0.5) over05 += cellProb;
      if (totalGoals > 1.5) over15 += cellProb;
      if (totalGoals > 2.5) over25 += cellProb;
      if (totalGoals > 3.5) over35 += cellProb;

      if (h > 0 && a > 0) bttsYes += cellProb;

      scoreList.push({
        score: `${h}-${a}`,
        home: h,
        away: a,
        probability: cellProb,
      });
    }
  }

  // Normalize 1X2 sum to 1.0 (since maxGoals truncation might sum to ~0.985)
  const totalSum = probHome + probDraw + probAway;
  if (totalSum > 0) {
    probHome /= totalSum;
    probDraw /= totalSum;
    probAway /= totalSum;
  }

  // Sort scorelines by highest probability
  scoreList.sort((a, b) => b.probability - a.probability);
  const topScores = scoreList.slice(0, 8).map(s => ({
    ...s,
    probability: Math.round(s.probability * 1000) / 10, // percentage e.g. 15.4%
  }));

  return {
    expectedGoalsHome: Math.round(lambda * 100) / 100,
    expectedGoalsAway: Math.round(mu * 100) / 100,
    probHome,
    probDraw,
    probAway,
    over05: Math.min(0.99, over05),
    under05: Math.max(0.01, 1 - over05),
    over15: Math.min(0.95, over15),
    under15: Math.max(0.05, 1 - over15),
    over25: Math.min(0.90, over25),
    under25: Math.max(0.10, 1 - over25),
    over35: Math.min(0.75, over35),
    under35: Math.max(0.25, 1 - over35),
    bttsYes: Math.min(0.90, bttsYes),
    bttsNo: Math.max(0.10, 1 - bttsYes),
    matrix,
    topScores,
  };
}
