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