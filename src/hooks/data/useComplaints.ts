import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

type Complaint = {
  id: string;
  complaint: string;
  created_at: string;
  upvotes: number;
  current_user_has_upvoted?: boolean;
};

const fetcher = async () => {
  const res = await fetch("/api/complaints");
  if (!res.ok) throw new Error("Failed to load complaints");
  const json = await res.json();
  return (json.complaints as Complaint[]) || [];
};

export function useComplaints(isWidget: boolean = false) {
  const limit = isWidget ? 3 : undefined;
  
  const { data, error, isLoading, mutate } = useSWR<Complaint[]>('/api/complaints', fetcher);

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
