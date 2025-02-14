import axios from "axios";
//imports type declarations for events
import { EventOdds, Event} from "@/types/odds";
/*
Without NextResponse, your API routes wouldn't properly integrate with Next.js's server-side handling, and you might encounter issues with:
* Response formatting
* Status codes not being properly set
* Headers not being properly handled
* CORS issues
* Type safety in TypeScript
*/
import { NextResponse } from 'next/server';


const SPORT_SPECIFIC_MARKETS = {
    'americanfootball_nfl': [
        'player_field_goals',
        'player_kicking_points',
        'player_pass_attempts',
        'player_pass_completions',
        'player_pass_interceptions',
        'player_pass_longest_completion',
        'player_pass_rush_reception_tds',
        'player_pass_tds',
        'player_pass_yds',
        'player_pass_yds_q1',
        'player_receptions',
        'player_reception_longest',
        'player_reception_tds',
        'player_reception_yds',
        'player_rush_attempts',
        'player_rush_longest',
        'player_rush_reception_tds',
        'player_rush_reception_yds',
        'player_rush_tds',
        'player_rush_yds',
        'player_sacks',
        'player_tackles_assists',
        'player_tackles_over',
        'player_anytime_td',
    ],
    'americanfootball_ncaa':[
        'player_field_goals',
        'player_kicking_points',
        'player_pass_attempts',
        'player_pass_completions',
        'player_pass_interceptions',
        'player_pass_longest_completion',
        'player_pass_rush_reception_tds',
        'player_pass_tds',
        'player_pass_yds',
        'player_pass_yds_q1',
        'player_receptions',
        'player_reception_longest',
        'player_reception_tds',
        'player_reception_yds',
        'player_rush_attempts',
        'player_rush_longest',
        'player_rush_reception_tds',
        'player_rush_reception_yds',
        'player_rush_tds',
        'player_rush_yds',
        'player_sacks',
        'player_tackles_assists',
        'player_tackles_over',
        'player_anytime_td',
    ],
    'basketball_nba': [
        'player_points',
        'player_points_q1',
        'player_rebounds',
        'player_rebounds_q1',
        'player_assists',
        'player_assists_q1',
        'player_threes',
        'player_turnovers',
        'player_rebounds_assists',
        'player_points_rebounds',
        'player_points_assists',
        'player_rebounds_assists',
        'player_field_goals',
        'player_threes_made',
        'player_threes_attempts',
    ],
    'soccer_epl': [
        'player_shots_on_target',
        'player_shots',
        'player_assists'
    ],
    'baseball_mlb': [
        'batter_hits',
        'batter_total_bases',
        'batter_rbis',
        'batter_runs_scored',
        'batter_hits_runs_rbis',
        'batter_singles',
        'batter_strikeouts',
        'pitcher_hits_allowed',
        'pitcher_strikeouts'
    ],
    'baseball_ncaa': [
        'batter_hits',
        'batter_total_bases',
        'batter_rbis',
        'batter_runs_scored',
        'batter_hits_runs_rbis',
        'batter_singles',
        'batter_strikeouts',
        'pitcher_hits_allowed',
        'pitcher_strikeouts'
    ],
    'icehockey_nhl': [
        'player_points',
        'player_power_play_points',
        'player_assists',
        'player_blocked_shots',
        'player_shots_on_goal',
        'player_goals',
        'player_total_saves',
        'player_goal_scorer_first',
        'player_goal_scorer_last',
        'player_goal_scorer_anytime'
    ],
    'soccer_spain_la_liga': [
        'player_shots_on_target',
        'player_shots',
        'player_assists'
    ]
};

// Function to get markets for a specific sport
const getMarketsForSport = (sport: string): string[] => {
    const specificMarkets = SPORT_SPECIFIC_MARKETS[sport as keyof typeof SPORT_SPECIFIC_MARKETS] || [];
    return specificMarkets;
}

async function getEventsForSport(sport: string): Promise<Event[]> {
    try {
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/events`, {
            params: {
                apiKey: process.env.ODDS_API_KEY,
                regions: ['us', 'us_dfs'].join(','),
                commenceTimeFrom: getCommenceTimeFrom(),
                commenceTimeTo: getCommenceTimeTo()
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching events for ${sport}:`, error);
        throw error;
    }
}

