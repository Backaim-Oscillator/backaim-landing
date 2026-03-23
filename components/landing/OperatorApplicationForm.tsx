"use client";

import { useMemo, useState } from "react";
import Section from "./Section";
import SectionHeader from "./SectionHeader";
import type React from "react";

type FormState = {
  name: string;
  email: string;
  country: string;
};

function isValidEmail(email: string) {
  // Simple validation suitable for UI-level feedback.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function OperatorApplicationForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    country: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const trimmed = useMemo(
    () => ({
      name: form.name.trim(),
      email: form.email.trim(),
      country: form.country.trim(),
    }),
    [form]
  );

  const fieldErrors = useMemo(() => {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!trimmed.name) errs.name = "Please enter your name.";
    if (!trimmed.email) errs.email = "Please enter your email.";
    if (trimmed.email && !isValidEmail(trimmed.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!trimmed.country) errs.country = "Please enter your country.";

    return errs;
  }, [trimmed]);

  const canSubmit = Object.keys(fieldErrors).length === 0;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) {
      setError("Please fix the highlighted fields and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const formTarget =
        process.env.NEXT_PUBLIC_OPERATOR_FORM_TARGET ?? "/api/operator-apply";

      const res = await fetch(formTarget, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess("Application received. Thank you.");
      setForm({ name: "", email: "", country: "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section id="operator-application" className="scroll-mt-24">
      <SectionHeader title="OPERATOR CTA FORM" />

      <form onSubmit={onSubmit} className="max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-1">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-zinc-900">Name</span>
            <input
              name="name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              type="text"
              autoComplete="name"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              aria-invalid={Boolean(fieldErrors.name)}
              required
            />
            {fieldErrors.name ? (
              <span className="text-sm text-red-600">{fieldErrors.name}</span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-zinc-900">Email</span>
            <input
              name="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              type="email"
              autoComplete="email"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              aria-invalid={Boolean(fieldErrors.email)}
              required
            />
            {fieldErrors.email ? (
              <span className="text-sm text-red-600">{fieldErrors.email}</span>
            ) : null}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-zinc-900">
              Country
            </span>
            <input
              name="country"
              value={form.country}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, country: e.target.value }))
              }
              type="text"
              autoComplete="country-name"
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-zinc-900 shadow-sm outline-none focus:border-zinc-400"
              aria-invalid={Boolean(fieldErrors.country)}
              required
            />
            {fieldErrors.country ? (
              <span className="text-sm text-red-600">
                {fieldErrors.country}
              </span>
            ) : null}
          </label>

        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-7 text-white font-medium transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {submitting ? "Applying..." : "Apply"}
          </button>
          <p className="text-sm text-zinc-600">
            We review operator applications as pilot plans progress.
          </p>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {success ? (
          <div
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        ) : null}
      </form>
    </Section>
  );
}

