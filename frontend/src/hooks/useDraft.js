import { useEffect, useState } from 'react';

export function useDraft(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; }
    catch { return initial; }
  });
  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }, 500);
    return () => clearTimeout(t);
  }, [key, value]);
  const clear = () => { try { localStorage.removeItem(key); } catch {} };
  return [value, setValue, clear];
}