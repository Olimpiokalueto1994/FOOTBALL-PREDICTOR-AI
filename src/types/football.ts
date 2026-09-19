export type MatchStatus = 'SCHEDULED' | 'TIMED' | 'LIVE' | 'FINISHED' | 'POSTPONED';

export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_SIGNAL';

export type ModelConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PlayerInjury {
  player: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  status: 'OUT' | 'DOUBTFUL' | 'SUSPENDED' | 'RETURNING';
  importance: 'KEY' | 'REGULAR' | 'ROTATION';
  source: string;
  updatedAt: string;
  impactWeight: number; // 0-10 impact on team strength
  replacement?: string;
}

export interface TeamLineup {
  formation: string;
  confirmed: boolean;
  startingXI: {
    name: string;
    number: number;
    position: string;
    rating: number;
  }[];
  availabilityScore: number; // 0-100
  notes?: string;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  xG: number;
  xGA: number;
  possessionAvg: number;
  shotsOnTargetAvg: number;
  cleanSheets: number;
  last5: ('W' | 'D' | 'L')[];
  last10: ('W' | 'D' | 'L')[];
  homeRecord?: { played: number; wins: number; draws: number; losses: number; gf: number; ga: number };
  awayRecord?: { played: number; wins: number; draws: number; losses: number; gf: number; ga: number };
  eloRating: number;
  attackingStrength: number; // normalized ~ 0.8 - 1.5
  defensiveStrength: number; // normalized ~ 0.8 - 1.5
  fatigueIndex: number; // 0-100, higher = more fatigue
  restDays: number;
  recentOpponentAvgElo: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  league: string;
  leaguePosition: number;
  points: number;
  stats: TeamStats;
  injuries: PlayerInjury[];
  lineup?: TeamLineup;
}

export interface HeadToHeadMatch {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
}

export interface MarketOdds {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
  over25?: number;
  under25?: number;
  bttsYes?: number;
  bttsNo?: number;
  updatedAt: string;
  impliedProbabilities?: {
    home: number;
    draw: number;
    away: number;
    margin: number;
  };
}

export interface BookmakerPrice {
  name: string;
  home: number;
  draw: number;
  away: number;
  lastUpdate?: string;
}

export interface DetailedMarketOdds {
  matchId: string;
  sportKey: string;
  sportTitle: string;
  source: string;
  isLive: boolean;
  bookmakerCount: number;
  lastUpdate: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  bestOdds?: {
    home: { price: number; bookmaker: string };
    draw: { price: number; bookmaker: string };
    away: { price: number; bookmaker: string };
  };
  sampleBookmakers?: BookmakerPrice[];
  impliedProbabilities: {
    rawHome: number;
    rawDraw: number;
    rawAway: number;
    totalVig: number;
    margin: number;
    home: number;
    draw: number;
    away: number;
  };
  comparison?: {
    modelProbHome: number;
    modelProbDraw: number;
    modelProbAway: number;
    edgeHome: number;
    edgeDraw: number;
    edgeAway: number;
    bestValueSelection: 'HOME' | 'DRAW' | 'AWAY' | 'NONE';
    bestValueEdge: number;
    explanation: string;
  };
}

export interface MatchSource {
  name: string;
  type: 'STATS' | 'NEWS' | 'LINEUP' | 'ODDS' | 'INJURY';
  url: string;
  updatedAt: string;
  status: 'CONFIRMED' | 'DIVERGENT' | 'UNVERIFIED';
  snippet: string;
}

export interface ExplainabilityFactor {
  name: string;
  category: 'FORM' | 'HOME_ADVANTAGE' | 'SQUAD' | 'SCHEDULE' | 'TACTICAL' | 'OPPOSITION';
  impactPercentage: number; // positive increases probability, negative decreases
  direction: 'FAVORS_HOME' | 'FAVORS_AWAY' | 'FAVORS_DRAW' | 'NEUTRAL';
  description: string;
}

export interface ScorelineProb {
  score: string;
  home: number;
  away: number;
  probability: number; // 0 - 100
}

