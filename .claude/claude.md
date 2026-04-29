---
trigger: model_decision
---

# CLAUDE.md

Read this file fully before making changes. Start by inspecting the repo, then produce a concise implementation plan.

## Project
Build a **master-level Instagram-style photo sharing web app** on **Azure** for a scalable software solutions coursework project.

This is **not** a basic upload gallery. The app should feel functionally close to Instagram for photo-based use cases, while still being realistic to build for a university project.

Core idea:
- users create accounts and profiles
- users can follow other users
- creators publish photo posts with metadata
- users interact through likes, comments, saves, notifications, and profile views
- users can search content and profiles
- app must be cloud-native, scalable in design, and deployable on Azure

The app should prioritize **real Instagram-like functionality** over cosmetic cloning.

***

## Required Stack
Use this stack unless there is a strong reason to change it.

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query or TanStack Query
- Zustand or Context API for light client state

### Backend
- NestJS
- TypeScript
- class-validator / DTO validation
- JWT auth
- role guards and ownership guards

### Cloud / Infra
- Azure Static Web Apps for frontend
- Azure App Service for backend
- Azure Blob Storage for images and media assets
- Azure Cosmos DB for app data
- Azure Cache for Redis for feed/search/detail caching
- GitHub Actions for CI/CD

### Optional advanced features
- Azure CDN or equivalent for image delivery
- Azure AI / Claude on Azure for caption suggestion, moderation support, or tag suggestion
- background jobs for notifications, cache refresh, image processing

Core app must work without AI.

***

## Product Scope
Build an Instagram-style web app focused on **photos**, not reels/chat. Keep videos, stories, and messaging out unless explicitly added later.

### Main functional areas
1. Authentication and account system
2. Profile system
3. Post creation and post interactions
4. Feed system
5. Search / discover system
6. Social graph (follow / unfollow)
7. Notifications
8. Save / bookmark system
9. Azure deployment and scalable architecture

***

## Core Features

### 1. Authentication
- register
- login
- logout
- get current user
- JWT auth
- route protection

### 2. User profiles
Each user has:
- username
- display name
- avatar
- bio
- location optional
- website optional
- account type / role

Profile page should show:
- profile header
- avatar
- bio
- follower count
- following count
- post count
- follow / unfollow button
- grid of posts
- saved posts tab for self only
- tagged tab optional

### 3. Posts
Each post supports:
- one or multiple photos if feasible, otherwise start with single photo and structure for carousel later
- caption
- location
- tagged people / peoplePresent
- createdAt
- creator reference
- like count
- comment count
- save count

Users can:
- create post
- edit own post
- delete own post
- view post detail modal/page

### 4. Feed
Home feed should support:
- posts from followed users
- fallback discover feed if user follows nobody
- reverse chronological first; optional ranking later
- like button
- save button
- comment entry access
- open post details
- open creator profile

Instagram-like interaction details to include where reasonable:
- double click / double tap to like on post image
- optimistic UI for like/save actions
- modal or page for single post detail

### 5. Comments
Comments system should support:
- add comment
- delete own comment
- list comments per post
- timestamp
- commenter profile link
- comment count on post

### 6. Likes
Likes system should support:
- like / unlike post
- one like per user per post
- count display
- liked state in feed and post detail

### 7. Save / bookmarks
Users can:
- save post
- unsave post
- view saved posts on their own profile

### 8. Follow system
Users can:
- follow user
- unfollow user
- view followers list
- view following list

Rules:
- a user cannot follow themselves
- feed should depend on following graph

### 9. Search / discover
Search should support:
- search users by username/display name
- search posts by caption/location/tags
- discover page with recent/popular posts

### 10. Notifications
Notifications should exist for:
- new follower
- like on my post
- comment on my post

Notification center should show:
- actor
- event type
- target reference
- timestamp
- read/unread state if feasible

***

## Roles
Use two platform roles because the coursework requires role awareness.

### Creator
- can create posts
- can manage own posts
- can also browse and socially interact like a normal user if needed

### Consumer
- can browse, search, follow, like, comment, save
- cannot create posts

Note:
To stay close to Instagram behavior while respecting coursework constraints, creators are the publishers and consumers are interaction-focused users.

***

## Data Model
Use clean, scalable models. Cosmos DB schema can be document-oriented but keep service/repository layer clean.

### users
- id
- email
- passwordHash
- username
- displayName
- avatarUrl
- bio
- website
- location
- role
- followerCount
- followingCount
- postCount
- createdAt

