import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null));

export const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  address: optionalText(300),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(200),
  nationality: optionalText(80),
  date_of_birth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : null)),
  mobile: z.string().trim().min(6).max(30),
  whatsapp: optionalText(30),
  profession: optionalText(120),
  present_address: optionalText(300),
  permanent_address: optionalText(300),
  division: optionalText(60),
  additional_information: optionalText(2000),
  message: optionalText(2000),
  consent: z.literal(true),
});

export type SubmissionInput = z.input<typeof submissionSchema>;

export type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];

function serverPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await serverPublicClient().from("submissions").insert(data);
    if (error) throw new Error("সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।");
    return { ok: true as const };
  });

async function assertAdmin(context: { supabase: ReturnType<typeof serverPublicClient>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const listSubmissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).default(""),
        from: z.string().trim().max(10).default(""),
        to: z.string().trim().max(10).default(""),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(20),
        all: z.boolean().default(false),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    let query = context.supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (data.search) {
      const s = data.search.replace(/[%,()]/g, " ");
      query = query.or(
        `name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,mobile.ilike.%${s}%`,
      );
    }
    if (data.from) query = query.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) query = query.lte("created_at", `${data.to}T23:59:59Z`);
    if (!data.all) {
      const start = (data.page - 1) * data.pageSize;
      query = query.range(start, start + data.pageSize - 1);
    }

    const { data: rows, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as SubmissionRow[], count: count ?? 0 };
  });

export const getSubmissionStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { data, error } = await context.supabase.from("submissions").select("created_at");
    if (error) throw new Error(error.message);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfDay - now.getDay() * 86400000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let today = 0;
    let week = 0;
    let month = 0;
    for (const row of data ?? []) {
      const t = new Date(row.created_at).getTime();
      if (t >= startOfDay) today += 1;
      if (t >= startOfWeek) week += 1;
      if (t >= startOfMonth) month += 1;
    }
    return { total: (data ?? []).length, today, week, month };
  });

export const deleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { error } = await context.supabase.from("submissions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
