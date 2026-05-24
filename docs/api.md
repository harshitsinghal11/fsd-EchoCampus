# HTTP API

Next.js Route Handlers under `app/api/`. All use `createServerClient` from `@supabase/ssr` with `cookies()` so the caller’s Supabase session is honored.

Base URL in development: `http://localhost:3000`.

---

## Complaints

### `GET /api/complaints`

| | |
|---|---|
| Auth | Optional; if logged in, includes `current_user_has_upvoted` |
| Response | `{ complaints: Complaint[] }` |

Each complaint:

| Field | Notes |
|-------|-------|
| `id`, `complaint`, `created_at` | From `complaint_box.content` |
| `session_code` | From `student_profiles` for non-anonymous; **`"Anonymous"`** if `is_anonymous` |
| `author_id` | `null` when anonymous |
| `upvotes` | Count from `complaint_upvotes` |
| `current_user_has_upvoted` | Boolean |

### `POST /api/complaints`

| | |
|---|---|
| Auth | **Required** (401) |
| Body | `{ complaint: string, isAnonymous?: boolean }` |
| Insert | `{ user_id, content, is_anonymous }` |
| Errors | 400 invalid body; 429 on rate-limit trigger message; 500 otherwise |

### `POST /api/complaints/upvote`

| | |
|---|---|
| Auth | **Required** |
| Body | `{ complaintId: string }` |
| Logic | Toggle: delete existing `(complaint_id, user_id)` or insert |
| Response | `{ added, current_user_has_upvoted }` |
| Errors | 403 on RLS violation (`42501`) — students only |

---

## Marketplace

### `GET /api/marketplace`

| | |
|---|---|
| Auth | Session required for RLS (students only) |
| Response | `{ listings: MarketplaceRow[] }` |

### `POST /api/marketplace`

| | |
|---|---|
| Auth | **Required** |
| Body | `{ product_title, description, price, owner_name, contact_info }` |
| Validation | All strings required; `price` finite and `> 0`; `description` length ≥ 3; `contact_info` must match `^\d{10}$` |
| Insert | `owner_email` from **`user.email`** (never from client) |

### `POST /api/marketplace/sold`

| | |
|---|---|
| Auth | **Required** |
| Body | `{ id: string }` |
| Update | `is_sold: true` where `id` and `owner_id = user.id` |

---

## Client usage examples

```ts
// Create complaint
await fetch("/api/complaints", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ complaint: "...", isAnonymous: true }),
});

// Upvote
await fetch("/api/complaints/upvote", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ complaintId: "uuid" }),
});
```

Cookies are sent automatically for same-origin `fetch` from the browser.

---

## Features not exposed as Route Handlers

These use the **browser Supabase client** directly (RLS-enforced):

- Announcements (read/create)
- Directory
- Lost & found
- User profile reads

See [architecture.md](./architecture.md).
