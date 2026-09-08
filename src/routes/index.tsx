import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  createSubmission,
  submissionSchema,
  THANA_OPTIONS,
  DISTRICT_OPTIONS,
} from "@/lib/submissions.functions";

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

const religions = ["ইসলাম", "হিন্দু", "বৌদ্ধ", "খ্রিস্টান", "অন্যান্য"];

const initial = {
  name: "",
  father_name: "",
  institution: "",
  class_level: "",
  subject: "",
  religion: "",
  mobile: "",
  whatsapp: "",
  email: "",
  facebook: "",
  present_address: "",
  present_area: "",
  present_thana: "",
  present_district: "",
  permanent_area: "",
  permanent_thana: "",
  permanent_district: "",
  reason: "",
  participated_before: "",
  join_org: "",
};

type Fields = typeof initial;
type FieldKey = keyof Fields;
type Errors = Partial<Record<FieldKey, string>>;

function SupporterForm() {
  const submit = useServerFn(createSubmission);
  const [fields, setFields] = useState<Fields>(initial);
  const [sameAsPrevious, setSameAsPrevious] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: FieldKey, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      if (sameAsPrevious) {
        if (key === "present_area") next.permanent_area = value;
        if (key === "present_thana") next.permanent_thana = value;
        if (key === "present_district") next.permanent_district = value;
      }
      return next;
    });
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const toggleSame = (checked: boolean) => {
    setSameAsPrevious(checked);
    if (checked) {
      setFields((prev) => ({
        ...prev,
        permanent_area: prev.present_area,
        permanent_thana: prev.present_thana,
        permanent_district: prev.present_district,
      }));
    }
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    setSubmitError(null);
    const parsed = submissionSchema.safeParse(fields);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && key in initial && !next[key as FieldKey]) {
          next[key as FieldKey] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      await submit({ data: fields });
      setStatus("done");
      setFields(initial);
      setSameAsPrevious(false);
    } catch {
      setStatus("idle");
      setSubmitError("দুঃখিত, তথ্য জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
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

      <main className="mx-auto w-full max-w-[720px] px-4 pb-16 pt-8">
        <h1 className="text-center font-serif text-2xl sm:text-3xl">সমর্থক ফরম</h1>
        <div className="mx-auto mt-2 h-px w-24 bg-border" />

        {status === "done" ? (
          <p className="mt-8 border border-success-border bg-success px-4 py-3 text-center text-sm text-success-foreground">
            আপনার তথ্য সফলভাবে জমা হয়েছে।
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              label="নাম"
              required
              value={fields.name}
              onChange={(v) => set("name", v)}
              error={errors.name}
            />
            <Field
              label="পিতার নাম"
              value={fields.father_name}
              onChange={(v) => set("father_name", v)}
              error={errors.father_name}
            />
            <Field
              label="শিক্ষা প্রতিষ্ঠান"
              required
              value={fields.institution}
              onChange={(v) => set("institution", v)}
              error={errors.institution}
            />
            <Field
              label="ক্লাস/শ্রেণি/বর্ষ"
              required
              value={fields.class_level}
              onChange={(v) => set("class_level", v)}
              error={errors.class_level}
            />
            <Field
              label="বিষয়/বিভাগ"
              required
              value={fields.subject}
              onChange={(v) => set("subject", v)}
              error={errors.subject}
            />
            <SelectField
              label="ধর্ম"
              value={fields.religion}
              onChange={(v) => set("religion", v)}
              options={religions}
              placeholder="নির্বাচন করুন"
              error={errors.religion}
            />
            <Field
              label="মোবাইল নম্বর"
              required
              value={fields.mobile}
              onChange={(v) => set("mobile", v)}
              inputMode="tel"
              error={errors.mobile}
            />
            <Field
              label="মোবাইল নম্বর (WhatsApp)"
              value={fields.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              inputMode="tel"
              error={errors.whatsapp}
            />
            <Field
              label="ইমেইল এড্রেস"
              type="email"
              value={fields.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
            />
            <Field
              label="ফেসবুক আইডি"
              value={fields.facebook}
              onChange={(v) => set("facebook", v)}
              error={errors.facebook}
            />

            <div className="md:col-span-2">
              <TextareaField
                label="বর্তমান ঠিকানা"
                required
                value={fields.present_address}
                onChange={(v) => set("present_address", v)}
                error={errors.present_address}
              />
            </div>
            <Field
              label="পাড়া/মহল্লা"
              required
              value={fields.present_area}
              onChange={(v) => set("present_area", v)}
              error={errors.present_area}
            />
            <SelectField
              label="থানা/উপজেলা"
              required
              value={fields.present_thana}
              onChange={(v) => set("present_thana", v)}
              options={[...THANA_OPTIONS]}
              placeholder="থানা/উপজেলা নির্বাচন করুন"
              error={errors.present_thana}
            />
            <SelectField
              label="জেলা"
              required
              value={fields.present_district}
              onChange={(v) => set("present_district", v)}
              options={[...DISTRICT_OPTIONS]}
              placeholder="জেলা নির্বাচন করুন"
              error={errors.present_district}
            />

            <fieldset className="mt-2 border border-border bg-card px-4 pb-4 pt-2 md:col-span-2">
              <legend className="px-1 font-serif text-base">স্থায়ী ঠিকানা</legend>
              <label className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={sameAsPrevious}
                  onChange={(e) => toggleSame(e.target.checked)}
                />
                <span>Same as previous</span>
              </label>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="পাড়া/মহল্লা"
                  value={fields.permanent_area}
                  onChange={(v) => set("permanent_area", v)}
                  disabled={sameAsPrevious}
                  error={errors.permanent_area}
                />
                <SelectField
                  label="থানা/উপজেলা"
                  value={fields.permanent_thana}
                  onChange={(v) => set("permanent_thana", v)}
                  options={[...THANA_OPTIONS]}
                  placeholder="থানা/উপজেলা নির্বাচন করুন"
                  disabled={sameAsPrevious}
                  error={errors.permanent_thana}
                />
                <SelectField
                  label="জেলা"
                  value={fields.permanent_district}
                  onChange={(v) => set("permanent_district", v)}
                  options={[...DISTRICT_OPTIONS]}
                  placeholder="জেলা নির্বাচন করুন"
                  disabled={sameAsPrevious}
                  error={errors.permanent_district}
                />
              </div>
            </fieldset>

            <div className="md:col-span-2">
              <TextareaField
                label="কেন এই কার্যক্রমে যুক্ত হতে চান?"
                value={fields.reason}
                onChange={(v) => set("reason", v)}
                error={errors.reason}
              />
            </div>
            <SelectField
              label="পূর্বে কখনো এই কার্যক্রমে যুক্ত হয়েছিলেন কিনা?"
              value={fields.participated_before}
              onChange={(v) => set("participated_before", v)}
              options={["হ্যাঁ", "না"]}
              placeholder="select"
              error={errors.participated_before}
            />
            <SelectField
              label="সরাসরি সংগঠনে যুক্ত হতে চান কিনা?"
              value={fields.join_org}
              onChange={(v) => set("join_org", v)}
              options={["হ্যাঁ", "না"]}
              placeholder="select"
              error={errors.join_org}
            />

            <div className="space-y-2 pt-2 text-sm leading-6 text-muted-foreground md:col-span-2">
              <p>
                নাম, শিক্ষা প্রতিষ্ঠান, ক্লাস/শ্রেণি/বর্ষ, বিষয়/বিভাগ, মোবাইল নম্বর, বর্তমান
                ঠিকানা অবশ্যই লিখতে হবে।
              </p>
              <p>বি.দ্র: আপনার দেওয়া সকল তথ্য নিরাপদ থাকবে ইনশাআল্লাহ।</p>
            </div>

            {submitError ? (
              <p className="text-sm text-destructive md:col-span-2">{submitError}</p>
            ) : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-10 w-[115px] rounded-sm bg-primary text-sm text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "জমা হচ্ছে..." : "জমা দিন"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean | undefined }) {
  return (
    <span className="mb-1 block text-sm">
      {label} {required ? <span className="text-required">*</span> : null}
    </span>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-xs text-destructive">{children}</span>;
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  inputMode,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean | undefined;
  type?: string | undefined;
  inputMode?: "tel" | "text" | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean | undefined;
  error?: string | undefined;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <textarea
        className="form-control min-h-24 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        aria-invalid={error ? true : undefined}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  error?: string | undefined;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} required={required} />
      <select
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </label>
  );
}
