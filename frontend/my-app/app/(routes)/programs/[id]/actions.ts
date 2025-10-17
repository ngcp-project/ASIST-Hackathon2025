"use server";

import { revalidatePath } from "next/cache";
import { serverClient } from "@/lib/supabase/server";

export async function updateProgramAction(formData: FormData) {
  const supabase = await serverClient();

  // Ensure only staff/admin can update
  const { data: isStaff, error: staffErr } = await supabase.rpc("auth_is_staff");
  if (staffErr || !isStaff) {
    return { ok: false, error: "Not authorized" };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing id" };

  const parseNum = (v: FormDataEntryValue | null) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const toISO = (v: FormDataEntryValue | null) => {
    if (!v) return null;
    try {
      const s = String(v);
      // If already an ISO string from client conversion, pass through
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    } catch {
      return null;
    }
  };

  const update: any = {
    title: (formData.get("title") as string) ?? null,
    description: (formData.get("description") as string) ?? null,
    location: (formData.get("location") as string) ?? null,
    capacity: parseNum(formData.get("capacity")) ?? 0,
    start_at: toISO(formData.get("start_at")),
    end_at: toISO(formData.get("end_at")),
    visibility: (formData.get("visibility") as string) ?? null,
    publish_at: toISO(formData.get("publish_at")),
    unpublish_at: toISO(formData.get("unpublish_at"))
  };

  const { data: updated, error } = await supabase
    .from("programs")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  // Revalidate listings and detail page
  revalidatePath("/programs");
  revalidatePath(`/programs/${id}`);
  return { ok: true, program: updated } as const;
}
