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
  const client = sb();
  const t1Wins = payload.games.filter(g => g.t1 > g.t2).length;
  const t2Wins = payload.games.filter(g => g.t2 > g.t1).length;

  // Insert match
  const { data: match, error: mErr } = await client.schema('fortytwo').from('matches').insert({
    played_on: payload.played_on,
    team1_player_a: payload.team1[0],
    team1_player_b: payload.team1[1],
    team2_player_a: payload.team2[0],
    team2_player_b: payload.team2[1],
    team1_games_won: t1Wins,
    team2_games_won: t2Wins,
  }).select('id').single();
  if (mErr) throw mErr;
  const matchId = match.id;

  // Insert games
  if (payload.games.length > 0) {
    const { error: gErr } = await client.schema('fortytwo').from('games').insert(
      payload.games.map((g, i) => ({ match_id: matchId, ordinal: i + 1, team1_pts: g.t1, team2_pts: g.t2 }))
    );
    if (gErr) throw gErr;
  }

  // Insert bids
  if (payload.bids.length > 0) {
    const { error: bErr } = await client.schema('fortytwo').from('bids').insert(
      payload.bids.map((b, i) => ({
        match_id: matchId,
        bidder_id: b.by,
        bid_value: String(b.bid),
        made: b.made,
        ordinal: i + 1,
      }))
    );
    if (bErr) throw bErr;
  }

  return matchId;
}
