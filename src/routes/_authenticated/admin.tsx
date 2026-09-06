import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteSubmission,
  getSubmissionStats,
  listSubmissions,
  type SubmissionRow,
} from "@/lib/submissions.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন ড্যাশবোর্ড — সমর্থক ফরম" },
      { name: "description", content: "জমা দেওয়া সমর্থক ফরমের তালিকা ও ব্যবস্থাপনা।" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "অ্যাডমিন ড্যাশবোর্ড — সমর্থক ফরম" },
      { property: "og:description", content: "জমা দেওয়া তথ্য দেখা, খোঁজা ও ডাউনলোড।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const PAGE_SIZE = 20;

const headers: Array<[keyof SubmissionRow, string]> = [
  ["id", "ID"],
  ["name", "নাম"],
  ["phone", "ফোন"],
  ["mobile", "মোবাইল"],
  ["whatsapp", "WhatsApp"],
  ["email", "ই-মেইল"],
  ["address", "ঠিকানা"],
  ["present_address", "বর্তমান ঠিকানা"],
  ["permanent_address", "স্থায়ী ঠিকানা"],
  ["division", "বিভাগ"],
  ["nationality", "জাতীয়তা"],
  ["date_of_birth", "জন্মতারিখ"],
  ["profession", "পেশা/পরিচয়"],
  ["additional_information", "অতিরিক্ত তথ্য"],
  ["message", "মন্তব্য/বার্তা"],
  ["created_at", "জমার তারিখ ও সময়"],
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("bn-BD");
}

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listSubmissions);
  const fetchStats = useServerFn(getSubmissionStats);
  const removeOne = useServerFn(deleteSubmission);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<SubmissionRow | null>(null);
  const [exporting, setExporting] = useState(false);

  const filters = { search, from, to, page, pageSize: PAGE_SIZE, all: false };

  const stats = useQuery({
    queryKey: ["submission-stats"],
    queryFn: () => fetchStats({ data: undefined }),
  });

  const list = useQuery({
    queryKey: ["submissions", filters],
    queryFn: () => fetchList({ data: filters }),
  });

  const totalPages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE_SIZE));

  async function onDelete(id: string) {
    if (!window.confirm("এই তথ্যটি মুছে ফেলতে চান?")) return;
    await removeOne({ data: { id } });
    await queryClient.invalidateQueries({ queryKey: ["submissions"] });
    await queryClient.invalidateQueries({ queryKey: ["submission-stats"] });
  }

  async function onExport() {
    setExporting(true);
    try {
      const result = await fetchList({ data: { ...filters, all: true } });
      const rows = result.rows.map((row) => {
        const out: Record<string, string> = {};
        for (const [key, label] of headers) {
          const value = row[key];
          out[label] = key === "created_at" ? formatDate(String(value)) : (value ?? "") + "";
        }
        return out;
      });
      const sheet = XLSX.utils.json_to_sheet(rows, { header: headers.map(([, l]) => l) });
      sheet["!cols"] = headers.map(() => ({ wch: 20 }));
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Submissions");
      const stamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(book, `submissions-${stamp}.xlsx`, { bookType: "xlsx", compression: true });
    } finally {
      setExporting(false);
    }
  }

  async function onSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mr-auto font-serif text-xl sm:text-2xl">অ্যাডমিন ড্যাশবোর্ড</h1>
          <button
            onClick={onExport}
            disabled={exporting}
            className="h-10 rounded-sm bg-primary px-4 text-sm text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {exporting ? "তৈরি হচ্ছে..." : "Excel ডাউনলোড"}
          </button>
          <button
            onClick={onSignOut}
            className="h-10 rounded-sm border border-border bg-card px-4 text-sm transition-colors hover:bg-accent"
          >
            লগআউট
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Total Submissions" value={stats.data?.total} />
          <Stat label="Today's Submissions" value={stats.data?.today} />
          <Stat label="This Week" value={stats.data?.week} />
          <Stat label="This Month" value={stats.data?.month} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            className="form-control"
            placeholder="নাম, ফোন বা ই-মেইল খুঁজুন"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="form-control"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <input
            type="date"
            className="form-control"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="mt-4 overflow-x-auto border border-border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-left">
              <tr>
                <th className="px-3 py-2 font-medium">ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : list.data && list.data.rows.length > 0 ? (
                list.data.rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{row.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.phone}</td>
                    <td className="px-3 py-2">{row.email}</td>
                    <td className="px-3 py-2">{formatDate(row.created_at)}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <button className="text-primary underline" onClick={() => setDetail(row)}>
                          দেখুন
                        </button>
                        <button
                          className="text-destructive underline"
                          onClick={() => onDelete(row.id)}
                        >
                          মুছুন
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    কোনো তথ্য পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-3 text-sm">
          <button
            className="h-9 rounded-sm border border-border bg-card px-3 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            পূর্ববর্তী
          </button>
          <span className="text-muted-foreground">
            পৃষ্ঠা {page} / {totalPages} — মোট {list.data?.count ?? 0}
          </span>
          <button
            className="h-9 rounded-sm border border-border bg-card px-3 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            পরবর্তী
          </button>
        </div>

        {detail ? (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4"
            onClick={() => setDetail(null)}
          >
            <div
              className="w-full max-w-lg border border-border bg-card p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-serif text-lg">বিস্তারিত তথ্য</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {headers.map(([key, label]) => (
                  <div key={key} className="grid grid-cols-[140px_1fr] gap-2">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="break-words">
                      {key === "created_at"
                        ? formatDate(String(detail[key]))
                        : ((detail[key] as string | null) ?? "—")}
                    </dd>
                  </div>
                ))}
              </dl>
              <button
                className="mt-4 h-9 rounded-sm border border-border px-4 text-sm hover:bg-accent"
                onClick={() => setDetail(null)}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value ?? "—"}</p>
    </div>
  );
}