export interface PredictionMarkets {
  oneXTwo: {
    home: number; // %
    draw: number; // %
    away: number; // %
  };
  doubleChance: {
    homeOrDraw: number; // 1X %
    drawOrAway: number; // X2 %
    homeOrAway: number; // 12 %
  };
  overUnder: {
    over05: number;
    under05: number;
    over15: number;
    under15: number;
    over25: number;
    under25: number;
    over35: number;
    under35: number;
  };
  bothTeamsToScore: {
    yes: number;
    no: number;
  };
  expectedGoals: {
    home: number;
    away: number;
    total: number;
  };
  expectedCorners?: {
    home: number;
    away: number;
    total: number;
  };
  expectedCards?: {
    home: number;
    away: number;
    total: number;
  };
  topScores: ScorelineProb[];
}

export interface AIAnalysisOutput {
  summary: string;
  favorsHome: string[];
  favorsAway: string[];
  mainUncertainties: string[];
  whatCouldChange: string[];
  tacticalOverview: string;
  isAiGenerated: boolean;
  modelUsed: string;
  liveNewsSummary?: string;
  marketConsensus?: string;
  searchSources?: { title: string; uri: string }[];
  breakingNewsPoints?: string[];
}

export interface PredictionTimelineEntry {
  version: string;
  timestamp: string;
  label: string; // e.g. "24h before", "12h before", "Lineups confirmed", "Final pre-match"
  homeProb: number;
  drawProb: number;
  awayProb: number;
  triggerEvent: string;
}

export interface PredictionResult {
  matchId: string;
  modelVersion: string;
  timestamp: string;
  signalStrength: SignalStrength;
  dataConfidence: number; // 0 - 100%
  dataConfidenceBreakdown: {
    sourcesCount: number;
    lineupStatus: 'CONFIRMED' | 'PROJECTED' | 'PARTIAL';
    statsFreshness: string;
    hasConflictingSources: boolean;
  };
  modelReliability: ModelConfidence;
  reliabilityReason: string;
  probabilities: PredictionMarkets;
  factors: ExplainabilityFactor[];
  aiAnalysis: AIAnalysisOutput;
  timeline: PredictionTimelineEntry[];
  marketDiscrepancy?: {
    hasValueSignal: boolean;
    selection: 'HOME' | 'DRAW' | 'AWAY' | 'NONE';
    modelProb: number;
    impliedMarketProb: number;
    edgePercentage: number;
  };
  ensembleWeights: {
    poisson: number;
    elo: number;
    logisticRegression: number;
    treeEnsemble: number;
  };
}

export interface Match {
  id: string;
  competition: string;
  competitionCode: string;
  competitionLogo: string;
  utcDate: string;
  venue: string;
  round?: string;
  status: MatchStatus;
  minute?: number;
  homeScore?: number;
  awayScore?: number;
  homeTeam: Team;
  awayTeam: Team;
  headToHead: HeadToHeadMatch[];
  odds?: MarketOdds;
  sources: MatchSource[];
  prediction?: PredictionResult;
  isFavorite?: boolean;
}

export interface BacktestBucket {
  bucketRange: string; // e.g. "50-60%", "60-70%"
  predictedAvg: number;
  actualFrequency: number;
  sampleCount: number;
  brierScore: number;
}

export interface BacktestSummary {
  modelVersion: string;
  evaluatedMatchesCount: number;
  evaluationPeriod: string;
  overallAccuracy: number;
  brierScore: number;
  logLoss: number;
  calibrationError: number;
  roiSimulated?: number;
  buckets: BacktestBucket[];
  byLeague: {
    league: string;
    matches: number;
    accuracy: number;
    brierScore: number;
  }[];
  modelDriftStatus: 'HEALTHY' | 'STABLE' | 'DEGRADED';
  driftAlert?: string;
  isSyntheticData?: boolean;
  dataSourceLabel?: string;
}

export interface HistoricalMatchEval {
  matchId: string;
  fixture: string;
  league: string;
  predictedProbHome: number;
  predictedProbDraw: number;
  predictedProbAway: number;
  actualOutcome: 'HOME' | 'DRAW' | 'AWAY';
  homeScore: number;
  awayScore: number;
}

export interface DataProviderHealth {
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  providerName: string;
  isSynthetic: boolean;
  message: string;
  cacheTtlSeconds?: number;
  cachedEntriesCount?: number;
}

export interface IFootballDataProvider {
  readonly name: string;
  readonly isSynthetic: boolean;
  getMatches(filters?: { competition?: string; status?: string; search?: string; favoritesOnly?: boolean }): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;
  getHistoricalMatchesForBacktest(): Promise<HistoricalMatchEval[]>;
  getTeamStats(teamId: string): Promise<TeamStats | null>;
  getInjuries(teamId: string): Promise<PlayerInjury[]>;
  checkHealth(): Promise<DataProviderHealth>;
}

