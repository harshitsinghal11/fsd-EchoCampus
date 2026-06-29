import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

import { LostFoundItem } from '@/types/lost-found';

const fetcher = async ([url, limit, searchTerm]: [string, number | undefined, string]) => {
  let query = supabase
    .from("lost_found")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as LostFoundItem[];
};

export function useLostFound(isWidget: boolean = false, searchTerm: string = "", customLimit?: number) {
  const limit = isWidget ? 3 : customLimit;
  const key = ['lost_found', limit, searchTerm];

  const { data, error, isLoading, mutate } = useSWR<LostFoundItem[]>(key, fetcher as any);

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
