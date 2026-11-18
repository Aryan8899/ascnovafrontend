"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { API_URL, STATUS_TOKEN_KEY } from "@/lib/config";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const LOGO_SRC = "https://ascendoratalentsolutions.co.in/header.png";
const NAVY = "#14284f";
const BLUE = "#2563b0";
const POLL_MS = 10_000;

const cardShadow = "shadow-[0_1px_2px_rgba(15,30,60,.06),0_16px_32px_-14px_rgba(15,30,60,.25)]";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type StatusData = { status: Status; reason?: string; ref?: string };

export default function StatusPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/candidates/status/${token}`, { cache: "no-store" });
        if (res.status === 404) {
          setError("We could not find this registration. Check the link from your email.");
          return;
        }
        const d: StatusData = await res.json();
        if (stopped) return;
        setData(d);
        setError("");
        // Sirf PENDING pe polling chalti rahe
        if (d.status === "PENDING") timer = setTimeout(load, POLL_MS);
      } catch {
        if (stopped) return;
        setError("Connection problem. Retrying…");
        timer = setTimeout(load, POLL_MS);
      }
    };

    load();
    return () => { stopped = true; clearTimeout(timer); };
  }, [token]);

  const retry = () => {
    try { localStorage.removeItem(STATUS_TOKEN_KEY); } catch { /* ignore */ }
  };

  return (
    <div className={`${poppins.className} min-h-screen bg-[#e3e9f2] text-slate-800`}>
      <header className="bg-white shadow-[0_6px_20px_-8px_rgba(15,30,60,.25)]">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_SRC} alt="Ascendora Talent Solutions" className="-ml-2 h-[72px] w-auto" />
        </div>
        <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${NAVY}, ${BLUE} 55%, #8fb8f2)` }} />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className={`rounded-2xl border border-slate-300/70 bg-[#f8fafc] p-8 sm:p-10 ${cardShadow}`} aria-live="polite">
          {!data && !error && <p className="text-slate-600">Loading your status…</p>}

          {!data && error && <p className="text-red-600">{error}</p>}

          {data?.status === "PENDING" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#dbe6f5]">
                <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin [animation-duration:3s] motion-reduce:animate-none" fill="none" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold" style={{ color: NAVY }}>Payment under verification</h1>
              <p className="mt-2 max-w-md text-slate-600">
                We received your details and are checking your payment. This page updates on its own, so you can keep it open.
                We will also email you the result.
              </p>
            </>
          )}

          {data?.status === "APPROVED" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ background: NAVY }}>
                <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
              </div>
              <h1 className="text-2xl font-semibold" style={{ color: NAVY }}>Form submitted</h1>
              <p className="mt-2 max-w-md text-slate-600">
                Your payment is verified and your registration is confirmed. Our team will reach out when a suitable role comes up.
              </p>
            </>
          )}

          {data?.status === "REJECTED" && (
            <>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                <svg viewBox="0 0 16 16" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
              </div>
              <h1 className="text-2xl font-semibold text-red-700">Payment could not be verified</h1>
              <p className="mt-2 max-w-md text-slate-600">
                {data.reason || "We could not match your payment with our records."} Please register again with the correct payment details.
              </p>
              <Link
                href="/" onClick={retry}
                className="mt-6 inline-flex rounded-lg px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#2563b0]"
                style={{ background: NAVY }}
              >
                Register again
              </Link>
            </>
          )}

          {data?.ref && <p className="mt-8 text-[13px] text-slate-500">Reference: {data.ref}</p>}
          {data && error && <p className="mt-4 text-[13px] text-slate-500">{error}</p>}
        </div>
      </main>
    </div>
  );
}