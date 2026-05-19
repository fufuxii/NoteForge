import { useCallback, useEffect, useState } from 'react';
import { listApuntes } from '../lib/api';

export function useApuntes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const r = await listApuntes();
      setItems(r.items ?? []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { items, loading, error, refresh };
}