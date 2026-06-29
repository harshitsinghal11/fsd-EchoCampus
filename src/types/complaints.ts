export type Complaint = {
  id: string;
  complaint: string;
  created_at: string;
  upvotes: number;
  current_user_has_upvoted?: boolean;
};
