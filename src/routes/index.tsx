import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { createSubmission, submissionSchema } from "@/lib/submissions.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "সমর্থক ফরম — সমর্থক নিবন্ধন" },
      {
        name: "description",
        content:
          "সমর্থক ফরম পূরণ করে আপনার নাম, ঠিকানা ও যোগাযোগের তথ্য সহজেই জমা দিন। তথ্য গোপন রাখা হয়।",
      },
      { property: "og:title", content: "সমর্থক ফরম — সমর্থক নিবন্ধন" },
      {
        property: "og:description",
        content: "অনলাইনে সমর্থক ফরম পূরণ করুন এবং আপনার তথ্য নিরাপদে জমা দিন।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SupporterForm,
});

const divisions = [
  "ঢাকা",
  "চট্টগ্রাম",
  "রাজশাহী",
  "খুলনা",
  "বরিশাল",
  "সিলেট",
  "রংপুর",
  "ময়মনসিংহ",
];

const professions = ["ছাত্র/ছাত্রী", "চাকরিজীবী", "ব্যবসায়ী", "কৃষক", "শিক্ষক", "গৃহিণী", "অন্যান্য"];

type Fields = Record<string, string>;

const initial: Fields = {
  name: "",
  address: "",
  phone: "",
  email: "",
  nationality: "",
  date_of_birth: "",
  mobile: "",
  whatsapp: "",
  profession: "",
  present_address: "",
  permanent_address: "",
  division: "",
  additional_information: "",
  message: "",
};

