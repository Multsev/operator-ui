import { forwardRef, type TextareaHTMLAttributes } from "react";

export const PlainTextEditor = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    onAutosave?: (value: string) => void;
  }
>(function PlainTextEditor(
  { className = "", onAutosave, onBlur, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={`ou-plain-text ${className}`}
      spellCheck={false}
      onBlur={(event) => {
        onBlur?.(event);
        onAutosave?.(event.currentTarget.value);
      }}
      {...props}
    />
  );
});

export function PlainTextViewer({
  value,
  label = "Plain text",
}: {
  value: string;
  label?: string;
}) {
  return (
    <pre
      className="ou-plain-text ou-plain-text--viewer"
      tabIndex={0}
      aria-label={label}
    >
      {value}
    </pre>
  );
}
