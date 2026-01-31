'use client';

import { useEffect } from 'react';
import { useClientPageStore } from '@/store/clientPageStore';

export default function ClientsPage() {
  const {
    clients,
    search,
    status,
    type,
    page,
    pageSize,
    setClients,
    setCounts,
    setLoading,
    setError,
  } = useClientPageStore();

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          search,
          status,
          type,
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        const res = await fetch(`/api/dashboard/clients?${params.toString()}`);

        if (!res.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await res.json();

        setClients(data.clients);
        setCounts(data.counts);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [search, status, type, page, pageSize]);

  // ❗ Absichtlich kein UI
  return null;
}
