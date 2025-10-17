import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { programId, answers, action } = body;
    if (!programId) return NextResponse.json({ success: false, message: 'programId required' }, { status: 400 });

    const supabase = await serverClient();

    if (action === 'cancel') {
      // Try a direct update first (RLS allows self-update), then fallback to RPC
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });

      const direct = await supabase
        .from('registrations')
        .update({ status: 'CANCELED', canceled_at: new Date().toISOString() })
        .eq('program_id', programId)
        .eq('user_id', userData.user.id)
        .in('status', ['REGISTERED','WAITLISTED'])
        .select('id')
        .limit(1);

      if (direct.error || !direct.data || direct.data.length === 0) {
        // Fallback to RPC if direct update failed
        const { error } = await supabase.rpc('cancel_registration', { p_program_id: programId });
        if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
      }

      revalidatePath('/profile');
      revalidatePath(`/programs/${programId}`);

      return NextResponse.json({ success: true, message: 'Canceled' });
    }

    // default: register
    const { data, error } = await supabase.rpc('register_user', {
      p_program_id: programId,
      p_answers: answers ?? []
    });

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

    // Revalidate relevant pages so SSR data refreshes
    revalidatePath('/profile');
    revalidatePath(`/programs/${programId}`);

    return NextResponse.json({ success: true, status: (data as any)?.status ?? 'REGISTERED', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message ?? String(err) }, { status: 500 });
  }
}
