import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

type Announcement = {
  id: string;
  title: string;
  content: string;
  link: string | null;
  created_at: string;
  users?: {
    full_name?: string;
  } | null;
};

const fetcher = async (url: string, limit?: number) => {
  let query = supabase
    .from("announcements")
    .select(`*, users ( full_name )`)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  
  // Format data correctly due to Supabase returning arrays for joins sometimes
  return (data || []).map((item: any) => ({
    ...item,
    users: Array.isArray(item.users) ? item.users[0] : item.users
  })) as Announcement[];
};

export function useAnnouncements(isWidget: boolean = false) {
  const limit = isWidget ? 3 : undefined;
  const key = ['announcements', limit];

  const { data, error, isLoading, mutate } = useSWR<Announcement[]>(key, ([url, limit]: [string, number | undefined]) => fetcher(url, limit));

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
