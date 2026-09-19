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
}
