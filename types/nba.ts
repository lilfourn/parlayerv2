export interface GameSchedule {
  gameID: string;
  seasonType: string;
  away: string;
  home: string;
  teamIDAway: string;
  teamIDHome: string;
  gameDate: string;
  gameTime: string;
  gameTime_epoch: string;
}

export interface TeamSchedule {
  [gameId: string]: GameSchedule;
}

export interface Streak {
  result: "W" | "L";
  length: number;
}

export interface PlayerInjury {
  injReturnDate: string;
  description: string;
  injDate: string;
  designation: string;
}

export interface PlayerStats {
  blk: string;
  fga: string;
  DefReb: string;
  ast: string;
  ftp: string;
  tptfgp: string;
  tptfgm: string;
  trueShootingPercentage: string;
  stl: string;
  fgm: string;
  pts: string;
  reb: string;
  fgp: string;
  effectiveShootingPercentage: string;
  fta: string;
  mins: string;
  gamesPlayed: string;
  TOV: string;
  tptfga: string;
  OffReb: string;
  ftm: string;
}

export interface Player {
  playerID: string;
  teamID: string;
  team: string;
  pos: string;
  jerseyNum: string;
  longName: string;
  shortName: string;
  firstSeen: string;
  height: string;
  weight: string;
  bDay: string;
  exp: string;
  college: string;
  injury: PlayerInjury;
  stats: PlayerStats;
  nbaComID: string;
  nbaComName: string;
  nbaComLink: string;
  nbaComHeadshot: string;
  espnID: string;
  espnName: string;
  espnLink: string;
  espnHeadshot: string;
  espnShortName: string;
  bRefID: string;
  bRefName: string;
  yahooPlayerID: string;
  yahooLink: string;
  cbsPlayerID: string;
  fantasyProsPlayerID: string;
  fantasyProsLink: string;
  rotoWirePlayerID: string;
  rotoWirePlayerIDFull: string;
  sleeperBotID: string;
  lastGamePlayed: string;
}

export interface Roster {
  [playerID: string]: Player;
}

export interface TopPerformer {
  total: string;
  playerID: string[];
}

export interface TopPerformers {
  blk: TopPerformer;
  ast: TopPerformer;
  tptfgm: TopPerformer;
  stl: TopPerformer;
  TOV: TopPerformer;
  pts: TopPerformer;
  reb: TopPerformer;
}

export interface PositionalStats {
  C: string;
  SF: string;
  SG: string;
  PF: string;
  PG: string;
  Total: string;
}

export interface TeamStats {
  blk: PositionalStats;
  fga: PositionalStats;
  ast: PositionalStats;
  tptfgm: PositionalStats;
  stl: PositionalStats;
  fgm: PositionalStats;
  pts: PositionalStats;
  reb: PositionalStats;
  fta: PositionalStats;
  tptfga: PositionalStats;
  TOV: PositionalStats;
  ftm: PositionalStats;
  teamID: string;
  teamAbv: string;
  gamesPlayed: string;
  ptsHome: string;
  ptsAway: string;
}

export interface TeamLogos {
  nbaComLogo1: string;
  nbaComLogo2: string;
  espnLogo1: string;
}

export interface NBATeam {
  team: NBATeam[];
  teamID: string;
  teamAbv: string;
  teamCity: string;
  teamName: string;
  wins: string;
  loss: string;
  ppg: string;
  oppg: string;
  conference: string;
  conferenceAbv: string;
  division: string;
  currentStreak: Streak;
  teamSchedule: TeamSchedule;
  Roster: Roster;
  topPerformers: TopPerformers;
  defensiveStats: TeamStats;
  offensiveStats: TeamStats;
  nbaComLogo1: string;
  nbaComLogo2: string;
  espnLogo1: string;
}

