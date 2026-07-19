export type Announcement = {
  id: string;
  title: string;
  content: string;
  link: string | null;
  created_at: string;
  author_id: string;
  event_start_date?: string | null;
  event_end_date?: string | null;
  is_starred?: boolean;
  users?: {
    full_name?: string;
  } | null;
};