function SupporterForm() {
  const submit = useServerFn(createSubmission);
  const [fields, setFields] = useState<Fields>(initial);
  const [sameAsPrevious, setSameAsPrevious] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "present_address" && sameAsPrevious) next.permanent_address = value;
      return next;
    });
  };

  const toggleSame = (checked: boolean) => {
    setSameAsPrevious(checked);
    if (checked) setFields((prev) => ({ ...prev, permanent_address: prev.present_address }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setError(null);
    const parsed = submissionSchema.safeParse({ ...fields, consent });
    if (!parsed.success) {
      setError("অনুগ্রহ করে তারকা (*) চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।");
      return;
    }
    setStatus("sending");
    try {
      await submit({ data: { ...fields, consent } });
      setStatus("done");
      setFields(initial);
      setConsent(false);
      setSameAsPrevious(false);
    } catch {
      setStatus("idle");
      setError("দুঃখিত, তথ্য জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-[980px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-sm bg-primary font-serif text-lg text-primary-foreground">
            স
          </div>
          <div className="mr-auto">
            <p className="font-serif text-lg leading-tight sm:text-xl">সমর্থক নিবন্ধন কেন্দ্র</p>
            <p className="text-xs text-muted-foreground">তথ্য জমাদান সেবা</p>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">যোগাযোগ: ০১৭০০-০০০০০০</p>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-8">
        <h1 className="text-center font-serif text-2xl sm:text-3xl">সমর্থক ফরম</h1>
        <div className="mx-auto mt-2 h-px w-24 bg-border" />

        {status === "done" ? (
          <p className="mx-auto mt-8 max-w-xl border border-success-border bg-success px-4 py-3 text-center text-sm text-success-foreground">
            আপনার তথ্য সফলভাবে জমা হয়েছে।
          </p>
        ) : null}

        <form
          onSubmit={onSubmit}
          className="mt-7 grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr] md:gap-10"
        >
          <aside className="text-sm leading-7 text-muted-foreground">
            <p>
              এই ফরমের মাধ্যমে যে কেউ নিজের তথ্য জমা দিতে পারেন। নিচের ঘরগুলোতে আপনার নাম, ঠিকানা ও
              যোগাযোগের তথ্য বাংলায় লিখুন।
            </p>
            <p className="mt-3">
              তারকা (<span className="text-required">*</span>) চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে।
              ফোন ও ই-মেইল সঠিকভাবে দিলে প্রয়োজনে আপনার সঙ্গে যোগাযোগ করা সহজ হবে।
            </p>
            <p className="mt-3">
              আপনার দেওয়া তথ্য গোপন রাখা হয় এবং শুধু নিবন্ধনের কাজে ব্যবহার করা হয়। একবার জমা দেওয়ার
              পর অনুগ্রহ করে অপেক্ষা করুন, বারবার বাটনে ক্লিক করার প্রয়োজন নেই।
            </p>
          </aside>

          <div className="space-y-4">
            <Field label="নাম" required value={fields["name"]!} onChange={(v) => set("name", v)} />
            <Field label="ঠিকানা" value={fields["address"]!} onChange={(v) => set("address", v)} />
            <Field
              label="ফোন নম্বর"
              required
              value={fields["phone"]!}
              onChange={(v) => set("phone", v)}
              inputMode="tel"
            />
            <Field
              label="ই-মেইল"
              required
              type="email"
              value={fields["email"]!}
              onChange={(v) => set("email", v)}
            />
            <Field
              label="জাতীয়তা"
              value={fields["nationality"]!}
              onChange={(v) => set("nationality", v)}
            />
            <Field
              label="জন্মতারিখ"
              type="date"
              value={fields["date_of_birth"]!}
              onChange={(v) => set("date_of_birth", v)}
            />
            <Field
              label="মোবাইল নম্বর"
              required
              value={fields["mobile"]!}
              onChange={(v) => set("mobile", v)}
              inputMode="tel"
            />
            <Field
              label="WhatsApp নম্বর"
              value={fields["whatsapp"]!}
              onChange={(v) => set("whatsapp", v)}
              inputMode="tel"
            />
            <div>
              <FieldLabel label="পেশা/পরিচয়" />
              <select
                className="form-control"
                value={fields["profession"]!}
                onChange={(e) => set("profession", e.target.value)}
              >
                <option value="">select</option>
                {professions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="mt-6 border border-border bg-card px-4 pb-4 pt-2">
              <legend className="px-1 font-serif text-base">অতিরিক্ত ঠিকানার তথ্য</legend>
              <div className="space-y-4">
                <Field
                  label="বর্তমান ঠিকানা"
                  value={fields["present_address"]!}
                  onChange={(v) => set("present_address", v)}
                />
                <Field
                  label="স্থায়ী ঠিকানা"
                  value={fields["permanent_address"]!}
                  onChange={(v) => set("permanent_address", v)}
                  disabled={sameAsPrevious}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={sameAsPrevious}
                    onChange={(e) => toggleSame(e.target.checked)}
                  />
                  <span>Same as previous (উপরের ঠিকানার মতো)</span>
                </label>
                <div>
                  <FieldLabel label="বিভাগ" required />
                  <select
                    className="form-control"
                    value={fields["division"]!}
                    onChange={(e) => set("division", e.target.value)}
                    required
                  >
                    <option value="">select</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <div>
              <FieldLabel label="অতিরিক্ত তথ্য" />
              <textarea
                className="form-control min-h-24 py-2"
                value={fields["additional_information"]!}
                onChange={(e) => set("additional_information", e.target.value)}
                maxLength={2000}
              />
            </div>
            <div>
              <FieldLabel label="আপনার মন্তব্য/বার্তা" />
              <textarea
                className="form-control min-h-24 py-2"
                value={fields["message"]!}
                onChange={(e) => set("message", e.target.value)}
                maxLength={2000}
              />
            </div>

            <label className="flex items-start gap-2 pt-2 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>
                আমি উপরের তথ্য সঠিকভাবে প্রদান করেছি এবং ফর্মটি জমা দিতে সম্মত।{" "}
                <span className="text-required">*</span>
              </span>
            </label>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <button
              type="submit"
              disabled={status === "sending" || !consent}
              className="mt-2 h-10 w-[115px] rounded-sm bg-primary text-sm text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "জমা হচ্ছে..." : "জমা দিন"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="mb-1 block text-sm">
      {label} {required ? <span className="text-required">*</span> : null}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  inputMode,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: "tel" | "text";
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        inputMode={inputMode}
        disabled={disabled}
      />
    </label>
  );
}