export interface BoxScoreResponse {
  body: {
    playerStats: Record<string, PlayerGameStats>;
    gameStatus: string;
    arenaCapacity: string;
    referees: string;
    arena: string;
    teamStats: {
      CLE: TeamGameStats;
      SA: TeamGameStats;
    };
    gameDate: string;
    homePts: string;
    teamIDHome: string;
    awayResult: string;
    homeResult: string;
    teamIDAway: string;
    away: string;
    attendance: string;
    lineScore: {
      CLE: LineScore;
      SA: LineScore;
    };
    currentlyPlaying: unknown;
    gameLocation: string;
    gameClock: string;
    awayPts: string;
    gameID: string;
    home: string;
    gameStatusCode: string;
  };
}

export interface PlayerGameStats {
  gameID: string;
  fga: string;
  ast: string;
  tptfgp: string;
  tptfgm: string;
  fgm: string;
  reb: string;
  fgp: string;
  mins: string;
  fta: string;
  teamID: string;
  tptfga: string;
  OffReb: string;
  ftm: string;
  blk: string;
  tech: string;
  DefReb: string;
  plusMinus: string;
  ftp: string;
  stl: string;
  team: string;
  teamAbv: string;
  pts: string;
  PF: string;
  TOV: string;
  longName: string;
  playerID: string;
  usage: string;
  fantasyPoints: string;
  headshotUrl?: string | null;
  nbaComHeadshot?: string;
  espnHeadshot?: string;
}

export interface TeamGameStats {
  fga: string;
  ast: string;
  tptfgp: string;
  tptfgm: string;
  fastBreakPts: string;
  fgm: string;
  fgp: string;
  reb: string;
  fta: string;
  teamID: string;
  pointsInPaint: string;
  tptfga: string;
  OffReb: string;
  ftm: string;
  blk: string;
  tech: string;
  DefReb: string;
  ftp: string;
  largestLead: string;
  flagrantFouls: string;
  stl: string;
  team: string;
  teamAbv: string;
  pts: string;
  PF: string;
  TOV: string;
  ptsOffTOV: string;
  numberOfPossessions: string;
}

export interface LineScore {
  "1Q": string;
  teamIDHome?: string;
  teamID: string;
  teamIDAway?: string;
  totalPts: string;
  teamAbv: string;
  "4Q": string;
  "3Q": string;
  "2Q": string;
}

// Helper type for parsing string numbers
export type StringNumber = string;

// Utility type for converting string numbers to actual numbers
export interface ParsedPlayerGameStats extends Omit<PlayerGameStats, 
  | "fga" | "ast" | "tptfgp" | "tptfgm" | "fgm" | "reb" | "fgp" 
  | "mins" | "fta" | "tptfga" | "OffReb" | "ftm" | "blk" | "tech" 
  | "DefReb" | "ftp" | "stl" | "pts" | "PF" | "TOV" | "usage" | "fantasyPoints"> {
  fga: number;
  ast: number;
  tptfgp: number;
  tptfgm: number;
  fgm: number;
  reb: number;
  fgp: number;
  mins: number;
  fta: number;
  tptfga: number;
  OffReb: number;
  ftm: number;
  blk: number;
  tech: number;
  DefReb: number;
  ftp: number;
  stl: number;
  pts: number;
  PF: number;
  TOV: number;
  usage: number;
  fantasyPoints: number;
}

// Game status map
export const GAME_STATUS = {
  NOT_STARTED: "0",
  IN_PROGRESS: "1",
  COMPLETED: "2",
  POSTPONED: "3",
  SUSPENDED: "4",
} as const;

export type GameStatusCode = typeof GAME_STATUS[keyof typeof GAME_STATUS];

export const GAME_STATUS_TEXT: Record<GameStatusCode, string> = {
  [GAME_STATUS.NOT_STARTED]: "Not Started",
  [GAME_STATUS.IN_PROGRESS]: "In Progress",
  [GAME_STATUS.COMPLETED]: "Final",
  [GAME_STATUS.POSTPONED]: "Postponed",
  [GAME_STATUS.SUSPENDED]: "Suspended",
};

export function getGameStatusText(statusCode: GameStatusCode): string {
  return GAME_STATUS_TEXT[statusCode];
}