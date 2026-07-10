-- =========================================================================
-- ECHOCAMPUS DUMMY DATA CLEANUP SCRIPT
-- WARNING: This will delete ALL users with the domain '@demo.echocampus.edu'
-- Due to ON DELETE CASCADE constraints, this will completely wipe all of their:
-- - Profiles
-- - Announcements
-- - Complaints
-- - Upvotes
-- - Marketplace listings
-- - Lost and found posts
--
-- Note: Your real users will be 100% unaffected.
-- =========================================================================

DELETE FROM auth.users WHERE email LIKE '%@demo.echocampus.edu';
