import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

import { Complaint } from '@/types/complaints';

const fetcher = async ([url, limit]: [string, number | undefined]) => {
  const urlWithParams = limit ? `${url}?limit=${limit}` : url;
  const res = await fetch(urlWithParams);
  if (!res.ok) throw new Error("Failed to load complaints");
  const json = await res.json();
  return (json.complaints as Complaint[]) || [];
};

export function useComplaints(isWidget: boolean = false, customLimit?: number) {
  const limit = isWidget ? 3 : customLimit;
  const key = ['/api/complaints', limit];

  const { data, error, isLoading, mutate } = useSWR<Complaint[], Error, [string, number | undefined]>(key as [string, number | undefined], fetcher);

  useEffect(() => {
    const channel = supabase
      .channel('public:complaints')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaint_box' },
        () => { mutate() }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaint_upvotes' },
        () => { mutate() }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  // Apply widget slicing locally if needed
  let items = data || [];
  if (limit) items = items.slice(0, limit);

  return {
    items,
    isLoading,
    isError: !!error,
    mutate
  };
}
