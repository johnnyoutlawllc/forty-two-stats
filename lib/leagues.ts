import { createClient } from './supabase';
import type { League, LeagueShare } from './types';

const ft = () => createClient().schema('fortytwo');

/** Leagues the signed-in user owns or has been shared into. */
export async function getMyLeagues(): Promise<League[]> {
  const { data, error } = await ft().rpc('my_leagues');
  if (error) throw error;
  return (data ?? []).map((l: League) => ({ ...l, member_count: Number(l.member_count ?? 1) }));
}

/** The read-only sample league shown to signed-out visitors. */
export async function getDemoLeague(): Promise<League | null> {
  const { data, error } = await ft()
    .from('leagues').select('id,name,owner_id,is_demo,created_at')
    .eq('is_demo', true).limit(1).maybeSingle();
  if (error) throw error;
  return data ? { ...data, role: 'viewer', owner_name: null, member_count: 0 } : null;
}

export async function createLeague(name: string): Promise<string> {
  const { data, error } = await ft().rpc('create_league', { p_name: name });
  if (error) throw error;
  return data as string;
}

export async function renameLeague(leagueId: string, name: string): Promise<void> {
  const { error } = await ft().rpc('rename_league', { p_league: leagueId, p_name: name });
  if (error) throw error;
}

export async function getShares(leagueId: string): Promise<LeagueShare[]> {
  const { data, error } = await ft().rpc('league_shares', { p_league: leagueId });
  if (error) throw error;
  return data ?? [];
}

/**
 * Share with someone by email. Returns 'added' when they already had an account,
 * 'invited' when the share is waiting for their first sign-in.
 */
export async function shareLeague(leagueId: string, email: string, role: 'editor' | 'viewer'): Promise<'added' | 'invited'> {
  const { data, error } = await ft().rpc('share_league', { p_league: leagueId, p_email: email, p_role: role });
  if (error) throw error;
  return data as 'added' | 'invited';
}

export async function unshareLeague(leagueId: string, email: string): Promise<void> {
  const { error } = await ft().rpc('unshare_league', { p_league: leagueId, p_email: email });
  if (error) throw error;
}

export async function leaveLeague(leagueId: string): Promise<void> {
  const { error } = await ft().rpc('leave_league', { p_league: leagueId });
  if (error) throw error;
}
