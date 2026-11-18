"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import {
    API_URL, REGISTRATION_FEE, UPI_ID, PAYEE_NAME, STATUS_TOKEN_KEY, upiLink,
} from "@/lib/config";

const NAVY = "#14284f";
const BLUE = "#2563b0";
const MAX_SHOT = 5 * 1024 * 1024;

const cardShadow = "shadow-[0_1px_2px_rgba(15,30,60,.06),0_16px_32px_-14px_rgba(15,30,60,.25)]";
const inputBase =
    "w-full rounded-lg border bg-[#f3f6fb] px-4 py-3 text-[16px] text-slate-900 placeholder:text-slate-400 outline-none shadow-[inset_0_1px_2px_rgba(15,30,60,.06)] transition focus:border-[#2563b0] focus:bg-white focus:ring-4 focus:ring-[#2563b0]/15";

type Props = {
    form: Record<string, string>; // FormState from page.tsx
    resume: File;
    onBack: () => void;
};

export default function PaymentStep({ form, resume, onBack }: Props) {
    const router = useRouter();
    const [utr, setUtr] = useState("");
    const [shot, setShot] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const shotRef = useRef<HTMLInputElement>(null);

    const pickShot = (fl?: File | null) => {
        if (!fl) return;
        if (!/^image\/(png|jpe?g|webp)$/i.test(fl.type) || fl.size > MAX_SHOT) {
            setShot(null);
            setPreview(null);
            setErrors((p) => ({ ...p, shot: "Upload a PNG, JPG or WEBP image up to 5 MB." }));
            return;
        }
        setShot(fl);
        setPreview(URL.createObjectURL(fl));
        setErrors((p) => ({ ...p, shot: "" }));
    };

    const copyUpi = async () => {
        try {
            await navigator.clipboard.writeText(UPI_ID);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch { /* clipboard blocked: user can copy by hand */ }
    };

    const submit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const e: Record<string, string> = {};
        if (!/^\d{12}$/.test(utr.trim())) e.utr = "Enter the 12-digit UTR / transaction ID from your payment app.";
        if (!shot) e.shot = "Upload a screenshot of the successful payment.";
        setErrors(e);
        setServerError("");
        if (Object.keys(e).length) return;

        setLoading(true);
        try {
            const fd = new FormData();
            // "Other" wali values ko final value bana ke bhejo
            const { noticeOther, domainOther, sourceOther, ...rest } = form;
            const clean: Record<string, string> = {
                ...rest,
                notice: form.notice === "Other" ? noticeOther : form.notice,
                domain: form.domain === "Other" ? domainOther : form.domain,
                source: form.source === "Other" ? sourceOther : form.source,
            };
            Object.entries(clean).forEach(([k, v]) => fd.append(k, v));
            fd.append("utr", utr.trim());
            fd.append("resume", resume);
            fd.append("paymentScreenshot", shot as File);

            const res = await fetch(`${API_URL}/api/candidates`, { method: "POST", body: fd });
            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data.ok) {
                setServerError(
                    res.status === 409
                        ? "This UTR has already been used. Check the number and try again."
                        : data.error || "Something went wrong. Please try again."
                );
                return;
            }
            // Backend ko { ok: true, token } return karna hoga
            localStorage.setItem(STATUS_TOKEN_KEY, data.token);
            router.push(`/status/${data.token}`);
        } catch {
            setServerError("Could not reach the server. Check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            {/* Step 1: pay */}
            <section className={`overflow-hidden rounded-2xl border border-slate-300/70 bg-[#f8fafc] ${cardShadow}`}>
                <div className="flex items-center justify-between gap-4 border-b border-slate-300/70 bg-gradient-to-r from-[#e3ebf7] to-[#eef3fa] px-6 py-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <span className="h-5 w-1 rounded-full" style={{ background: BLUE }} />
                        <h2 className="text-[16px] font-semibold" style={{ color: NAVY }}>Pay the registration fee</h2>
                    </div>
                    <button type="button" onClick={onBack} className="text-sm font-medium hover:underline" style={{ color: BLUE }}>
                        Edit details
                    </button>
                </div>

                <div className="grid gap-8 px-6 py-7 sm:px-8 md:grid-cols-[auto_1fr]">
                    <div className="mx-auto flex flex-col items-center gap-3">
                        <div className="rounded-xl border border-slate-300 bg-white p-3">
                            <QRCodeSVG value={upiLink()} size={168} fgColor={NAVY} />
                        </div>
                        <span className="text-[13px] text-slate-500">Scan with any UPI app</span>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <div className="text-sm text-slate-500">Amount</div>
                            <div className="text-4xl font-semibold tabular-nums" style={{ color: NAVY }}>₹{REGISTRATION_FEE}</div>
                        </div>

                        <div>
                            <div className="text-sm text-slate-500">Pay to {PAYEE_NAME}</div>
                            <div className="mt-1 flex items-center gap-3">
                                <code className="rounded-md bg-[#e4edf9] px-3 py-1.5 text-[15px] font-medium" style={{ color: NAVY }}>{UPI_ID}</code>
                                <button type="button" onClick={copyUpi} className="text-sm font-medium hover:underline" style={{ color: BLUE }}>
                                    {copied ? "Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        {/* mobile pe GPay / koi bhi UPI app khulega */}
                        <a
                            href={upiLink()}
                            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-[15px] font-semibold text-white shadow-[0_6px_14px_-4px_rgba(20,40,79,.55)] transition hover:bg-[#2563b0] md:hidden"
                            style={{ background: NAVY }}
                        >
                            Pay ₹{REGISTRATION_FEE} with GPay
                        </a>
                        <p className="text-[13px] leading-relaxed text-slate-500">
                            On a phone, the button opens your UPI app. On a computer, scan the QR code with your phone.
                            After paying, come back here and enter the payment details below.
                        </p>
                    </div>
                </div>
            </section>

            {/* Step 2: proof */}
            <section className={`overflow-hidden rounded-2xl border border-slate-300/70 bg-[#f8fafc] ${cardShadow}`}>
                <div className="flex items-center gap-3 border-b border-slate-300/70 bg-gradient-to-r from-[#e3ebf7] to-[#eef3fa] px-6 py-4 sm:px-8">
                    <span className="h-5 w-1 rounded-full" style={{ background: BLUE }} />
                    <h2 className="text-[16px] font-semibold" style={{ color: NAVY }}>Confirm your payment</h2>
                </div>

                <div className="divide-y divide-slate-200 px-6 sm:px-8">
                    <div className="py-6" data-err={errors.utr ? 1 : undefined}>
                        <label htmlFor="utr" className="mb-3 block text-[16px] font-medium text-slate-900">
                            UTR / Transaction ID<span className="ml-1 text-red-600">*</span>
                        </label>
                        <input
                            id="utr" inputMode="numeric" maxLength={12} placeholder="12-digit number"
                            className={`${inputBase} ${errors.utr ? "border-red-500" : "border-slate-300"} tracking-wider`}
                            value={utr}
                            onChange={(e) => { setUtr(e.target.value.replace(/\D/g, "")); setErrors((p) => ({ ...p, utr: "" })); }}
                        />
                        <p className="mt-2 text-[13px] text-slate-500">
                            Find it in your payment app under the transaction details. In GPay it is called “UPI transaction ID”.
                        </p>
                        {errors.utr && <p className="mt-2 text-sm text-red-600">{errors.utr}</p>}
                    </div>

                    <div className="py-6" data-err={errors.shot ? 1 : undefined}>
                        <div className="mb-3 text-[16px] font-medium text-slate-900">
                            Payment screenshot<span className="ml-1 text-red-600">*</span>
                        </div>
                        <div
                            role="button" tabIndex={0}
                            onClick={() => shotRef.current?.click()}
                            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && shotRef.current?.click()}
                            className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed p-5 transition focus-visible:outline-2 focus-visible:outline-[#2563b0] ${errors.shot ? "border-red-500 bg-[#f3f6fb]" : "border-slate-400 bg-[#f3f6fb] hover:border-[#14284f] hover:bg-white"
                                }`}
                        >
                            <input ref={shotRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pickShot(e.target.files?.[0])} />
                            {preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={preview} alt="Payment screenshot preview" className="h-20 w-20 shrink-0 rounded-md border border-slate-300 object-cover" />
                            ) : (
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dbe6f5]">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke={NAVY} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                                    </svg>
                                </span>
                            )}
                            <div className="text-[15px]">
                                {shot ? (
                                    <span className="font-medium text-slate-900">{shot.name}</span>
                                ) : (
                                    <span className="font-medium" style={{ color: BLUE }}>Choose a screenshot</span>
                                )}
                                <div className="text-[13px] text-slate-500">PNG, JPG or WEBP, up to 5 MB</div>
                            </div>
                        </div>
                        {errors.shot && <p className="mt-2.5 text-sm text-red-600">{errors.shot}</p>}
                    </div>
                </div>
            </section>

            <div className={`rounded-2xl border border-slate-300/70 bg-[#f8fafc] px-6 py-5 sm:px-8 ${cardShadow}`}>
                {serverError && (
                    <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="max-w-sm text-[13px] text-slate-500">
                        We check every payment against our bank record before your registration is confirmed.
                    </p>
                    <button
                        type="submit" disabled={loading}
                        className="inline-flex items-center gap-3 rounded-lg px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_6px_14px_-4px_rgba(20,40,79,.55)] transition hover:bg-[#2563b0] disabled:opacity-60"
                        style={{ background: NAVY }}
                    >
                        {loading ? "Sending…" : "Send for verification"}
                    </button>
                </div>
            </div>
        </form>
    );
}