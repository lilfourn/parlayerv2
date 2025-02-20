import axios from 'axios';
import { NextResponse } from 'next/server';

const RAPID_API_KEY = process.env.RAPID_API_KEY || '498668d019msh8d5c3dfa8440cd6p1a2b07jsn51e2b2f77ade';

interface RawNBAPlayer {
  pos: string;
  playerID: string;
  team: string;
  longName: string;
  teamID: string;
}

interface SimplifiedNBAPlayer {
  longName: string;
  team: string;
  playerID: string;
}

function mapPlayersData(data: { body: RawNBAPlayer[] }): SimplifiedNBAPlayer[] {
  return data.body.map(player => ({
    longName: player.longName,
    team: player.team,
    playerID: player.playerID
  }));
}

export async function GET() {
  try {
    const options = {
      method: 'GET',
      url: 'https://tank01-fantasy-stats.p.rapidapi.com/getNBAPlayerList',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': 'tank01-fantasy-stats.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    const mappedPlayers = mapPlayersData(response.data);
    
    return NextResponse.json(mappedPlayers);
    
  } catch (error) {
    console.error('NBA Player List API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player list' },
      { status: 500 }
    );
  }
}