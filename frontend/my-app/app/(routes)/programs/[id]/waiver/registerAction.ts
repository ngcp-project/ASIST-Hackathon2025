"use server";

import { serverClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type Result = { success: boolean; status?: string; message?: string };

export async function registerForProgram(programId: string, answers?: any): Promise<Result> {
  const supabase = await serverClient();

  // get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Not authenticated' };

  // Get program capacity
  const { data: prog, error: progErr } = await supabase
    .from('programs')
    .select('capacity')
    .eq('id', programId)
    .maybeSingle();

  if (progErr) return { success: false, message: progErr.message };

  const capacity = prog?.capacity ?? 0;

  // Count current registered (not canceled)
  const { data: counts, error: countErr } = await supabase
    .from('registrations')
    .select('id', { count: 'exact' })
    .eq('program_id', programId)
    .neq('status', 'CANCELED');

  if (countErr) return { success: false, message: countErr.message };

  const current = Array.isArray(counts) ? counts.length : (counts ? 1 : 0);

  const { data: existingRegs, error: existingErr } = await supabase
    .from('registrations')
    .select('id,status,waitlist_position,created_at')
    .eq('program_id', programId)
    .eq('user_id', user.id)
    .neq('status', 'CANCELED')
    .order('created_at', { ascending: false });

  if (existingErr) return { success: false, message: existingErr.message };

  if (Array.isArray(existingRegs) && existingRegs.length > 0) {
    // Return the most recent existing registration
    const latest = existingRegs[0] as any;
    return { success: true, status: latest.status };
  }

  try {
    if (capacity > 0 && current >= capacity) {
      // add to waitlist at max+1 position
      const { data: maxPosRes } = await supabase
        .from('registrations')
        .select('waitlist_position')
        .eq('program_id', programId)
        .neq('status', 'CANCELED')
        .order('waitlist_position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const maxPos = (maxPosRes as any)?.waitlist_position ?? 0;
      const { error: insertErr } = await supabase
        .from('registrations')
        .insert([{ program_id: programId, user_id: user.id, status: 'WAITLISTED', waitlist_position: maxPos + 1, answers: answers ?? [] }]);

      if (insertErr) return { success: false, message: insertErr.message };
      // revalidate relevant pages
      revalidatePath(`/programs/${programId}`);
      revalidatePath('/profile');
      return { success: true, status: 'WAITLISTED' };
    } else {
      // register directly
      const { error: insertErr } = await supabase
        .from('registrations')
        .insert([{ program_id: programId, user_id: user.id, status: 'REGISTERED', answers: answers ?? [] }]);

      if (insertErr) return { success: false, message: insertErr.message };
      revalidatePath(`/programs/${programId}`);
      revalidatePath('/profile');
      return { success: true, status: 'REGISTERED' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message ?? String(err) };
  }
}
