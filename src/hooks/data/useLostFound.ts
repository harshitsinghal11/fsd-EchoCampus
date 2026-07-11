import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

import { LostFoundItem } from '@/types/lost-found';

const fetcher = async ([_key, limit]: [string, number | undefined]) => {
  let query = supabase
    .from("lost_found")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as LostFoundItem[];
};

export function useLostFound(isWidget: boolean = false, customLimit?: number) {
  const limit = isWidget ? 3 : customLimit;
  const key = ['lost_found', limit];

  const { data, error, isLoading, mutate } = useSWR<LostFoundItem[], Error, [string, number | undefined]>(key as [string, number | undefined], fetcher, { keepPreviousData: true });

  useEffect(() => {
    const channel = supabase
      .channel('public:lost_found')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lost_found' },
        () => { mutate() }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mutate]);

  return {
    items: data || [],
    isLoading,
    isError: !!error,
    mutate
  };
}
