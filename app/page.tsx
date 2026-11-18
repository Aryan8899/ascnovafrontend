"use client";

import { useRef, useState } from "react";
import { Poppins } from "next/font/google";
import PaymentStep from "@/components/PaymentStep";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LOGO_SRC = "https://ascendoratalentsolutions.co.in/header.png";

const OPTIONS = {
  exp: ["Fresher", "0–1 Year", "1–3 Years", "3–5 Years", "5+ Years"],
  notice: ["Immediate Joiner", "15 Days", "30 Days", "45 Days", "60 Days", "90 Days", "Other"],
  domain: [
    "Core Finance & Accounting", "Investment Banking", "Financial Analyst / FP&A",
    "Banking & Financial Services", "Audit & Taxation", "Human Resources",
    "IT & Technology", "Marketing & Digital Marketing", "Operations & Business Support",
    "Real Estate", "BPO / KPO", "Other",
  ],
  source: [
    "LinkedIn Search", "LinkedIn Post", "Mutual Connection",
    "WhatsApp Group / Channel", "Instagram", "Referral", "Other",
  ],
} as const;

// Fixed column layouts so every row lines up (no ragged auto-fill widths)
const COLS = {
  exp: "grid-cols-2 sm:grid-cols-5",
  notice: "grid-cols-2 sm:grid-cols-4",
  domain: "grid-cols-1 sm:grid-cols-2",
  source: "grid-cols-2 sm:grid-cols-4",
} as const;

type FormState = {
  name: string; education: string; exp: string; location: string;
  notice: string; noticeOther: string; domain: string; domainOther: string;
  phone: string; email: string; linkedin: string; source: string; sourceOther: string;
};

const initial: FormState = {
  name: "", education: "", exp: "", location: "", notice: "", noticeOther: "",
  domain: "", domainOther: "", phone: "", email: "", linkedin: "", source: "", sourceOther: "",
};

const MAX_SIZE = 10 * 1024 * 1024;
const NAVY = "#14284f";
const BLUE = "#2563b0";

const cardShadow = "shadow-[0_1px_2px_rgba(15,30,60,.06),0_16px_32px_-14px_rgba(15,30,60,.25)]";
const inputBase =
  "w-full rounded-lg border bg-[#f3f6fb] px-4 py-3 text-[16px] text-slate-900 placeholder:text-slate-400 outline-none shadow-[inset_0_1px_2px_rgba(15,30,60,.06)] transition focus:border-[#2563b0] focus:bg-white focus:ring-4 focus:ring-[#2563b0]/15";

