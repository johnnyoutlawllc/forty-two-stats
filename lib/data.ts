import { createClient } from './supabase';
import type { PlayerStats, Match, Game, Player, TeamStat } from './types';

const ft = () => createClient().schema('fortytwo');

// Every read is filtered by league. RLS enforces this server-side too — the
// filter here is so a member of several leagues sees one at a time.

export async function getPlayerStats(leagueId: string): Promise<PlayerStats[]> {
  const { data, error } = await ft().from('player_stats').select('*').eq('league_id', leagueId);
  if (error) throw error;
  return (data ?? []).map(r => ({
    ...r,
    wins: Number(r.wins ?? 0), losses: Number(r.losses ?? 0),
    matches_played: Number(r.matches_played ?? 0),
    win_pct: Number(r.win_pct ?? 0), avg_margin: Number(r.avg_margin ?? 0),
    bid_war: r.bid_war != null ? Number(r.bid_war) : null,
    total_bid_attempted: Number(r.total_bid_attempted ?? 0),
    total_bid_made: Number(r.total_bid_made ?? 0),
    total_bid_set: Number(r.total_bid_set ?? 0),
  }));
}

export async function getPlayers(leagueId: string): Promise<Player[]> {
  const { data, error } = await ft().from('players').select('*').eq('league_id', leagueId).order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getMatches(leagueId: string): Promise<Match[]> {
  const { data, error } = await ft().from('matches_view').select('*')
    .eq('league_id', leagueId).order('played_on', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, team1_games_won: Number(r.team1_games_won), team2_games_won: Number(r.team2_games_won) }));
}

export async function getMatch(id: string): Promise<{ match: Match; games: Game[]; bids: any[] }> {
  const [matchRes, gamesRes, bidsRes] = await Promise.all([
    ft().from('matches_view').select('*').eq('id', id).single(),
    ft().from('games').select('*').eq('match_id', id).order('ordinal'),
    ft().from('session_bids_view').select('*').eq('match_id', id),
  ]);
  if (matchRes.error) throw matchRes.error;
  return {
    match: { ...matchRes.data, team1_games_won: Number(matchRes.data.team1_games_won), team2_games_won: Number(matchRes.data.team2_games_won) },
    games: (gamesRes.data ?? []).map(g => ({ ...g, ordinal: Number(g.ordinal), team1_pts: Number(g.team1_pts), team2_pts: Number(g.team2_pts) })),
    bids: (bidsRes.data ?? []).map((b: any) => ({ ...b, bidder_name: b.player_name ?? '', bidder_color: b.player_color ?? '' })),
  };
}

export async function getTeamStats(leagueId: string): Promise<TeamStat[]> {
  const { data, error } = await ft().from('team_stats').select('*').eq('league_id', leagueId);
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, wins: Number(r.wins), losses: Number(r.losses), matches_played: Number(r.matches_played), win_pct: Number(r.win_pct), avg_margin: Number(r.avg_margin), score_42plus: Number(r.score_42plus) }));
}

export interface NewMatchPayload {
  league_id: string;
  played_on: string;
  team1: [string, string];
  team2: [string, string];
  games: { t1: number; t2: number }[];
  bids: { by: string; bid: string | number; made: boolean }[];
}

export async function saveMatch(payload: NewMatchPayload): Promise<string> {
  const t1Wins = payload.games.filter(g => g.t1 > g.t2).length;
  const t2Wins = payload.games.filter(g => g.t2 > g.t1).length;
  const { data, error } = await ft().rpc('save_match', {
    p_league: payload.league_id,
    p_played_on: payload.played_on,
    p_team1a: payload.team1[0], p_team1b: payload.team1[1],
    p_team2a: payload.team2[0], p_team2b: payload.team2[1],
    p_t1_wins: t1Wins, p_t2_wins: t2Wins,
    p_games: payload.games.map((g, i) => ({ ordinal: i + 1, team1_pts: g.t1, team2_pts: g.t2 })),
    p_bids: [],
  });
  if (error) throw error;
  return data as string;
}

export async function saveSessionBids(matchId: string, bids: { player_id: string; bids_attempted: number; bids_made: number }[]): Promise<void> {
  const { error } = await ft().rpc('save_session_bids', { p_match_id: matchId, p_bids: bids });
  if (error) throw error;
}

export async function addPlayer(leagueId: string, name: string, color: string, joined_year: number | null, email: string | null): Promise<string> {
  const { data, error } = await ft().rpc('add_player', {
    p_league: leagueId, p_name: name, p_color: color, p_joined_year: joined_year, p_email: email,
  });
  if (error) throw error;
  return data as string;
}

export async function updatePlayer(id: string, name: string, color: string, joined_year: number | null, email: string | null, archived: boolean): Promise<void> {
  const { error } = await ft().rpc('update_player', {
    p_id: id, p_name: name, p_color: color, p_joined_year: joined_year, p_email: email, p_archived: archived,
  });
  if (error) throw error;
}
