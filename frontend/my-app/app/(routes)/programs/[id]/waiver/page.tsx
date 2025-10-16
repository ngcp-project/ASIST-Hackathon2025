import { serverClient } from '@/lib/supabase/server';
import RegistrationForm from '@/components/RegistrationForm';

export default async function WaiverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await serverClient();
  const { data } = await supabase
    .from('programs')
    .select('title')
    .eq('id', id)
    .maybeSingle();

  const title = data?.title ?? `Program ${id}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">{title} Waiver</h1>
      <p className="text-gray-600 mb-6 max-w-lg text-center">
        Please read and sign the waiver form before participating in the program.
      </p>

      {/* Render the client-side registration form which handles affiliation-specific questions */}
      <div className="w-full max-w-3xl">
        <RegistrationForm programId={id} programTitle={title} />
      </div>
    </div>
  );
}
