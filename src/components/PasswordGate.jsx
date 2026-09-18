import { useEffect, useState } from "react";

/* Password gate for protected work. Unlocking is remembered per slug in
   localStorage, so the case study and its companion pages share one lock. */

const UNLOCK_PASSWORD = "0620";
const storageKey = (slug) => `unlocked:${slug}`;

export function useUnlocked(slug, isProtected = true) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(isProtected ? localStorage.getItem(storageKey(slug)) === "true" : false);
  }, [slug, isProtected]);

  function unlock() {
    localStorage.setItem(storageKey(slug), "true");
    setUnlocked(true);
  }

  return [unlocked, unlock];
}

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function submit(e) {
    e.preventDefault();
    if (value === UNLOCK_PASSWORD) {
      setError(false);
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <main className="cs-gate">
      <div className="cs-protected">
        <span className="cs-protected-lock">🔒</span>
        <h1>This is a protected page</h1>
        <p>
          This project contains confidential client work. Enter the password to view it, or
          reach out and I'm happy to walk through it directly.
        </p>
        <form className="cs-password-form" onSubmit={submit}>
          <input
            type="password"
            inputMode="numeric"
            className="cs-password-input"
            placeholder="Password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            aria-label="Password"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">
            Unlock
          </button>
        </form>
        {error && <p className="cs-password-error">Incorrect password — try again.</p>}
      </div>
    </main>
  );
}
