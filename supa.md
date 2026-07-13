[
  {
    "tablename": "users",
    "policyname": "users_insert_self",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((id = auth.uid()) AND (role = 'student'::text) AND (lower(TRIM(BOTH FROM email)) = lower(TRIM(BOTH FROM COALESCE((auth.jwt() ->> 'email'::text), ''::text)))))"
  },
  {
    "tablename": "users",
    "policyname": "users_select_admins",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(role = 'admin'::text)",
    "with_check": null
  },
  {
    "tablename": "users",
    "policyname": "users_select_own",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "student_profiles",
    "policyname": "student_profile_insert_own",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "student_profiles",
    "policyname": "student_profile_update_own",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(user_id = auth.uid())",
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "student_profiles",
    "policyname": "student_profiles_read_authenticated",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "faculty_profiles",
    "policyname": "admin_insert_faculty_profile",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((auth.uid() = user_id) AND (EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))))"
  },
  {
    "tablename": "faculty_profiles",
    "policyname": "faculty_and_admin_update_profile",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "((user_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = ANY (ARRAY['faculty'::text, 'admin'::text]))))))",
    "with_check": null
  },
  {
    "tablename": "faculty_profiles",
    "policyname": "faculty_profiles_select_all",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "announcements",
    "policyname": "announcement_delete_author",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "((author_id = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))))",
    "with_check": null
  },
  {
    "tablename": "announcements",
    "policyname": "announcement_read_authenticated",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "announcements",
    "policyname": "announcement_update_author",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "((author_id = auth.uid()) OR (EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))))",
    "with_check": null
  },
  {
    "tablename": "announcements",
    "policyname": "faculty_insert_announcements",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND ((users.role = 'faculty'::text) OR (users.role = 'admin'::text)))))"
  },
  {
    "tablename": "complaint_upvotes",
    "policyname": "complaint_upvotes_delete_own",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "complaint_upvotes",
    "policyname": "complaint_upvotes_insert_student_only",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((user_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'student'::text)))))"
  },
  {
    "tablename": "complaint_upvotes",
    "policyname": "complaint_upvotes_read_authenticated",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "lost_found",
    "policyname": "lost_found_delete_owner",
    "roles": "{authenticated}",
    "cmd": "DELETE",
    "qual": "(user_id = auth.uid())",
    "with_check": null
  },
  {
    "tablename": "lost_found",
    "policyname": "lost_found_insert_owner",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(user_id = auth.uid())"
  },
  {
    "tablename": "lost_found",
    "policyname": "lost_found_read_authenticated",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  },
  {
    "tablename": "marketplace",
    "policyname": "marketplace_insert_student_owner",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((owner_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'student'::text)))))"
  },
  {
    "tablename": "marketplace",
    "policyname": "marketplace_read_student_only",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'student'::text))))",
    "with_check": null
  },
  {
    "tablename": "marketplace",
    "policyname": "marketplace_update_owner_only",
    "roles": "{authenticated}",
    "cmd": "UPDATE",
    "qual": "(owner_id = auth.uid())",
    "with_check": "(owner_id = auth.uid())"
  },
  {
    "tablename": "push_subscriptions",
    "policyname": "Authenticated users can select all subscriptions for dispatch",
    "roles": "{public}",
    "cmd": "SELECT",
    "qual": "(auth.role() = 'authenticated'::text)",
    "with_check": null
  },
  {
    "tablename": "push_subscriptions",
    "policyname": "Users can delete their own subscriptions",
    "roles": "{public}",
    "cmd": "DELETE",
    "qual": "(auth.uid() = user_id)",
    "with_check": null
  },
  {
    "tablename": "push_subscriptions",
    "policyname": "Users can insert their own subscriptions",
    "roles": "{public}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(auth.uid() = user_id)"
  },
  {
    "tablename": "chat_messages",
    "policyname": "chat_insert_student_only",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'student'::text))))"
  },
  {
    "tablename": "chat_messages",
    "policyname": "chat_read_student_only",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM users\n  WHERE ((users.id = auth.uid()) AND (users.role = 'student'::text))))",
    "with_check": null
  },
  {
    "tablename": "complaint_box",
    "policyname": "complaints_insert_student_only",
    "roles": "{authenticated}",
    "cmd": "INSERT",
    "qual": null,
    "with_check": "((user_id = auth.uid()) AND (EXISTS ( SELECT 1\n   FROM users u\n  WHERE ((u.id = auth.uid()) AND (u.role = 'student'::text)))))"
  },
  {
    "tablename": "complaint_box",
    "policyname": "complaints_read_authenticated",
    "roles": "{authenticated}",
    "cmd": "SELECT",
    "qual": "true",
    "with_check": null
  }
]