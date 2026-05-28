import { createClient } from './supabase';
import type { PlayerStats, Match, Game, Player, TeamStat } from './types';

const sb = () => createClient();

export async function getPlayerStats(): Promise<PlayerStats[]> {
  const { data, error } = await sb().from('ft_player_stats').select('*');
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, wins: Number(r.wins), losses: Number(r.losses), matches_played: Number(r.matches_played), win_pct: Number(r.win_pct), avg_margin: Number(r.avg_margin) }));
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await sb().from('ft_players').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await sb().from('ft_matches').select('*').order('played_on', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, team1_games_won: Number(r.team1_games_won), team2_games_won: Number(r.team2_games_won) }));
}

export async function getMatch(id: string): Promise<{ match: Match; games: Game[]; bids: any[] }> {
  const [matchRes, gamesRes, bidsRes] = await Promise.all([
    sb().from('ft_matches').select('*').eq('id', id).single(),
    sb().from('ft_games').select('*').eq('match_id', id).order('ordinal'),
    sb().from('ft_bids').select('*').eq('match_id', id).order('ordinal'),
  ]);
  if (matchRes.error) throw matchRes.error;
  const m = matchRes.data;
  return {
    match: { ...m, team1_games_won: Number(m.team1_games_won), team2_games_won: Number(m.team2_games_won) },
    games: (gamesRes.data ?? []).map(g => ({ ...g, ordinal: Number(g.ordinal), team1_pts: Number(g.team1_pts), team2_pts: Number(g.team2_pts) })),
    bids: bidsRes.data ?? [],
  };
}

export async function getTeamStats(): Promise<TeamStat[]> {
  const { data, error } = await sb().from('ft_team_stats').select('*');
  if (error) throw error;
  return (data ?? []).map(r => ({ ...r, wins: Number(r.wins), losses: Number(r.losses), matches_played: Number(r.matches_played), win_pct: Number(r.win_pct), avg_margin: Number(r.avg_margin), score_42plus: Number(r.score_42plus) }));
}

export interface NewMatchPayload {
  played_on: string;
  team1: [string, string];  // player UUIDs
  team2: [string, string];
  games: { t1: number; t2: number }[];
  bids: { by: string; bid: string | number; made: boolean }[];
}

export async function saveMatch(payload: NewMatchPayload): Promise<string> {
  const t1Wins = payload.games.filter(g => g.t1 > g.t2).length;
  const t2Wins = payload.games.filter(g => g.t2 > g.t1).length;

  const { data, error } = await sb().rpc('save_match', {
    p_played_on: payload.played_on,
    p_team1a: payload.team1[0],
    p_team1b: payload.team1[1],
    p_team2a: payload.team2[0],
    p_team2b: payload.team2[1],
    p_t1_wins: t1Wins,
    p_t2_wins: t2Wins,
    p_games: payload.games.map((g, i) => ({ ordinal: i + 1, team1_pts: g.t1, team2_pts: g.t2 })),
    p_bids: payload.bids.map((b, i) => ({ ordinal: i + 1, bidder_id: b.by, bid_value: String(b.bid), made: b.made })),
  });

  if (error) throw error;
  return data as string;
}

export async function addPlayer(name: string, color: string, joined_year: number | null, email: string | null): Promise<string> {
  const { data, error } = await sb().rpc('add_player', { p_name: name, p_color: color, p_joined_year: joined_year, p_email: email });
  if (error) throw error;
  return data as string;
}

export async function updatePlayer(id: string, name: string, color: string, joined_year: number | null, email: string | null, archived: boolean): Promise<void> {
  const { error } = await sb().rpc('update_player', { p_id: id, p_name: name, p_color: color, p_joined_year: joined_year, p_email: email, p_archived: archived });
  if (error) throw error;
}
