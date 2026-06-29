export type Announcement = {
  id: string;
  title: string;
  content: string;
  link: string | null;
  created_at: string;
  users?: {
    full_name?: string;
  } | null;
};
