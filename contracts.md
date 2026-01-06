# API Contracts — Portfolio (React + FastAPI + MongoDB)

Status: Draft for backend implementation. Frontend currently uses mocked data in `frontend/src/mock/mock.js` and localStorage for likes/contact form. No external emails are sent yet.

Base URL: `${REACT_APP_BACKEND_URL}/api`

## Entities
1. Profile
- id (str, uuid)
- full_name (str)
- title (str)
- headline (str)
- university (str)
- location (str)
- availability (bool)
- summary (str)
- links: { github, linkedin, email, resume }

2. Project
- id (str, uuid)
- title (str)
- description (str)
- tags (list[str])
- category (str)
- year (int)
- live (str, url)
- repo (str, url)

3. SkillGroup
- id (str, uuid)
- group (str)
- items: [{ name: str, level: int (0-100) }]

4. BlogPost
- id (str, uuid)
- title (str)
- excerpt (str)
- content (str)
- tags (list[str])
- date (date)
- likes (int)

5. ContactMessage
- id (str, uuid)
- name (str)
- email (str)
- message (str)
- created_at (datetime)

## Endpoints
All responses return JSON and follow basic error schema `{ detail: string }` for 4xx/5xx.

- GET /profile -> Profile | 404 if not set
- PUT /profile -> upsert Profile (body: Profile without id)

- GET /projects -> list[Project]
- POST /projects -> Project (body: Project without id)
- PUT /projects/{id} -> Project
- DELETE /projects/{id} -> { ok: true }

- GET /skills -> list[SkillGroup]
- PUT /skills -> list[SkillGroup] (replace all)

- GET /blog -> list[BlogPost]
- POST /blog -> BlogPost (likes defaults 0)
- GET /blog/{id} -> BlogPost
- PUT /blog/{id} -> BlogPost
- DELETE /blog/{id} -> { ok: true }

- POST /contact -> { ok: true } (stores ContactMessage; optional email send in future)

## Frontend Integration Plan
- Replace mock fetches with axios calls to `${REACT_APP_BACKEND_URL}/api/...`.
- Persist blog likes server-side (PATCH /blog/{id}/like could be added later; for now PUT with updated likes).
- Contact form: POST /contact and show toast on success.
- Resume: use `profile.links.resume` if present.

## Seed Strategy (optional)
- On first run, if collections empty, provide a script/route `/api/admin/seed` (dev only) — not required for production.

## Notes
- All backend routes must remain prefixed with `/api` (Kubernetes ingress rule).
- Backend binds 0.0.0.0:8001; Frontend only uses env `REACT_APP_BACKEND_URL`.
