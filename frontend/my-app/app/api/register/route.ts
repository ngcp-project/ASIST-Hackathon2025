import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { programId, answers } = body;
    if (!programId) return NextResponse.json({ success: false, message: 'programId required' }, { status: 400 });

    const supabase = await serverClient();
    const { data, error } = await supabase.rpc('register_user', {
      p_program_id: programId,
      p_price_paid: null,
      p_answers: answers ?? [],
      p_agreed_ip: null
    });

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });

    return NextResponse.json({ success: true, status: (data as any)?.status ?? 'REGISTERED', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message ?? String(err) }, { status: 500 });
  }
}
