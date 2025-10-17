import { NextResponse } from 'next/server';
import { isStaff, serverClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await serverClient();
  const { data: user } = await supabase.auth.getUser();
  const staff = await isStaff();
  return NextResponse.json({ userId: user?.user?.id ?? null, isStaff: staff });
}
