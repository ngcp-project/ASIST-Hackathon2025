"use server";

import { serverClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

type Result = { success: boolean; status?: string; message?: string };

export async function registerForProgram(programId: string, answers?: any): Promise<Result> {
  const supabase = await serverClient();
  // Prefer using DB-side RPC which enforces capacity, waitlist promotion, and RLS.
  try {
    const { data, error } = await supabase.rpc('register_user', {
      p_program_id: programId,
      p_answers: answers ?? []
    });

    if (error) return { success: false, message: error.message };

    // rpc returns a json object with registration_id, status, position
    revalidatePath(`/programs/${programId}`);
    revalidatePath('/profile');
  return { success: true, status: (data as any)?.status ?? 'REGISTERED' };
  } catch (err: any) {
    return { success: false, message: err?.message ?? String(err) };
  }
}