function Check({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

function Icon({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Section({ index, total, title, children }: { index: number; total: number; title: string; children: React.ReactNode }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-300/70 bg-[#f8fafc] ${cardShadow}`}>
      <div className="flex items-center justify-between gap-4 border-b border-slate-300/70 bg-gradient-to-r from-[#e3ebf7] to-[#eef3fa] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="h-5 w-1 rounded-full" style={{ background: BLUE }} />
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ color: NAVY }}>{title}</h2>
        </div>
        <span className="shrink-0 text-xs font-medium text-slate-500">Section {index} of {total}</span>
      </div>
      <div className="divide-y divide-slate-200 px-6 sm:px-8">{children}</div>
    </section>
  );
}

function Question({ n, label, error, children }: { n: number; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="py-6" data-err={error ? 1 : undefined}>
      <div className="mb-3.5 flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[12px] font-semibold tabular-nums text-white" style={{ background: NAVY }}>
          {n}
        </span>
        <h3 className="text-[16px] font-medium leading-snug text-slate-900">
          {label}<span className="ml-1 text-red-600">*</span>
        </h3>
      </div>
      {children}
      {error && <p className="mt-2.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Choices({ name, options, value, onChange, cols }: {
  name: string; options: readonly string[]; value: string; onChange: (v: string) => void; cols: string;
}) {
  return (
    <div className={`grid gap-2.5 ${cols}`}>
      {options.map((o) => {
        const on = value === o;
        return (
          <label key={o}
            className={`flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[14px] transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#2563b0] ${
              on
                ? "border-[#14284f] bg-[#14284f] text-white shadow-[0_4px_10px_-2px_rgba(20,40,79,.45)]"
                : "border-slate-300 bg-[#f3f6fb] text-slate-700 hover:border-[#2563b0] hover:bg-white"
            }`}>
            <input type="radio" name={name} value={o} checked={on} onChange={() => onChange(o)} className="sr-only" />
            <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
              on ? "border-white bg-white text-[#14284f]" : "border-slate-400 bg-white"
            }`}>
              {on && <Check />}
            </span>
            <span className="leading-tight">{o}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function Page() {
  const [f, setF] = useState<FormState>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "pay">("form");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const pickFile = (fl?: File | null) => {
    if (!fl) return;
    const ok = /\.(pdf|docx?)$/i.test(fl.name) && fl.size <= MAX_SIZE;
    if (ok) { setFile(fl); setErrors((p) => ({ ...p, file: "" })); }
    else { setFile(null); setErrors((p) => ({ ...p, file: "Please upload a PDF or DOC/DOCX file up to 10 MB." })); }
  };

  const answered = [
    f.name.trim(), f.education.trim(), f.exp, f.location.trim(), f.notice, f.domain,
    f.phone.trim(), f.email.trim(), f.linkedin.trim(), f.source, file,
  ].filter(Boolean).length;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Please enter your full name.";
    if (!f.education.trim()) e.education = "Please enter your qualification.";
    if (!f.exp) e.exp = "Please select one option.";
    if (!f.location.trim()) e.location = "Please enter your city and state.";
    if (!f.notice) e.notice = "Please select one option.";
    else if (f.notice === "Other" && !f.noticeOther.trim()) e.notice = "Please specify your notice period.";
    if (!f.domain) e.domain = "Please select one option.";
    else if (f.domain === "Other" && !f.domainOther.trim()) e.domain = "Please specify the domain.";
    if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid contact number.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (!/^https?:\/\/([\w-]+\.)?linkedin\.com\/.+/i.test(f.linkedin.trim())) e.linkedin = "Enter a valid LinkedIn URL.";
    if (!f.source) e.source = "Please select one option.";
    else if (f.source === "Other" && !f.sourceOther.trim()) e.source = "Please specify the source.";
    if (!file) e.file = "Please upload a PDF or DOC/DOCX file up to 10 MB.";
    return e;
  };

  // Ab yahan API call nahi hoti: sirf validate karke payment step kholte hain.
  // Asli submit PaymentStep ke andar hota hai (UTR + screenshot ke saath).
  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector("[data-err='1']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStep("pay");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bd = (k: string) => (errors[k] ? "border-red-500" : "border-slate-300");
  const pct = (answered / 11) * 100;

  return (
    <div className={`${poppins.className} min-h-screen bg-[#e3e9f2] text-slate-800`}>
      {/* contact strip */}
      <div className="text-[13px] text-white/90" style={{ background: "#0b1830" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-1 px-6 py-2">
          <a href="mailto:info@ascendoratalentsolutions.co.in" className="inline-flex items-center gap-2 hover:text-white">
            <Icon className="h-3.5 w-3.5 text-[#8fb8f2]" d="M4 6h16v12H4zM4 7l8 6 8-6" />
            info@ascendoratalentsolutions.co.in
          </a>
          <a href="tel:+919296273325" className="inline-flex items-center gap-2 hover:text-white">
            <Icon className="h-3.5 w-3.5 text-[#8fb8f2]" d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
            +91 92962 73325
          </a>
        </div>
      </div>

      {/* header: white, raised, with a brand accent line */}
      <header className="relative z-20 bg-white shadow-[0_6px_20px_-8px_rgba(15,30,60,.25)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Ascendora Talent Solutions" className="-ml-2 h-[72px] w-auto" />
          <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-[#f3f6fb] px-4 py-1.5 text-[13px] font-medium sm:inline-flex" style={{ color: NAVY }}>
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Registrations open
          </span>
        </div>
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE} 55%, #8fb8f2)` }} />
      </header>

      {/* hero band */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0e1d3b 0%, ${NAVY} 50%, #1d4283 100%)` }}>
        {/* soft glow + dotted texture so the band isn't flat */}
        <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-[#2563b0]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-[260px] w-[260px] rounded-full bg-[#8fb8f2]/15 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(to left, #000, transparent 65%)", WebkitMaskImage: "linear-gradient(to left, #000, transparent 65%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-12">
          <div className="flex items-center gap-3 text-sm font-medium text-[#8fb8f2]">
            <span className="h-px w-6 bg-[#8fb8f2]" /> Talent acquisition
          </div>
          <h1 className="mt-4 text-[34px] font-semibold leading-[1.15] tracking-tight text-white sm:text-[44px]">
            Candidate registration
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Thank you for your interest in connecting with Ascendora Talent Solutions. Share your details accurately so
            our team can understand your background, career preferences and suitable opportunities.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-[13px] text-white/90">
            {[
              ["M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z", "About 3 minutes"],
              ["M9 12h6M9 16h6M7 3h7l5 5v13H7z", "11 short questions"],
              ["M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3", "PDF or DOC resume"],
            ].map(([d, t]) => (
              <span key={t} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">
                <Icon className="h-4 w-4 text-[#8fb8f2]" d={d} /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-16 grid max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* left: progress card */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className={`rounded-2xl border border-slate-300/70 bg-[#f8fafc] p-6 ${cardShadow}`}>
            <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Your progress</div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tabular-nums" style={{ color: NAVY }}>{answered}</span>
              <span className="text-slate-500">of 11 answered</span>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BLUE}, #5b95dc)` }} />
            </div>

            <ol className="relative mt-7 space-y-6 text-[14px] leading-snug text-slate-600">
              <span className="absolute bottom-6 left-3 top-6 w-px bg-slate-300" aria-hidden />
              {[
                ["Share your details", "Takes about 3 minutes."],
                ["Pay the registration fee", "Pay by UPI and add the UTR number."],
                ["We verify and confirm", "You see the result here and by email."],
              ].map(([t, d], i) => {
                const current = step === "pay" ? i === 1 : i === 0;
                const done = step === "pay" && i === 0;
                return (
                  <li key={t} className="relative flex gap-3">
                    <span
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-4 ring-[#f8fafc] ${
                        done || current ? "text-white" : "bg-[#dbe6f5]"
                      }`}
                      style={done || current ? { background: NAVY } : { color: NAVY }}
                    >
                      {done ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <div><b className="block font-medium text-slate-900">{t}</b>{d}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        {/* right: form or payment */}
        <main>
          {step === "pay" && file ? (
            <PaymentStep form={f} resume={file} onBack={() => setStep("form")} />
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <Section index={1} total={3} title="Personal & Professional Information">
                <Question n={1} label="Full Name" error={errors.name}>
                  <input className={`${inputBase} ${bd("name")}`} autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
                </Question>
                <Question n={2} label="Highest Educational Qualification" error={errors.education}>
                  <input className={`${inputBase} ${bd("education")}`} value={f.education} onChange={(e) => set("education", e.target.value)} />
                </Question>
                <Question n={3} label="Total Work Experience" error={errors.exp}>
                  <Choices name="exp" options={OPTIONS.exp} value={f.exp} onChange={(v) => set("exp", v)} cols={COLS.exp} />
                </Question>
                <Question n={4} label="Current Location (City & State)" error={errors.location}>
                  <input className={`${inputBase} ${bd("location")}`} value={f.location} onChange={(e) => set("location", e.target.value)} />
                </Question>
                <Question n={5} label="Notice Period" error={errors.notice}>
                  <Choices name="notice" options={OPTIONS.notice} value={f.notice} onChange={(v) => set("notice", v)} cols={COLS.notice} />
                  {f.notice === "Other" && (
                    <input className={`${inputBase} ${bd("notice")} mt-3`} placeholder="Please specify" value={f.noticeOther} onChange={(e) => set("noticeOther", e.target.value)} />
                  )}
                </Question>
              </Section>

              <Section index={2} total={3} title="Career Preferences">
                <Question n={6} label="Which Domain Are You Currently Looking For?" error={errors.domain}>
                  <Choices name="domain" options={OPTIONS.domain} value={f.domain} onChange={(v) => set("domain", v)} cols={COLS.domain} />
                  {f.domain === "Other" && (
                    <input className={`${inputBase} ${bd("domain")} mt-3`} placeholder="Please specify" value={f.domainOther} onChange={(e) => set("domainOther", e.target.value)} />
                  )}
                </Question>
              </Section>

              <Section index={3} total={3} title="Contact & Professional Profile">
                <Question n={7} label="Contact Number" error={errors.phone}>
                  <input type="tel" autoComplete="tel" placeholder="+91" className={`${inputBase} ${bd("phone")}`} value={f.phone} onChange={(e) => set("phone", e.target.value)} />
                </Question>
                <Question n={8} label="Professional Email Address" error={errors.email}>
                  <input type="email" autoComplete="email" className={`${inputBase} ${bd("email")}`} value={f.email} onChange={(e) => set("email", e.target.value)} />
                </Question>
                <Question n={9} label="LinkedIn Profile URL" error={errors.linkedin}>
                  <input type="url" placeholder="https://www.linkedin.com/in/…" className={`${inputBase} ${bd("linkedin")}`} value={f.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
                </Question>
                <Question n={10} label="How Did You Find My LinkedIn Profile?" error={errors.source}>
                  <Choices name="source" options={OPTIONS.source} value={f.source} onChange={(v) => set("source", v)} cols={COLS.source} />
                  {f.source === "Other" && (
                    <input className={`${inputBase} ${bd("source")} mt-3`} placeholder="Please specify" value={f.sourceOther} onChange={(e) => set("sourceOther", e.target.value)} />
                  )}
                </Question>
                <Question n={11} label="Upload Your Latest Resume / CV" error={errors.file}>
                  <div
                    role="button" tabIndex={0}
                    onClick={() => fileRef.current?.click()}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
                    className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-5 transition focus-visible:outline-2 focus-visible:outline-[#2563b0] ${
                      dragOver ? "border-[#2563b0] bg-[#e4edf9]" : errors.file ? "border-red-500 bg-[#f3f6fb]" : "border-slate-400 bg-[#f3f6fb] hover:border-[#14284f] hover:bg-white"
                    }`}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dbe6f5]">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                      </svg>
                    </span>
                    <div className="text-[15px]">
                      {file ? (
                        <span className="font-medium text-slate-900">{file.name}</span>
                      ) : (
                        <><span className="font-medium" style={{ color: BLUE }}>Choose a file</span> or drag it here</>
                      )}
                      <div className="text-[13px] text-slate-500">PDF or DOC/DOCX · up to 10 MB</div>
                    </div>
                  </div>
                </Question>
              </Section>

              <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-300/70 bg-[#f8fafc] px-6 py-5 sm:px-8 ${cardShadow}`}>
                <p className="text-[13px] text-slate-500"><span className="text-red-600">*</span> All fields are required</p>
                <button
                  type="submit"
                  className="inline-flex items-center gap-3 rounded-lg px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_14px_-4px_rgba(20,40,79,.55)] transition hover:bg-[#2563b0]"
                  style={{ background: NAVY }}
                >
                  Continue to payment
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>

      <footer className="border-t border-slate-300 py-6 text-center text-[13px] text-slate-500">
        © Ascendora Talent Solutions
      </footer>
    </div>
  );
}