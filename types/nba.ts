interface GameSchedule {
  gameID: string;
  seasonType: string;
  away: string;
  gameTime: string;
  gameDate: string;
  teamIDHome: string;
  gameTime_epoch: string;
  teamIDAway: string;
  home: string;
}

interface TeamSchedule {
  [gameId: string]: GameSchedule;
}

interface Streak {
  result: "W" | "L";
  length: number;
}

interface PlayerInjury {
  injReturnDate: string;
  description: string;
  injDate: string;
  designation: string;
}

interface PlayerStats {
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

interface Player {
  college: string;
  fantasyProsLink: string;
  jerseyNum: string;
  bRefID: string;
  espnName: string;
  yahooLink: string;
  sleeperBotID: string;
  fantasyProsPlayerID: string;
  nbaComLink: string;
  nbaComHeadshot: string;
  lastGamePlayed: string;
  espnLink: string;
  yahooPlayerID: string;
  pos: string;
  teamID: string;
  injury: PlayerInjury;
  nbaComName: string;
  rotoWirePlayerIDFull: string;
  rotoWirePlayerID: string;
  exp: string;
  height: string;
  nbaComID: string;
  espnHeadshot: string;
  espnID: string;
  firstSeen: string;
  weight: string;
  team: string;
  bRefName: string;
  espnShortName: string;
  bDay: string;
  cbsPlayerID: string;
  shortName: string;
  longName: string;
  playerID: string;
  stats: PlayerStats;
}

interface Roster {
  [playerId: string]: Player;
}

interface TopPerformer {
  total: string;
  playerID: string[];
}

interface TopPerformers {
  blk: TopPerformer;
  ast: TopPerformer;
  tptfgm: TopPerformer;
  stl: TopPerformer;
  TOV: TopPerformer;
  pts: TopPerformer;
  reb: TopPerformer;
}

interface PositionalStats {
  C: string;
  SF: string;
  SG: string;
  PF: string;
  PG: string;
  Total: string;
}

interface TeamStats {
  blk: PositionalStats;
  fga: PositionalStats;
  ptsAway: string;
  ast: PositionalStats;
  tptfgm: PositionalStats;
  stl: PositionalStats;
  ptsHome: string;
  fgm: PositionalStats;
  teamAbv: string;
  pts: PositionalStats;
  reb: PositionalStats;
  fta: PositionalStats;
  gamesPlayed: string;
  teamID: string;
  tptfga: PositionalStats;
  TOV: PositionalStats;
  ftm: PositionalStats;
}

export interface NBATeam {
  teamAbv: string;
  teamCity: string;
  teamSchedule: TeamSchedule;
  currentStreak: Streak;
  loss: string;
  ppg: string;
  teamName: string;
  Roster: Roster;
  teamID: string;
  division: string;
  conferenceAbv: string;
  nbaComLogo2: string;
  nbaComLogo1: string;
  espnLogo1: string;
  oppg: string;
  wins: string;
  conference: string;
  topPerformers: TopPerformers;
  defensiveStats: TeamStats;
  offensiveStats: TeamStats;
}