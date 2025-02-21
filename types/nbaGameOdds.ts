export interface NBAGameOutcome {
  name: string;   // Team name
  price: number;  // American odds format (e.g., -290, +235)
}

export interface NBAGameMarket {
  key: string;           // Market type (e.g., "h2h" for head-to-head)
  last_update: string;   // ISO timestamp
  outcomes: NBAGameOutcome[];
}

export interface NBAGameBookmaker {
  key: string;           // Unique bookmaker identifier
  title: string;         // Display name
  last_update: string;   // ISO timestamp
  markets: NBAGameMarket[];
}

export interface NBAGameOdds {
  id: string;            // Unique game identifier
  sport_key: string;     // Always "basketball_nba"
  sport_title: string;   // Always "NBA"
  commence_time: string; // ISO timestamp for game start
  home_team: string;     // Home team name
  away_team: string;     // Away team name
  bookmakers: NBAGameBookmaker[];
}

// Array of game odds for multiple games
export type NBAGamesOddsResponse = NBAGameOdds[];