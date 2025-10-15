import { serverClient } from '@/lib/supabase/server'
//Programs page component that fetches and displays a list of programs from the Supabase database.
export default async function Programs() {
  const supabase = await serverClient()
  const { data: programs, error } = await supabase
    .from('programs')
    .select('id,title,description,location,start_at,price_public,price_student,price_member,visibility')
    .order('start_at', { ascending: true })

  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Programs</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(programs ?? []).map(p => (
          <a key={p.id} href={`/programs/${p.id}`} className="border rounded-2xl p-4 hover:shadow">
            <h3 className="font-semibold mb-1">{p.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{p.description}</p>
            <div className="mt-3 text-sm">
              <div>Location: {p.location ?? 'TBA'}</div>
              <div className="opacity-70">From ${p.price_public ?? 0}</div>
            </div>
            {p.visibility !== 'PUBLIC' && (
              <div className="mt-2 text-xs uppercase tracking-wide opacity-70">{p.visibility}</div>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
