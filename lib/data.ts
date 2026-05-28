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
