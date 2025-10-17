import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST() {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })

  const { data, error } = await supabase.rpc('cancel_active_membership')
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 })

  revalidatePath('/profile')
  return NextResponse.json({ success: true, canceled: Boolean(data) })
}
