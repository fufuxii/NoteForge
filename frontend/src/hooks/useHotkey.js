import { useEffect } from 'react';

export function useHotkey(combo, handler) {
  useEffect(() => {
    const parts = combo.toLowerCase().split('+');
    const needsMod = parts.includes('mod');
    const key = parts[parts.length - 1];
    const onKey = (e) => {
      if (e.key.toLowerCase() !== key) return;
      if (needsMod && !(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      handler(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [combo, handler]);
}