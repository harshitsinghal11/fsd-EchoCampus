export interface LostFoundItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location_found: string;
  contact_info: string;
  image_url: string | null;
  created_at: string;
  is_resolved: boolean;
}
