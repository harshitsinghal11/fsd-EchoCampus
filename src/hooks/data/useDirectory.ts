import useSWR from 'swr';
import { supabase } from '@/lib/supabaseClient';
import { Faculty } from '@/types/faculty';

interface FacultyProfileData {
  department: string | null;
  phone_no: string | null;
  cabin_no: string | null;
  experience_years: number | null;
}

interface DirectoryUser {
  id: string;
  email: string;
  full_name: string | null;
  faculty_profiles: FacultyProfileData | FacultyProfileData[] | null;
}

const fetcher = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      faculty_profiles (
        department,
        phone_no,
        cabin_no,
        experience_years
      )
    `)
    .eq('role', 'admin')
    .order('full_name', { ascending: true });

  if (error) throw error;

  const formattedData: Faculty[] = (data || []).map((user: unknown) => {
    const typedUser = user as DirectoryUser;
    const profile = Array.isArray(typedUser.faculty_profiles) ? typedUser.faculty_profiles[0] : typedUser.faculty_profiles;
    return {
      id: typedUser.id,
      name: typedUser.full_name || 'Unknown',
      email: typedUser.email,
      department: profile?.department || 'General',
      phone_no: profile?.phone_no ?? null,
      cabin_no: profile?.cabin_no ?? null,
      experience: profile?.experience_years ?? null,
    };
  });

  return formattedData;
};

export function useDirectory() {
  const { data, error, isLoading, mutate } = useSWR<Faculty[]>('directory', fetcher);

  // Directory changes rarely, but we can setup caching nicely
  return {
    items: data || [],
    isLoading,
    isError: !!error,
    mutate
  };
}
