import { redirect } from "next/navigation";
export default function RedirectCheckin({ params }: { params: { id: string } }) {
  redirect(`/programs/${params.id}/check-in`);
}