### posts
- id
- creatorId
- media[] or primaryImageUrl
- blobNames[] or blobName
- caption
- location
- peoplePresent[]
- tags[] optional
- likeCount
- commentCount
- saveCount
- createdAt
- updatedAt

### comments
- id
- postId
- userId
- content
- createdAt

### likes
- id
- postId
- userId
- createdAt

### saves
- id
- postId
- userId
- createdAt

### follows
- id
- followerId
- followingId
- createdAt

### notifications
- id
- userId
- actorId
- type
- entityId
- entityType
- isRead
- createdAt

***

## REST API
Keep routes clean and modular.

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users / Profiles
- GET /api/users/:username
- GET /api/users/:id/followers
- GET /api/users/:id/following
- POST /api/users/:id/follow
- DELETE /api/users/:id/follow
- PATCH /api/users/me

### Posts
- GET /api/posts/feed
- GET /api/posts/discover
- GET /api/posts/:id
- GET /api/posts/user/:userId
- POST /api/posts
- PATCH /api/posts/:id
- DELETE /api/posts/:id

### Comments
- GET /api/posts/:id/comments
- POST /api/posts/:id/comments
- DELETE /api/comments/:id

### Likes
- POST /api/posts/:id/like
- DELETE /api/posts/:id/like

### Saves
- POST /api/posts/:id/save
- DELETE /api/posts/:id/save
- GET /api/users/me/saved

### Search
- GET /api/search?q=

### Notifications
- GET /api/notifications
- PATCH /api/notifications/:id/read

### Health
- GET /api/health

***

## Frontend Pages
Required pages/views:
- /login
- /register
- /
- /feed
- /discover
- /search
- /p/:id
- /create
- /profile/:username
- /account/edit
- /notifications
- /saved

UI should be Instagram-inspired:
- left sidebar or top nav depending on layout
- clean white/minimal interface
- responsive mobile-friendly feed
- profile grid layout
- post modal/detail view
- strong visual focus on media

***

## Architecture Expectations
This is a master-level project, so architecture should be explicit and modular.

Required design characteristics:
- layered backend: controller -> service -> repository
- DTO validation
- auth guards
- ownership checks for edit/delete
- object storage separated from metadata storage
- cache feed/discover/post detail where useful
- environment-based configuration
- clean error handling and logging
- easy to explain in slides

***

## Scalability Features
Include and/or structure for these:
- static frontend separated from API
- Blob Storage for media
- Cosmos DB for scalable hosted data
- Redis cache for hot reads
- stateless API deployment
- pagination or cursor-based feed loading
- optional CDN or image optimization pipeline
- optional background notification generation

***

## Deployment Expectations
Claude should prepare the app for:
- local development first
- Azure deployment second

Target deployment:
- frontend -> Azure Static Web Apps
- backend -> Azure App Service
- images -> Azure Blob Storage
- data -> Azure Cosmos DB
- cache -> Azure Redis
- CI/CD -> GitHub Actions

If Azure-specific integration is blocked, provide a temporary local/dev adapter but keep interfaces Azure-ready.

***

## Engineering Standards
- Use TypeScript everywhere.
- Keep code modular and production-like.
- Use NestJS modules, DTOs, guards, interceptors where appropriate.
- Validate all inputs and uploads.
- No hardcoded secrets.
- Use env files and env example files.
- Add seed/demo data.
- Add linting and basic tests.
- Prefer clean architecture over hacks.
- Keep naming consistent and presentation-ready.

***

## Delivery Strategy
Use this order:
1. inspect existing repo
2. create concise implementation plan
3. scaffold frontend and backend structure
4. implement auth and profile system
5. implement post creation and media upload
6. implement feed, post detail, likes, comments
7. implement follow graph and profile pages
8. implement save/bookmark and notifications
9. connect caching and polish queries
10. prepare Azure deployment and CI/CD

***

## Claude Tooling Context
Claude is running in VS Code and has direct file access in the app folder.
Available tooling includes MCP servers and local development tools.
Use them effectively:
- filesystem access for reading/writing code and docs
- terminal for scaffold, run, lint, test, and build
- Git/GitHub tooling for repo hygiene and CI/CD
- Azure MCP for resource and deployment validation
- browser/debug tools for UI and API verification

Do not waste context repeating obvious steps. Inspect the actual codebase before changing architecture.

***

## First Response Expected
Before writing large amounts of code:
1. summarize current repo state
2. propose implementation plan
3. identify missing infra/config pieces
4. start with the highest-impact foundational work