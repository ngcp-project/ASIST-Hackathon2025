// This file is used to create a Supabase client for server-side rendering (SSR) in a Next.js application.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const serverClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // NEW API — no deprecation warning
        getAll() {
          return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet) {
          // Next.js 14+ restricts writing cookies during RSC render.
          // Supabase may attempt to sync cookies on client creation/refresh.
          // Swallow errors here; real writes should happen in Server Actions or Route Handlers.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch (e) {
            // Ignore when called in a Server Component render context.
          }
        },
      },
    }
  )
}

// Helper: check whether the current user is staff/admin.
export const isStaff = async (): Promise<boolean> => {
  const supabase = await serverClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return false;
  const { data, error } = await supabase.rpc('auth_is_staff');
  if (error) return false;
  return Boolean(data);
}
