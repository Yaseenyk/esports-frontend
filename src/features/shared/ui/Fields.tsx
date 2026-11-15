import { helper, input, label } from "@/features/shared/ui/styles";

/** Label above, helper below, error in danger with a mark: the form pattern from DESIGN_SYSTEM.md. */
export function Field({ id, label: text, help, error, children }: { id: string; label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{text}</label>
      {children}
      {help && <p id={`${id}-help`} className={helper}>{help}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-danger"><span aria-hidden="true">! </span>{error}</p>}
    </div>
  );
}

export const describedBy = (id: string, help?: string, error?: string): string | undefined => [help ? `${id}-help` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

export function TextInput({ id, value, onChange, help, error, label: text, type = "text", maxLength, inputMode, autoComplete, disabled }: { disabled?: boolean; id: string; value: string; onChange: (v: string) => void; label: string; help?: string; error?: string; type?: string; maxLength?: number; inputMode?: "numeric" | "text"; autoComplete?: string }) {
  return (
    <Field id={id} label={text} help={help} error={error}>
      <input id={id} type={type} value={value} maxLength={maxLength} inputMode={inputMode} autoComplete={autoComplete} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, help, error)} className={input} />
    </Field>
  );
}

export function TextArea({ id, value, onChange, help, error, label: text, rows = 5, max }: { id: string; value: string; onChange: (v: string) => void; label: string; help?: string; error?: string; rows?: number; max?: number }) {
  return (
    <Field id={id} label={text} help={help} error={error}>
      <textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, help, error)} className={`${input} py-2`} />
      {max && <p className="mt-1 text-right text-xs text-zinc-400" aria-live="off"><span className="font-mono tabular-nums">{Array.from(value).length}</span> / {max}</p>}
    </Field>
  );
}

export function SelectInput({ id, value, onChange, options, label: text, help, error, blank }: { id: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string; help?: string; error?: string; blank?: string }) {
  return (
    <Field id={id} label={text} help={help} error={error}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, help, error)} className={input}>
        {blank !== undefined && <option value="">{blank}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}
