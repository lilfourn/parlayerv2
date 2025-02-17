export interface StatAverage {
    type: 'stat_average';
    id: string;
    attributes: {
        average: number;
        count: number;
        max_value: number;
    };
}

export interface NewPlayer {
    type: 'new_player';
    id: string;
    attributes: {
        combo: boolean;
        display_name: string;
        image_url: string | null;
        league: string;
        league_id: number;
        market: string | null;
        name: string;
        position: string;
        team: string;
        team_name: string | null;
    };
    relationships?: {
        league: {
            data: {
                type: string;
                id: string;
            };
        };
        team_data: {
            data: {
                type: string;
                id: string;
            };
        };
    };
}

export interface TeamData {
    type: 'team';
    id: string;
    attributes: {
        name: string;
        city: string;
        abbreviation: string;
        logo_url: string;
    };
}

export interface Projection {
    type: 'projection';
    id: string;
    attributes: {
        adjusted_odds: number | null;
        board_time: string;
        custom_image: string | null;
        description: string;
        end_time: string | null;
        flash_sale_line_score: number | null;
        game_id: string;
        hr_20: boolean;
        in_game: boolean;
        is_live: boolean;
        is_promo: boolean;
        line_score: number;
        line_movement?: {
            original: number;
            current: number;
            direction: 'up' | 'down';
            difference: number;
        };
        odds_type: string;
        projection_type: string;
        rank: number;
        refundable: boolean;
        start_time: string;
        stat_display_name: string;
        stat_type: string;
        status: 'pre_game' | 'in_progress' | 'final' | string;
        tv_channel: string | null;
        updated_at: string;
    };
    relationships: {
        duration: { data: { type: string; id: string; } };
        league?: { data: { type: string; id: string; } };
        new_player: { data: { type: string; id: string; } | null };
        projection_type: { data: { type: string; id: string; } };
        score: { data: null };
        stat_average: { data: { type: string; id: string; } | null };
        stat_type: { data: { type: string; id: string; } };
    };
    connected?: {
        new_player?: NewPlayer;
        stat_average?: StatAverage;
        league?: {
            type: string;
            id: string;
            attributes: {
                active: boolean;
                f2p_enabled: boolean;
                icon: string;
                image_url: string;
                last_five_games_enabled: boolean;
                league_icon_id: number;
                name: string;
                projections_count: number;
                show_trending: boolean;
            };
            relationships: {
                projection_filters: {
                    data: any[];
                };
            };
        };
    };
}

export type IncludedItem = NewPlayer | StatAverage;

export interface Props {
    success: boolean;
    data: {
        data: Projection[];
    };
}

export interface ProjectionWithAttributes {
    projection: Projection;
    player: NewPlayer | null;
    stats: StatAverage | null;
}