async function getSportsBets(sport: string, eventId: string): Promise<EventOdds | null> {
    try {
        // Get the specific markets for this sport
        const sportMarkets = getMarketsForSport(sport);
        
        // Join the markets array into a comma-separated string
        const marketsParam = sportMarkets.join(',');
        
        console.log(`Fetching odds for ${sport} event ${eventId} with markets: ${marketsParam}`);
        
        const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds`, {
            params: {
                apiKey: process.env.ODDS_API_KEY,
                regions: ['us'].join(','),
                markets: marketsParam,
                commenceTimeFrom: getCommenceTimeFrom(),
                commenceTimeTo: getCommenceTimeTo()
            }
        });

        const eventData = response.data as EventOdds;

        // Validate bookmakers
        if (!eventData.bookmakers || !Array.isArray(eventData.bookmakers) || eventData.bookmakers.length === 0) {
            console.log(`No bookmakers found for ${sport} event ${eventId}`);
            return null;
        }

        // Validate that each bookmaker has markets
        const validBookmakers = eventData.bookmakers.filter(bookmaker => 
            bookmaker.markets && 
            Array.isArray(bookmaker.markets) && 
            bookmaker.markets.length > 0
        );

        if (validBookmakers.length === 0) {
            console.log(`No valid markets found in bookmakers for ${sport} event ${eventId}`);
            return null;
        }

        // Return event with only valid bookmakers
        return {
            ...eventData,
            bookmakers: validBookmakers
        };

    } catch (error) {
        console.error(`Error fetching odds for ${sport} event ${eventId}:`, error);
        return null;
    }
}

const formatDateToUTC = (date: Date) => {
    return date.toISOString().split('.')[0] + 'Z';
}
    
const getCommenceTimeFrom = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return formatDateToUTC(date);
}
    
const getCommenceTimeTo = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3);
    return formatDateToUTC(date);
}

// Define response type with proper interfaces
interface SportResponse {
    sport: string;
    data: EventOdds[] | null;
    success: boolean;
    error?: string;
    eventCount: number;
}

interface ApiResponse {
    data: Record<string, EventOdds[]>;
    failed_sports: string[];
    successful_sports: string[];
    market_availability: Record<string, {
        available_markets: string[];
        bookmaker_count: number;
    }>;
}

export async function GET() {
    try {
        const allSportsData = await Promise.all(
            Object.keys(SPORT_SPECIFIC_MARKETS).map(async (sport): Promise<SportResponse> => {
                try {
                    const events = await getEventsForSport(sport);
                    const hasEvents = Array.isArray(events) && events.length > 0;
                    
                    if (!hasEvents) {
                        console.log(`No active events found for ${sport}`);
                        return {
                            sport,
                            data: [],
                            success: true,
                            eventCount: 0
                        };
                    }

                    const eventOddsPromises = events.map(async (event): Promise<EventOdds | null> => {
                        try {
                            const odds = await getSportsBets(sport, event.id);
                            
                            // Type guard for odds and bookmakers
                            const hasValidOdds = odds !== null && 
                                               Array.isArray(odds.bookmakers) && 
                                               odds.bookmakers.length > 0;
                            
                            if (!hasValidOdds) {
                                console.log(`No valid odds available for ${sport} event: ${event.id}`);
                                return null;
                            }
                            
                            return odds;
                        } catch (error) {
                            console.error(
                                `Failed to fetch odds for ${sport} event ${event.id} ` +
                                `(${event.home_team} vs ${event.away_team}):`,
                                error
                            );
                            return null;
                        }
                    });

                    const eventOdds = await Promise.all(eventOddsPromises);
                    const validEventOdds = eventOdds.filter((odds): odds is EventOdds => odds !== null);

                    console.log(
                        `Processed ${sport}: ` +
                        `${validEventOdds.length} valid odds out of ${events.length} events`
                    );

                    return {
                        sport,
                        data: validEventOdds,
                        success: true,
                        eventCount: events.length
                    };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`Failed to process ${sport}:`, errorMessage);
                    
                    return {
                        sport,
                        data: null,
                        success: false,
                        error: errorMessage,
                        eventCount: 0
                    };
                }
            })
        );

        const response: ApiResponse = {
            data: {},
            failed_sports: [],
            successful_sports: [],
            market_availability: {}
        };

        allSportsData.forEach(result => {
            if (result.success && result.data && Array.isArray(result.data)) {
                response.data[result.sport] = result.data;
                response.successful_sports.push(result.sport);
                
                // Analyze available markets and bookmakers for this sport
                const markets = new Set<string>();
                const bookmakers = new Set<string>();
                
                result.data.forEach(event => {
                    if (event.bookmakers && Array.isArray(event.bookmakers)) {
                        event.bookmakers.forEach(bookmaker => {
                            bookmakers.add(bookmaker.key);
                            if (bookmaker.markets && Array.isArray(bookmaker.markets)) {
                                bookmaker.markets.forEach(market => {
                                    markets.add(market.key);
                                });
                            }
                        });
                    }
                });

                response.market_availability[result.sport] = {
                    available_markets: Array.from(markets),
                    bookmaker_count: bookmakers.size
                };
            } else {
                response.failed_sports.push(result.sport);
            }
        });

        return NextResponse.json(response);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { 
                error: 'Failed to fetch odds',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        );
    }
}