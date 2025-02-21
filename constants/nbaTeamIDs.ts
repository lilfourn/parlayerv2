interface NBATeam {
  teamId: string;
  city: string;
  name: string;
  fullName: string;
  conference: "Eastern" | "Western";
  division: "Atlantic" | "Central" | "Southeast" | "Northwest" | "Pacific" | "Southwest";
  logo: string;
}

interface NBATeamMap {
  [key: string]: NBATeam;
}

export const NBA_TEAMS: NBATeamMap = {
  "ATL": {
    teamId: "1",
    city: "Atlanta",
    name: "Hawks",
    fullName: "Atlanta Hawks",
    conference: "Eastern",
    division: "Southeast",
    logo: "https://cdn.nba.com/teams/uploads/sites/1610612737/2023/01/atl_hawks_primary_icon.svg"
  },
  "BOS": {
    teamId: "2",
    city: "Boston",
    name: "Celtics",
    fullName: "Boston Celtics",
    conference: "Eastern",
    division: "Atlantic",
    logo: "https://cdn.nba.com/logos/nba/1610612738/primary/L/logo.svg"
  },
  "BKN": {
    teamId: "3",
    city: "Brooklyn",
    name: "Nets",
    fullName: "Brooklyn Nets",
    conference: "Eastern",
    division: "Atlantic",
    logo: "https://cdn.nba.com/logos/nba/1610612751/primary/L/logo.svg"
  },
  "CHA": {
    teamId: "4",
    city: "Charlotte",
    name: "Hornets",
    fullName: "Charlotte Hornets",
    conference: "Eastern",
    division: "Southeast",
    logo: "https://cdn.nba.com/logos/nba/1610612766/primary/L/logo.svg"
  },
  "CHI": {
    teamId: "5",
    city: "Chicago",
    name: "Bulls",
    fullName: "Chicago Bulls",
    conference: "Eastern",
    division: "Central",
    logo: "https://cdn.nba.com/logos/nba/1610612741/primary/L/logo.svg"
  },
  "CLE": {
    teamId: "6",
    city: "Cleveland",
    name: "Cavaliers",
    fullName: "Cleveland Cavaliers",
    conference: "Eastern",
    division: "Central",
    logo: "https://cdn.nba.com/logos/nba/1610612739/primary/L/logo.svg"
  },
  "DAL": {
    teamId: "7",
    city: "Dallas",
    name: "Mavericks",
    fullName: "Dallas Mavericks",
    conference: "Western",
    division: "Southwest",
    logo: "https://cdn.nba.com/logos/nba/1610612742/primary/L/logo.svg"
  },
  "DEN": {
    teamId: "8",
    city: "Denver",
    name: "Nuggets",
    fullName: "Denver Nuggets",
    conference: "Western",
    division: "Northwest",
    logo: "https://cdn.nba.com/logos/nba/1610612743/primary/L/logo.svg"
  },
  "DET": {
    teamId: "9",
    city: "Detroit",
    name: "Pistons",
    fullName: "Detroit Pistons",
    conference: "Eastern",
    division: "Central",
    logo: "https://cdn.nba.com/logos/nba/1610612765/primary/L/logo.svg"
  },
  "GS": {
    teamId: "10",
    city: "Golden State",
    name: "Warriors",
    fullName: "Golden State Warriors",
    conference: "Western",
    division: "Pacific",
    logo: "https://cdn.nba.com/logos/nba/1610612744/primary/L/logo.svg"
  },
  "HOU": {
    teamId: "11",
    city: "Houston",
    name: "Rockets",
    fullName: "Houston Rockets",
    conference: "Western",
    division: "Southwest",
    logo: "https://cdn.nba.com/logos/nba/1610612745/primary/L/logo.svg"
  },
  "IND": {
    teamId: "12",
    city: "Indiana",
    name: "Pacers",
    fullName: "Indiana Pacers",
    conference: "Eastern",
    division: "Central",
    logo: "https://cdn.nba.com/logos/nba/1610612754/primary/L/logo.svg"
  },
  "LAC": {
    teamId: "13",
    city: "Los Angeles",
    name: "Clippers",
    fullName: "Los Angeles Clippers",
    conference: "Western",
    division: "Pacific",
    logo: "https://cdn.nba.com/logos/nba/1610612746/primary/L/logo.svg"
  },
  "LAL": {
    teamId: "14",
    city: "Los Angeles",
    name: "Lakers",
    fullName: "Los Angeles Lakers",
    conference: "Western",
    division: "Pacific",
    logo: "https://cdn.nba.com/logos/nba/1610612747/primary/L/logo.svg"
  },
  "MEM": {
    teamId: "15",
    city: "Memphis",
    name: "Grizzlies",
    fullName: "Memphis Grizzlies",
    conference: "Western",
    division: "Southwest",
    logo: "https://cdn.nba.com/logos/nba/1610612763/primary/L/logo.svg"
  },
  "MIA": {
    teamId: "16",
    city: "Miami",
    name: "Heat",
    fullName: "Miami Heat",
    conference: "Eastern",
    division: "Southeast",
    logo: "https://cdn.nba.com/logos/nba/1610612748/primary/L/logo.svg"
  },
  "MIL": {
    teamId: "17",
    city: "Milwaukee",
    name: "Bucks",
    fullName: "Milwaukee Bucks",
    conference: "Eastern",
    division: "Central",
    logo: "https://cdn.nba.com/logos/nba/1610612749/primary/L/logo.svg"
  },
  "MIN": {
    teamId: "18",
    city: "Minnesota",
    name: "Timberwolves",
    fullName: "Minnesota Timberwolves",
    conference: "Western",
    division: "Northwest",
    logo: "https://cdn.nba.com/logos/nba/1610612750/primary/L/logo.svg"
  },
  "NO": {
    teamId: "19",
    city: "New Orleans",
    name: "Pelicans",
    fullName: "New Orleans Pelicans",
    conference: "Western",
    division: "Southwest",
    logo: "https://cdn.nba.com/logos/nba/1610612740/primary/L/logo.svg"
  },
  "NY": {
    teamId: "20",
    city: "New York",
    name: "Knicks",
    fullName: "New York Knicks",
    conference: "Eastern",
    division: "Atlantic",
    logo: "https://cdn.nba.com/logos/nba/1610612752/primary/L/logo.svg"
  },
  "OKC": {
    teamId: "21",
    city: "Oklahoma City",
    name: "Thunder",
    fullName: "Oklahoma City Thunder",
    conference: "Western",
    division: "Northwest",
    logo: "https://cdn.nba.com/teams/uploads/sites/1610612760/2021/12/logo.svg"
  },
  "ORL": {
    teamId: "22",
    city: "Orlando",
    name: "Magic",
    fullName: "Orlando Magic",
    conference: "Eastern",
    division: "Southeast",
    logo: "https://cdn.nba.com/logos/nba/1610612753/primary/L/logo.svg"
  },
  "PHI": {
    teamId: "23",
    city: "Philadelphia",
    name: "76ers",
    fullName: "Philadelphia 76ers",
    conference: "Eastern",
    division: "Atlantic",
    logo: "https://cdn.nba.com/logos/nba/1610612755/primary/L/logo.svg"
  },
  "PHO": {
    teamId: "24",
    city: "Phoenix",
    name: "Suns",
    fullName: "Phoenix Suns",
    conference: "Western",
    division: "Pacific",
    logo: "https://cdn.nba.com/teams/uploads/sites/1610612756/2022/08/suns-logo.svg"
  },
  "POR": {
    teamId: "25",
    city: "Portland",
    name: "Trail Blazers",
    fullName: "Portland Trail Blazers",
    conference: "Western",
    division: "Northwest",
    logo: "https://cdn.nba.com/teams/uploads/sites/1610612757/2022/03/tb_primary_rgb.svg"
  },
  "SAC": {
    teamId: "26",
    city: "Sacramento",
    name: "Kings",
    fullName: "Sacramento Kings",
    conference: "Western",
    division: "Pacific",
    logo: "https://cdn.nba.com/logos/nba/1610612758/primary/L/logo.svg"
  },
  "SA": {
    teamId: "27",
    city: "San Antonio",
    name: "Spurs",
    fullName: "San Antonio Spurs",
    conference: "Western",
    division: "Southwest",
    logo: "https://cdn.nba.com/logos/nba/1610612759/primary/L/logo.svg"
  },
  "TOR": {
    teamId: "28",
    city: "Toronto",
    name: "Raptors",
    fullName: "Toronto Raptors",
    conference: "Eastern",
    division: "Atlantic",
    logo: "https://cdn.nba.com/logos/nba/1610612761/primary/L/logo.svg"
  },
  "UTA": {
    teamId: "29",
    city: "Utah",
    name: "Jazz",
    fullName: "Utah Jazz",
    conference: "Western",
    division: "Northwest",
    logo: "https://cdn.nba.com/logos/nba/1610612762/primary/L/logo.svg"
  },
  "WAS": {
    teamId: "30",
    city: "Washington",
    name: "Wizards",
    fullName: "Washington Wizards",
    conference: "Eastern",
    division: "Southeast",
    logo: "https://cdn.nba.com/teams/uploads/sites/1610612764/2022/06/wiz-primary.svg"
  }
} as const;

// Export types for use in other files
export type NBATeamAbbreviation = keyof typeof NBA_TEAMS;
export type { NBATeam, NBATeamMap };
