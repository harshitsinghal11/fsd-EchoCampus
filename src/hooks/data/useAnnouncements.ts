import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

import { Announcement } from '@/types/announcements';

const fetcher = async ([url, limit, searchTerm]: [string, number | undefined, string]) => {
  let query = supabase
    .from("announcements")
    .select(`*, users ( full_name )`)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Format data correctly due to Supabase returning arrays for joins sometimes
  return (data || []).map((item: any) => ({
    ...item,
    users: Array.isArray(item.users) ? item.users[0] : item.users
  })) as Announcement[];
};

export function useAnnouncements(isWidget: boolean = false, searchTerm: string = "", customLimit?: number) {
  const limit = isWidget ? 3 : customLimit;
  const key = ['announcements', limit, searchTerm];

  const { data, error, isLoading, mutate } = useSWR<Announcement[]>(key, fetcher as any);

  useEffect(() => {
    const channel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
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
