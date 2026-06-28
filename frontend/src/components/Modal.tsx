import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-theme-background/80 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-2xl border border-theme-border bg-theme-surface shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-theme-border px-5 py-4">
          <h2 className="text-lg font-semibold text-theme-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-theme-text-muted hover:bg-theme-surface-raised hover:text-theme-text"
            aria-label={`Close ${title}`}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
