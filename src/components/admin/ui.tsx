"use client";

import {
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";

/* ---------- classes ---------- */

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100 disabled:text-slate-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-100";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60",
  small:
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-60",
  smallDanger:
    "inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60",
};

/* ---------- form fields (label, hint and error are wired to the control) ---------- */

type FieldMeta = { label: string; hint?: ReactNode; error?: string; required?: boolean };

function FieldFrame({
  id,
  meta,
  children,
}: {
  id: string;
  meta: FieldMeta;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {meta.label}
        {meta.required && (
          <span className="text-red-600" aria-hidden>
            {" "}*
          </span>
        )}
      </label>
      <div className="mt-1">{children}</div>
      {meta.hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-slate-500">
          {meta.hint}
        </p>
      )}
      {meta.error && (
        <p id={`${id}-err`} className="mt-1 text-xs font-medium text-red-700">
          {meta.error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, meta: FieldMeta) {
  return [meta.hint ? `${id}-hint` : null, meta.error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField({
  label,
  hint,
  error,
  required,
  className = "",
  ...rest
}: FieldMeta & Omit<ComponentProps<"input">, "id">) {
  const id = useId();
  const meta = { label, hint, error, required };
  return (
    <FieldFrame id={id} meta={meta}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, meta)}
        aria-required={required || undefined}
        className={`${inputClass} ${className}`}
        {...rest}
      />
    </FieldFrame>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  className = "",
  ...rest
}: FieldMeta & Omit<ComponentProps<"textarea">, "id">) {
  const id = useId();
  const meta = { label, hint, error, required };
  return (
    <FieldFrame id={id} meta={meta}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, meta)}
        aria-required={required || undefined}
        className={`${inputClass} resize-y leading-relaxed ${className}`}
        {...rest}
      />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  children,
  ...rest
}: FieldMeta & Omit<ComponentProps<"select">, "id">) {
  const id = useId();
  const meta = { label, hint, error, required };
  return (
    <FieldFrame id={id} meta={meta}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, meta)}
        aria-required={required || undefined}
        className={inputClass}
        {...rest}
      >
        {children}
      </select>
    </FieldFrame>
  );
}

/* ---------- badges & banners ---------- */

export function StatusPill({ status }: { status: "draft" | "published" }) {
  return status === "published" ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
      Yayında
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
      Taslak
    </span>
  );
}

export function Pill({
  tone = "slate",
  children,
}: {
  tone?: "slate" | "amber" | "red" | "brand";
  children: ReactNode;
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    brand: "bg-brand-100 text-brand-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Banner({
  tone,
  children,
  live = false,
}: {
  tone: "info" | "success" | "error" | "warn";
  children: ReactNode;
  live?: boolean;
}) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
  };
  return (
    <div
      role={live ? (tone === "error" ? "alert" : "status") : undefined}
      className={`rounded-lg border px-3.5 py-2.5 text-sm leading-relaxed ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

/* ---------- dialogs ---------- */

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Modal with a focus trap: focus moves in on open, Tab cycles inside, Escape
 * and backdrop clicks ask the owner to close (it may refuse while saving or
 * when there are unsaved changes), and focus returns to the opener on close.
 */
export function Dialog({
  labelledBy,
  onRequestClose,
  children,
  size = "lg",
  initialFocus = "first",
  tone = "default",
}: {
  labelledBy: string;
  onRequestClose: () => void;
  children: ReactNode;
  size?: "sm" | "lg";
  initialFocus?: "first" | "panel";
  tone?: "default" | "top";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const requestClose = useRef(onRequestClose);
  requestClose.current = onRequestClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (node) {
      const first = initialFocus === "first" ? node.querySelector<HTMLElement>(FOCUSABLE) : null;
      (first ?? node).focus();
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [initialFocus]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      requestClose.current();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className={`fixed inset-0 flex justify-center bg-slate-900/50 sm:p-4 ${tone === "top" ? "z-[60]" : "z-50"} ${size === "sm" ? "items-center p-4" : "items-stretch sm:items-center"}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose.current();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={
          size === "sm"
            ? "w-full max-w-md rounded-2xl bg-white shadow-xl outline-none"
            : "flex h-dvh w-full flex-col bg-white shadow-xl outline-none sm:h-auto sm:max-h-[92vh] sm:max-w-3xl sm:rounded-2xl"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel = "Vazgeç",
  tone = "danger",
  busy = false,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  return (
    <Dialog labelledBy={id} size="sm" tone="top" onRequestClose={() => !busy && onCancel()}>
      <div className="p-5">
        <h2 id={id} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-2 text-sm leading-relaxed text-slate-600">{children}</div>
        {error && (
          <div className="mt-3">
            <Banner tone="error" live>
              {error}
            </Banner>
          </div>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonClass.secondary} onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === "danger" ? buttonClass.danger : buttonClass.primary}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "İşleniyor…" : confirmLabel}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
