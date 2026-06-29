import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

const ACCESS_PASSWORD = "Diego30112005";
const ACCESS_KEY = "organidm.access-granted";
const LEGACY_ACCESS_KEY = `${["personal", "manager"].join("-")}.access-granted`;

type AccessGateProps = {
  children: ReactNode;
};

export function AccessGate({ children }: AccessGateProps) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(ACCESS_KEY) === "true" || sessionStorage.getItem(LEGACY_ACCESS_KEY) === "true",
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, "true");
      setUnlocked(true);
      return;
    }

    setError("Incorrect password");
    setPassword("");
  }

  if (unlocked) {
    return children;
  }

  return (
    <main className="min-h-screen bg-theme-background text-theme-text">
      <div className="grid min-h-screen place-items-center px-4 py-8">
        <section className="w-full max-w-md overflow-hidden rounded-2xl border border-theme-border bg-theme-surface shadow-card">
          <div className="border-b border-theme-border bg-theme-surface-muted px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-theme-border-strong bg-theme-accent-muted text-theme-accent-strong">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h1 className="text-xl font-semibold tracking-normal">OrganiDM</h1>
                <p className="text-sm text-theme-text-muted">Private access required.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 p-6">
            <label className="grid gap-2 text-sm font-medium text-theme-text-muted">
              Password
              <div className="flex items-center gap-2 rounded-xl border border-theme-border bg-theme-background px-3 py-2 transition focus-within:border-theme-border-strong">
                <LockKeyhole size={18} className="text-theme-text-dim" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  autoFocus
                  className="min-w-0 flex-1 bg-transparent text-theme-text outline-none"
                  placeholder="Enter password"
                />
              </div>
            </label>

            {error ? <p className="text-sm text-theme-danger">{error}</p> : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-theme-border-strong bg-gradient-to-r from-theme-accent to-theme-accent-strong px-4 py-2 font-semibold text-theme-background shadow-subtle transition hover:brightness-110"
            >
              Unlock
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