export interface LiveMatchAnalysisResult {
  query: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  matchDate: string;
  venue?: string;
  status: string; // 'SCHEDULED' | 'FINISHED' | 'LIVE' | 'UPCOMING'
  probabilities: {
    home: number;
    draw: number;
    away: number;
  };
  expectedGoals: {
    home: number;
    away: number;
    total: number;
  };
  topScores: { score: string; probability: number }[];
  marketOdds: {
    home: number;
    draw: number;
    away: number;
    bookmakersFound?: string;
  };
  overUnder25: {
    over: number;
    under: number;
  };
  btts: {
    yes: number;
    no: number;
  };
  verdict: string;
  signalStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNCERTAIN';
  favorsHome: string[];
  favorsAway: string[];
  risksAndUncertainties: string[];
  breakingNews: string[];
  sources: { title: string; uri: string }[];
  isLiveSearched: boolean;
  analyzedAt: string;
  isQuotaLimited?: boolean;
}

export type BetMarketType = 
  | 'HOME' 
  | 'DRAW' 
  | 'AWAY' 
  | 'OVER_25' 
  | 'UNDER_25' 
  | 'BTTS_YES' 
  | 'BTTS_NO' 
  | 'DOUBLE_1X' 
  | 'DOUBLE_X2' 
  | 'DOUBLE_12' 
  | 'CUSTOM';

export type CurrencyCode = 'AOA' | 'USD' | 'EUR' | 'BRL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  position: 'prefix' | 'suffix';
}

export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID';

export interface TrackedBet {
  id: string;
  match_id: string;
  match_title: string;
  competition: string;
  market_chosen: string;
  market_label: string;
  odd: number;
  stake: number;
  currency: CurrencyCode;
  predicted_prob: number;
  fair_odd: number;
  ev_value: number;
  status: BetStatus;
  score_home: number | null;
  score_away: number | null;
  profit_loss: number | null;
  created_at: string;
  settled_at: string | null;
}

export interface BetSummaryStats {
  totalBets: number;
  pendingBets: number;
  settledBets: number;
  wonBets: number;
  lostBets: number;
  voidBets: number;
  winRate: number; // Win rate percentage (won / (won + lost) * 100)
  totalStaked: number;
  totalProfitLoss: number;
  roi: number; // (totalProfitLoss / totalStaked) * 100
}

export interface SettleResponse {
  success: boolean;
  message: string;
  settledCount: number;
  pendingCount: number;
  settledBets: TrackedBet[];
  summary: BetSummaryStats;
}

export interface BetValidationRequest {
  matchQuery: string;
  market: BetMarketType | string;
  marketLabel?: string;
  offeredOdd: number;
  stake?: number;
  currency?: CurrencyCode;
  manualProbability?: number;
}

export interface BetValidationResult {
  matchQuery: string;
  identifiedMatch: {
    homeTeam: string;
    awayTeam: string;
    competition: string;
    matchDate: string;
    venue?: string;
    isExistingDbMatch: boolean;
    isLiveSearched: boolean;
  };
  market: {
    key: string;
    label: string;
  };
  offeredOdd: number;
  stake: number;
  impliedProbability: number; // (1 / odd) * 100
  estimatedProbability: number; // 0-100%
  estimatedProbabilityDecimal: number; // 0-1
  expectedValue: number; // Unit EV: p * (odd - 1) - (1 - p)
  expectedValuePercentage: number; // EV * 100
  fairOdd: number; // 1 / p
  minimumProfitableOdd: number; // break-even odd
  edgePercentage: number; // ((offeredOdd / fairOdd) - 1) * 100
  potentialReturn: number; // stake * offeredOdd
  expectedProfit: number; // stake * expectedValue
  isPositiveEV: boolean;
  verdict: 'POSITIVE_VALUE' | 'NEGATIVE_VALUE';
  verdictTitle: string; // "[VALOR POSITIVO / RECOMENDADO]" | "[VALOR NEGATIVO / RISCO ALTO]"
  explanation: string;
  sources?: { title: string; uri: string }[];
  modelContext?: {
    probabilities1X2: { home: number; draw: number; away: number };
    expectedGoals?: { home: number; away: number; total: number };
    overUnder25?: { over: number; under: number };
    btts?: { yes: number; no: number };
    breakingNews?: string[];
  };
}

