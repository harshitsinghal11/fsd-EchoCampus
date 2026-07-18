import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

import { Announcement } from '@/types/announcements';

const fetcher = async ([_key, limit, searchTerm]: [string, number | undefined, string]) => {
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
  return (data || []).map((item) => ({
    ...item,
    users: Array.isArray(item.users) ? item.users[0] : item.users
  })) as Announcement[];
};

export function useAnnouncements(isWidget: boolean = false, searchTerm: string = "", customLimit?: number) {
  const limit = isWidget ? (customLimit || 3) : customLimit;
  const key = ['announcements', limit, searchTerm];

  const { data, error, isLoading, mutate } = useSWR<Announcement[], Error, [string, number | undefined, string]>(key as [string, number | undefined, string], fetcher, { keepPreviousData: true });

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
