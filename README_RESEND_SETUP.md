Resend Email Setup (FastAPI + Vercel)

Overview
- We use Resend to deliver contact form emails from the backend.
- Backend already has code wired in server.py -> send_contact_email().

Environment variables (backend)
- RESEND_API_KEY: Your Resend secret API key
- RESEND_FROM: Display sender, e.g. "Portfolio <portfolio@yourdomain.com>"
- RESEND_TO: Destination inbox for contact notifications (e.g. your personal email)
- ADMIN_TOKEN: token for admin endpoints (X-Admin-Token header)

Domain verification (for custom sender)
1) In Resend Dashboard -> Domains -> Add Domain (e.g. yourdomain.com)
2) Add DNS records (TXT + CNAME) at your DNS provider:
   - SPF: v=spf1 include:resend.com ~all
   - DKIM (3 CNAMEs from Resend UI)
   - Return-Path (CNAME) from Resend UI
3) Wait for verification (usually a few minutes to a few hours)
4) Once verified, you can send from addresses like portfolio@yourdomain.com

Vercel notes (frontend only)
- Frontend uses REACT_APP_BACKEND_URL to send requests to backend. Do not hardcode URLs.

Testing email locally
- Set RESEND_API_KEY, RESEND_TO to your email, RESEND_FROM to a verified domain address.
- Submit the Contact form. The backend will store the message and attempt to send via Resend.
- Response includes { ok: true, email: { sent: true/false, id?: string } }

Admin API (no UI yet)
- Add header X-Admin-Token: <ADMIN_TOKEN>
- POST /api/admin/projects  (body: Project)
- PUT  /api/admin/projects/{id}
- DELETE /api/admin/projects/{id}
- PUT  /api/admin/skills     (body: list[SkillGroup])
- POST /api/admin/blog       (body: BlogPost)
- PUT  /api/admin/blog/{id}
- DELETE /api/admin/blog/{id}

Security
- Keep ADMIN_TOKEN secret and rotate when needed
- Consider IP allowlisting or OAuth for production

Troubleshooting
- If emails not sending, check logs and ensure domain is verified.
- If using an unverified from address, Resend may reject or mark as spam.
