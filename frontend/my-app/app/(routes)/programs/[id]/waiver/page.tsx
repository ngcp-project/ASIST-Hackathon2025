import Link from "next/link";

export default async function WaiverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Program {id} Waiver</h1>
      <p className="text-gray-600 mb-6 max-w-lg text-center">
        Please read and sign the waiver form before participating in the program.
      </p>

      <div className="flex gap-4">
        <Link
          href={`/programs/${id}`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Agree and Continue 
        </Link>

        <Link
          href={`/programs/${id}`}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
