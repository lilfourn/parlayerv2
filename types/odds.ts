/*
Ensures type safety across all files and 
allows for easier data handling
*/

export interface Outcome {
    name: string;
    price: number;
    description?: string;
    point?: number;
}

export interface Market {
    key: string;
    last_update: string;
    outcomes: Outcome[];
}

export interface Bookmaker {
    key: string;
    title: string;
    markets: Market[];
}

export interface Event {
    id: string;
    sport_key: string;
    sport_title: string;
    commence_time: string;
    home_team: string;
    away_team: string;
}

// Full event data including odds
export interface EventOdds extends Event {
    bookmakers: Bookmaker[];
}