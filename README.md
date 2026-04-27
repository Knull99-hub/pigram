# Pixgram

An Instagram-style photo-sharing web application built on Azure. Users create accounts, follow creators, publish photos, and interact through likes, comments, saves, and notifications.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Data Models](#data-models)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Key Features Explained](#key-features-explained)
9. [API Reference](#api-reference)
10. [Local Development](#local-development)
11. [Environment Variables](#environment-variables)
12. [Azure Deployment](#azure-deployment)
13. [CI/CD Pipeline](#cicd-pipeline)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| State / Data | TanStack Query v5 (server state), Zustand v5 (auth state) |
| Routing | React Router v7 |
| Backend | NestJS 10, TypeScript |
| Auth | Passport.js, JWT (RS256-compatible, HS256 default) |
| Primary Database | Azure Cosmos DB (NoSQL / Core SQL API) |
| Media Storage | Azure Blob Storage |
| Caching | Azure Cache for Redis (optional, graceful no-op fallback) |
| HTTP Client | Axios |
| Validation | class-validator + class-transformer (NestJS pipes) |
| API Docs | Swagger / OpenAPI (auto-generated at `/api/docs`) |
| CI/CD | GitHub Actions |
| Hosting | Azure App Service (backend), Azure Static Web Apps (frontend) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│   React SPA (Azure Static Web Apps)                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │  Pages   │  │Components│  │TanStack  │  │  Zustand │  │
│   │ 11 routes│  │ & Layout │  │  Query   │  │auth store│  │
│   └────┬─────┘  └──────────┘  └────┬─────┘  └──────────┘  │
│        │ REST / JSON                │                       │
└────────┼───────────────────────────┼───────────────────────┘
         │ HTTPS + Bearer JWT         │
         ▼                           │
┌────────────────────────────────────┼───────────────────────┐
│   NestJS API  (Azure App Service)  │                       │
│   Global prefix: /api              │                       │
│                                    │                       │
│  ┌─────────────────────────────────┴──────────────────┐    │
│  │            Module Layer (14 modules)               │    │
│  │  auth │ users │ posts │ comments │ likes │ saves   │    │
│  │  follows │ feed │ search │ notifications │ health  │    │
│  │  + database │ storage │ cache (all global)         │    │
│  └──────────────────────────────────────────────────┬─┘    │
│                                                     │      │
│  ┌─────────────────┐  ┌────────────────┐  ┌────────┴─────┐ │
│  │  Cosmos DB      │  │  Blob Storage  │  │    Redis     │ │
│  │  7 containers   │  │  media images  │  │  (optional)  │ │
│  └─────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Request flow for a protected route:**

```
Browser → HTTPS → NestJS
  → JwtAuthGuard validates Bearer token
    → CurrentUser decorator injects full user object from DB
      → (optional) RolesGuard checks role (creator / consumer)
        → Controller calls Service
          → Service checks business rules / ownership
            → Repository executes Cosmos DB query
              → Response (auto-serialized to JSON)
```

---

## Project Structure

```
Instagram_clone/
├── backend/                     NestJS application
│   └── src/
│       ├── main.ts              Bootstrap: CORS, ValidationPipe, Swagger, global prefix
│       ├── app.module.ts        Root module — imports all 14 feature modules
│       │
│       ├── database/            Global — CosmosClient + auto-creates 7 containers on boot
│       ├── storage/             Global — Azure Blob upload/delete; placeholder fallback in dev
│       ├── cache/               Global — ioredis wrapper; fully disabled if REDIS_HOST unset
│       │
│       ├── common/
│       │   ├── decorators/
│       │   │   ├── current-user.decorator.ts   @CurrentUser() → injects user from JWT
│       │   │   └── roles.decorator.ts          @Roles(Role.Creator)
│       │   └── guards/
│       │       ├── jwt-auth.guard.ts            Validates Bearer token
│       │       └── roles.guard.ts               Checks user.role against @Roles()
│       │
│       ├── auth/                Register, Login, /me — issues JWT
│       ├── users/               Profile CRUD, avatar upload, follower counts
│       ├── posts/               Photo posts — CRUD, discover, search
│       ├── comments/            Per-post comments — add, list, delete
│       ├── likes/               Like / unlike — idempotent
│       ├── saves/               Save / unsave — idempotent
│       ├── follows/             Follow graph — follow, unfollow, status check
│       ├── feed/                Personalised feed using follow graph + enrichment
│       ├── notifications/       Follow / like / comment notification events
│       ├── search/              Full-text search across users and posts
│       └── health/              GET /api/health → { status: "ok" }
│
├── frontend/                    React + Vite application
│   └── src/
│       ├── main.tsx             Entry point — mounts App into #root
│       ├── App.tsx              QueryClient, BrowserRouter, route guards, all routes
│       │
│       ├── types/index.ts       Shared TypeScript interfaces (User, Post, Comment, …)
│       │
│       ├── api/                 One file per domain — thin wrappers over axios
│       │   ├── client.ts        Axios instance: base URL, JWT header, 401 redirect
│       │   ├── auth.ts          register, login, me
│       │   ├── posts.ts         create, getById, getUserPosts, getDiscover, …
│       │   ├── feed.ts          getFeed
│       │   ├── likes.ts         like, unlike
│       │   ├── saves.ts         save, unsave, getSaved
│       │   ├── follows.ts       follow, unfollow, isFollowing
│       │   ├── notifications.ts getAll, markRead
│       │   ├── search.ts        search
│       │   └── users.ts         getProfile, updateProfile, updateAvatar, followers, following
│       │
│       ├── store/
│       │   └── auth.store.ts    Zustand — user, token, setAuth, updateUser, logout
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Layout.tsx   Wraps pages: Sidebar + main content + MobileNav
│       │   │   ├── Sidebar.tsx  Desktop left nav (hidden on mobile)
│       │   │   └── MobileNav.tsx Bottom tab bar (hidden on desktop)
│       │   ├── ui/
│       │   │   ├── Avatar.tsx   Rounded image with fallback to ui-avatars.com
│       │   │   ├── Modal.tsx    Overlay modal — ESC to close, scroll-lock
│       │   │   ├── Spinner.tsx  Loading indicator
│       │   │   └── ImageGrid.tsx 3-column post grid with hover overlay
│       │   ├── post/
│       │   │   ├── PostCard.tsx  Feed card — double-tap to like, optimistic UI
│       │   │   ├── PostModal.tsx Full post detail — image + comments + actions
│       │   │   └── CommentList.tsx Comment thread with inline add/delete
│       │   └── user/
│       │       ├── FollowButton.tsx  Follow / unfollow with live state
│       │       └── UserCard.tsx      Compact user row used in search results
│       │
│       └── pages/
│           ├── LoginPage.tsx
│           ├── RegisterPage.tsx
│           ├── FeedPage.tsx          /
│           ├── DiscoverPage.tsx      /discover
│           ├── SearchPage.tsx        /search
│           ├── CreatePostPage.tsx    /create  (Creator role only)
│           ├── ProfilePage.tsx       /profile/:username
│           ├── EditProfilePage.tsx   /account/edit
│           ├── PostDetailPage.tsx    /p/:id
│           ├── NotificationsPage.tsx /notifications
│           └── SavedPage.tsx         /saved
│
├── .github/workflows/
│   ├── backend.yml              Build → type-check → deploy to App Service
│   └── frontend.yml             Build → type-check → deploy to Static Web Apps
│
└── README.md
```

---

## Data Models

All data lives in Azure Cosmos DB (Core SQL API). Each container uses a specific partition key for efficient queries and scalable storage.

### Container Map

| Container | Partition Key | Notes |
|---|---|---|
| `users` | `/id` | One document per user |
| `posts` | `/creatorId` | Enables fast queries by creator |
| `comments` | `/postId` | Enables fast per-post listing |
| `likes` | `/postId` | Enables fast per-post like checks |
| `saves` | `/userId` | Enables fast per-user saved list |
| `follows` | `/followerId` | Enables fast following lookups |
| `notifications` | `/userId` | Enables fast per-user notifications |

### Document Shapes

**User**
```typescript
{
  id: string           // UUID
  email: string
  passwordHash: string // bcrypt, never returned to clients
  username: string     // unique, lowercase, regex /^[a-z0-9_.]+$/
  displayName: string
  avatarUrl: string    // Blob Storage URL
  bio: string
  website: string
  location: string
  role: 'creator' | 'consumer'
  followerCount: number
  followingCount: number
  postCount: number
  createdAt: string    // ISO 8601
}
```

**Post** — `creatorUsername` and `creatorAvatarUrl` are denormalized at creation time to avoid N+1 joins when listing feeds.
```typescript
{
  id: string
  creatorId: string
  creatorUsername: string   // denormalized snapshot
  creatorAvatarUrl: string  // denormalized snapshot
  imageUrl: string          // Blob Storage URL
  blobName: string          // internal blob reference for deletion
  caption: string
  location: string
  peoplePresent: string[]
  tags: string[]
  likeCount: number
  commentCount: number
  saveCount: number
  createdAt: string
  updatedAt: string
}
```

**Comment** — author info denormalized to avoid joins when listing comments.
```typescript
{
  id: string
  postId: string
  authorId: string
  authorUsername: string   // denormalized snapshot
  authorAvatarUrl: string  // denormalized snapshot
  text: string
  createdAt: string
}
```

**Like**
```typescript
{ id, postId, userId, createdAt }
```

**Save**
```typescript
{ id, postId, userId, createdAt }
```

**Follow**
```typescript
{ id, followerId, followingId, createdAt }
```

**Notification**
```typescript
{
  id: string
  userId: string       // who receives the notification
  actorId: string      // who triggered it
  actorUsername: string
  actorAvatarUrl: string
  type: 'follow' | 'like' | 'comment'
  entityId: string     // the related entity (postId, commentId, userId)
  entityType: 'post' | 'comment' | 'user'
  isRead: boolean
  createdAt: string
}
```

---

## Backend Architecture

### Layer Pattern

Every feature module follows the same three-layer structure:

```
HTTP Request
    │
    ▼
Controller          — Route binding, auth guards, DTO binding, response shape
    │
    ▼
Service             — Business logic, ownership checks, orchestration, caching
    │
    ▼
Repository          — Raw Cosmos DB queries, no business logic
    │
    ▼
Cosmos DB Container
```

### Global Modules

Three modules are registered `@Global()` — they are available in every other module without importing:

| Module | Purpose |
|---|---|
| `DatabaseModule` | Provides the `CosmosClient` + `Database` instance. On app boot it auto-creates all 7 containers with their partition keys if they don't exist. |
| `StorageModule` | Provides `StorageService`. Uploads files to Azure Blob Storage (UUID-named). If `AZURE_STORAGE_ACCOUNT` is not set (local dev), returns a `picsum.photos` placeholder URL instead. |
| `CacheModule` | Provides `CacheService` — a typed wrapper over `ioredis` with `get<T>`, `set`, `del`, `delByPattern`. If `REDIS_HOST` is not set, every method is a no-op, so the app works without Redis. |

### Circular Dependency Resolution

The follow graph creates a natural circular dependency:
- `UsersModule` needs `FollowsModule` (to expose follower/following endpoints)
- `FollowsModule` needs `UsersModule` (to increment follower/following counts)
- `FollowsModule` needs `NotificationsModule` (to create follow notifications)
- `NotificationsModule` needs `UsersModule` (to enrich notification actors)

These are resolved using NestJS `forwardRef()`:

```
UsersModule ←──forwardRef()──→ FollowsModule
                                     │
                              forwardRef()
                                     │
                          NotificationsModule
```

### Validation

All request bodies are validated via NestJS's global `ValidationPipe`:
- `whitelist: true` — strips unknown properties
- `transform: true` — auto-converts plain objects to DTO class instances and query string numbers to `number`
- DTO files use `class-validator` decorators (`@IsString`, `@IsEmail`, `@MaxLength`, etc.)
- Multipart form data arrays (e.g. `tags`) are handled with a `@Transform` decorator that parses JSON strings

### Caching Strategy

| Endpoint | Cache Key | TTL |
|---|---|---|
| Single post (`GET /posts/:id`) | `post:{id}` | 120 s |
| Discover feed | `discover:{offset}:{limit}` | 60 s |
| Personalised feed | `feed:{userId}:{offset}:{limit}` | 60 s |

Cache is invalidated:
- On post create/update/delete → `del post:{id}` + `delByPattern feed:{creatorId}:*`
- On like/comment/save counter change → `del post:{id}`

---

## Frontend Architecture

### State Management — Two Systems

| Concern | Tool | Reason |
|---|---|---|
| Server data (posts, profiles, feed) | TanStack Query | Caching, background refetch, optimistic updates |
| Auth session (user object + JWT token) | Zustand | Synchronous reads, localStorage persistence |

### Route Guards

Three wrapper components live in `App.tsx` and compose around route elements:

```tsx
<RequireAuth>       // Redirects to /login if no token
<RequireCreator>    // Redirects to / if role !== 'creator'
<GuestOnly>         // Redirects to / if already logged in
```

Example — only creators can reach the create page:
```tsx
<Route path="/create"
  element={
    <RequireAuth>
      <RequireCreator>
        <CreatePostPage />
      </RequireCreator>
    </RequireAuth>
  }
/>
```

### API Client

`src/api/client.ts` creates a single Axios instance with:
- `baseURL: '/api'` — proxied to `localhost:3000` by Vite in dev, served by the Azure backend in production
- **Request interceptor** — reads `localStorage.getItem('token')` and injects `Authorization: Bearer <token>` on every request
- **Response interceptor** — catches `401 Unauthorized`, clears localStorage, and redirects to `/login`

### Optimistic Updates

Like and save actions use TanStack Query's `onMutate` / `onError` pattern:

```
User clicks Like
  → onMutate: immediately update cached post (liked: true, likeCount + 1)
  → API call fires in background
  → onError: rollback to original state if API fails
  → onSettled: revalidate from server to confirm final state
```

### Data Denormalization on the Frontend

The frontend `Post` type carries `creatorUsername` and `creatorAvatarUrl` so every `PostCard` can render the creator's name and avatar without an extra API call. These values are written to the Cosmos DB document at post creation time by the backend service.

---

## Authentication & Authorization

### Registration

```
POST /api/auth/register
Body: { email, username, displayName, password, role: 'creator'|'consumer' }

1. Check email uniqueness
2. Check username uniqueness
3. bcrypt.hash(password, 12)
4. Create user document in Cosmos DB
5. Sign JWT { sub: userId, email }
6. Return { token, user (sanitized — no passwordHash) }
```

### Login

```
POST /api/auth/login
Body: { email, password }

1. Find user by email
2. bcrypt.compare(password, passwordHash)
3. Sign JWT
4. Return { token, user }
```

### JWT Flow

```
Client stores token in localStorage
→ Axios interceptor adds "Authorization: Bearer <token>" to all requests
→ JwtAuthGuard (Passport jwt strategy) extracts and verifies token
→ JWT payload { sub, email } → UsersService.findById(sub) → full User document
→ @CurrentUser() injects the full User into the controller method
```

### Roles

```typescript
enum Role { Creator = 'creator', Consumer = 'consumer' }
```

- **Creator** — can create posts (`POST /api/posts` is guarded by `@Roles(Role.Creator)`)
- **Consumer** — can browse, search, like, comment, save, follow
- Both roles can use all social features

`sanitize(user)` strips `passwordHash` and `email` from any user object before it leaves the API.

---

## Key Features Explained

### Feed Algorithm

```
GET /api/posts/feed

1. Get list of userId's that the current user follows
2. If followingIds is empty → fall back to Discover (recent posts from everyone)
3. Query posts WHERE creatorId IN (followingIds) ORDER BY createdAt DESC
4. Batch query: which postIds has this user liked? which has this user saved?
5. Merge liked/saved booleans into each post object
6. Cache the enriched result for 60 seconds
7. Return enriched posts array
```

### Post Creation (Creator role)

```
POST /api/posts  (multipart/form-data)
Fields: file (image), caption, tags (JSON array string)

1. RolesGuard rejects non-creators with 403
2. Upload image buffer to Azure Blob Storage → returns public URL
3. Fetch creator's current username + avatarUrl (denormalization)
4. Create post document in Cosmos DB with all fields including creator snapshot
5. Increment user's postCount counter
6. Invalidate feed cache for this creator
7. Return post document
```

### Follow System

```
POST /api/users/:id/follow

1. Reject if followerId === followingId (cannot follow yourself)
2. Check if follow document already exists (idempotent)
3. Create follow document { followerId, followingId }
4. Increment follower's followingCount
5. Increment target's followerCount
6. Create 'follow' notification for target user
```

### Notifications

Notifications are created as side effects inside the relevant service:
- `FollowsService.follow()` → creates `type: 'follow'` notification
- `LikesService.like()` → creates `type: 'like'` notification (skipped if user likes their own post)
- `CommentsService.create()` → creates `type: 'comment'` notification (skipped if commenter is post creator)

The notification document stores `actorUsername` and `actorAvatarUrl` denormalized at creation time so the notifications feed renders without extra lookups.

---

## API Reference

All routes are prefixed with `/api`. Swagger UI is available at `/api/docs` when the backend is running.

### Auth

| Method | Path | Auth | Body / Params |
|--------|------|------|---------------|
| POST | `/auth/register` | — | `{ email, username, displayName, password, role }` |
| POST | `/auth/login` | — | `{ email, password }` |
| GET | `/auth/me` | JWT | — |

### Users & Follows

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/users/:username` | — | Profile by username |
| PATCH | `/users/me` | JWT | Update bio, website, location, displayName |
| POST | `/users/me/avatar` | JWT | `multipart/form-data` with `file` field |
| GET | `/users/:id/followers` | — | Array of User objects |
| GET | `/users/:id/following` | — | Array of User objects |
| POST | `/users/:id/follow` | JWT | Follow a user |
| DELETE | `/users/:id/follow` | JWT | Unfollow a user |
| GET | `/users/:id/follow/status` | JWT | `{ following: boolean }` |

### Posts

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/posts/feed` | JWT | Personalised feed |
| GET | `/posts/discover` | — | All recent posts, paginated |
| GET | `/posts/user/:userId` | — | Posts by user ID |
| GET | `/posts/:id` | — | Single post |
| POST | `/posts` | JWT + Creator | `multipart/form-data`: `file`, `caption`, `tags` |
| PATCH | `/posts/:id` | JWT | Only post creator |
| DELETE | `/posts/:id` | JWT | Only post creator |

### Comments

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/posts/:id/comments` | — | All comments for a post |
| POST | `/posts/:id/comments` | JWT | `{ content: string }` |
| DELETE | `/comments/:id` | JWT | Only comment author |

### Likes & Saves

| Method | Path | Auth |
|--------|------|------|
| POST | `/posts/:id/like` | JWT |
| DELETE | `/posts/:id/like` | JWT |
| POST | `/posts/:id/save` | JWT |
| DELETE | `/posts/:id/save` | JWT |
| GET | `/users/me/saved` | JWT |

### Notifications & Search

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/notifications` | JWT | All notifications for current user |
| PATCH | `/notifications/:id/read` | JWT | Mark as read |
| GET | `/search?q=` | JWT | Returns `{ users: User[], posts: Post[] }` |
| GET | `/health` | — | `{ status: "ok", timestamp }` |

---

## Local Development

### Prerequisites

- Node.js 20+
- An Azure Cosmos DB account **or** the [Azure Cosmos DB Emulator](https://docs.microsoft.com/en-us/azure/cosmos-db/local-emulator) (runs locally on Windows)
- Azure Blob Storage account (optional — placeholder images used if not configured)
- Redis server (optional — caching silently disabled if not configured)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Instagram_clone

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Open .env and fill in COSMOS_ENDPOINT, COSMOS_KEY, COSMOS_DATABASE, JWT_SECRET
# Leave AZURE_STORAGE_* and REDIS_* blank to use fallback/disabled modes
```

> **Cosmos DB Emulator tip:** set `COSMOS_ENDPOINT=https://localhost:8081` and `COSMOS_KEY=<emulator key>`. The backend auto-creates all containers on first startup — you don't need to create them manually.

### 3. Run the backend

```bash
cd backend
npm run start:dev
# API running at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### 4. Run the frontend

```bash
cd frontend
npm run dev
# App running at http://localhost:5173
# All /api requests are proxied to localhost:3000 by Vite
```

### 5. Build for production

```bash
# Backend
cd backend && npm run build
# Output: backend/dist/

# Frontend
cd frontend && npm run build
# Output: frontend/dist/
```

---

## Environment Variables

All backend configuration is controlled by environment variables. Copy `backend/.env.example` to `backend/.env` and fill in values.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `FRONTEND_URL` | No | `http://localhost:5173` | CORS allowed origin |
| `JWT_SECRET` | **Yes** | — | Secret used to sign tokens. Use a long random string in production. |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry (e.g. `1d`, `7d`, `30d`) |
| `COSMOS_ENDPOINT` | **Yes** | — | Cosmos DB account endpoint URL |
| `COSMOS_KEY` | **Yes** | — | Cosmos DB primary key |
| `COSMOS_DATABASE` | **Yes** | — | Database name (created automatically if absent) |
| `AZURE_STORAGE_ACCOUNT` | No | — | Storage account name. Leave blank to use placeholder images. |
| `AZURE_STORAGE_KEY` | No | — | Storage account access key |
| `AZURE_STORAGE_CONTAINER` | No | `media` | Blob container name |
| `REDIS_HOST` | No | — | Redis hostname. Leave blank to disable caching. |
| `REDIS_PORT` | No | `6380` | Redis port |
| `REDIS_PASSWORD` | No | — | Redis access key |
| `REDIS_TLS` | No | `true` | Enable TLS (required for Azure Redis) |

---

## Azure Deployment

### Required Azure Resources

1. **Azure Cosmos DB** — NoSQL / Core SQL API, Serverless or Provisioned throughput
2. **Azure Blob Storage** — Create a container named `media`. Set access to **Blob** (public read) or use SAS tokens.
3. **Azure App Service** — Linux, Node.js 20 runtime. Set all environment variables in Configuration → Application settings.
4. **Azure Static Web Apps** — Free tier is sufficient. Linked to the `frontend/` directory.
5. **Azure Cache for Redis** (optional) — Basic C0 is enough for dev/staging.

### Configuring the Backend on App Service

In App Service → Configuration → Application settings, add every variable from the table above.

Also add a startup command so Node runs the compiled output:
```
node dist/main.js
```

### Configuring the Frontend

The frontend calls `/api/*` which must be rewritten to the App Service URL in production. Two options:

**Option A — Proxy rule in Static Web Apps** (`frontend/public/staticwebapp.config.json` is already configured):
Add a route that proxies `/api/*` to your App Service URL:
```json
{
  "routes": [
    {
      "route": "/api/*",
      "rewrite": "https://your-appservice.azurewebsites.net/api/*"
    }
  ]
}
```

**Option B — VITE_API_URL env var**: Set `VITE_API_URL` in the GitHub Actions environment and update `src/api/client.ts` to use `import.meta.env.VITE_API_URL` as the `baseURL`.

---

## CI/CD Pipeline

Two GitHub Actions workflows trigger on push to `main`:

### `backend.yml`

```
push to main (backend/** changed)
  → Install Node 20
  → npm ci
  → tsc --noEmit        (type-check, fails fast)
  → npm run build       (nest build → dist/)
  → Upload artifact
  → npm ci --omit=dev   (production deps only)
  → azure/webapps-deploy action → App Service
```

**Secret required:** `AZURE_WEBAPP_PUBLISH_PROFILE` — download from App Service → Get Publish Profile.

### `frontend.yml`

```
push to main (frontend/** changed)
  → Install Node 20
  → npm ci
  → tsc --noEmit        (type-check, fails fast)
  → npm run build       (vite build → dist/)
  → Azure/static-web-apps-deploy action → Static Web Apps
```

**Secret required:** `AZURE_STATIC_WEB_APPS_API_TOKEN` — found in Static Web Apps → Manage deployment token.

Add secrets at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**
