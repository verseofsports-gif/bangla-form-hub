import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন লগইন — সমর্থক ফরম" },
      { name: "description", content: "সমর্থক ফরমের জমা দেওয়া তথ্য দেখার জন্য অ্যাডমিন লগইন।" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "অ্যাডমিন লগইন — সমর্থক ফরম" },
      { property: "og:description", content: "শুধু অনুমোদিত ব্যবহারকারীর জন্য।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("ই-মেইল বা পাসওয়ার্ড সঠিক নয়।");
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-border bg-card p-6 shadow-none"
      >
        <h1 className="font-serif text-xl">অ্যাডমিন লগইন</h1>
        <p className="mt-1 text-sm text-muted-foreground">শুধু অনুমোদিত ব্যবহারকারীর জন্য।</p>

        <label className="mt-5 block text-sm">
          ই-মেইল
          <input
            type="email"
            required
            className="form-control mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mt-3 block text-sm">
          পাসওয়ার্ড
          <input
            type="password"
            required
            className="form-control mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-10 w-full rounded-sm bg-primary text-sm text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "অপেক্ষা করুন..." : "লগইন"}
        </button>
      </form>
    </div>
  );
}
