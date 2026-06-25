import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { MarketplaceItem } from '@/types/marketplace';
import { useEffect } from 'react';

const fetcher = async (url: string, limit?: number) => {
  let query = supabase
    .from("marketplace")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as MarketplaceItem[];
};

export function useMarketplace(isWidget: boolean = false) {
  const limit = isWidget ? 4 : undefined;
  // Use a stable key based on the limit
  const key = ['marketplace', limit];
  
  const { data, error, isLoading, mutate } = useSWR<MarketplaceItem[]>(key, ([url, limit]: [string, number | undefined]) => fetcher(url, limit));

  useEffect(() => {
    const channel = supabase
      .channel('public:marketplace')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace' },
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
