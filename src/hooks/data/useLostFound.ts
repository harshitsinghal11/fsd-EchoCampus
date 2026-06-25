import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

export interface LostFoundItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location_found: string;
  contact_info: string;
  image_url: string | null;
  created_at: string;
}

const fetcher = async (url: string, limit?: number) => {
  let query = supabase
    .from("lost_found")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as LostFoundItem[];
};

export function useLostFound(isWidget: boolean = false) {
  const limit = isWidget ? 3 : undefined;
  const key = ['lost_found', limit];

  const { data, error, isLoading, mutate } = useSWR<LostFoundItem[]>(key, ([url, limit]: [string, number | undefined]) => fetcher(url, limit));

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
