export type LeagueRole = 'owner' | 'editor' | 'viewer';

export interface League {
  id: string; name: string; owner_id: string; is_demo: boolean;
  role: LeagueRole; owner_name: string | null; member_count: number;
  created_at?: string;
}

export interface LeagueShare {
  email: string; display_name: string | null;
  role: LeagueRole; status: 'active' | 'pending'; created_at: string;
}

export interface Player {
  id: string; name: string; color: string; joined_year: number | null;
  archived: boolean; user_id: string | null; email: string | null;
  league_id: string;
}

export interface PlayerStats {
  id: string; name: string; color: string;
  joined_year: number | null; archived: boolean; email: string | null;
  league_id: string; user_id: string | null;
  matches_played: number; wins: number; losses: number;
  win_pct: number; avg_margin: number;
  bid_war: number | null;
  total_bid_attempted: number; total_bid_made: number; total_bid_set: number;
}

export interface Match {
  id: string; played_on: string; league_id: string;
  team1_player_a: string; team1_player_b: string;
  team2_player_a: string; team2_player_b: string;
  team1_games_won: number; team2_games_won: number;
  t1a_name: string; t1b_name: string; t2a_name: string; t2b_name: string;
  t1a_color: string; t1b_color: string; t2a_color: string; t2b_color: string;
  created_at: string;
}

export interface Game { id: string; match_id: string; ordinal: number; team1_pts: number; team2_pts: number; }

export interface TeamStat {
  league_id: string; p_lo: string; p_hi: string;
  player_a_name: string; player_b_name: string;
  player_a_color: string; player_b_color: string;
  matches_played: number; wins: number; losses: number;
  win_pct: number; avg_margin: number; score_42plus: number;
}

export type Route =
  | { name: 'home' } | { name: 'standings' } | { name: 'matches' }
  | { name: 'match'; matchId: string } | { name: 'player'; playerId: string }
  | { name: 'h2h'; a?: string; b?: string } | { name: 'settings' };

export interface Bid {
  id: string;
  match_id: string;
  game_id: string | null;
  bidder_id: string;
  bid_value: string;
  made: boolean;
  ordinal: number | null;
}
