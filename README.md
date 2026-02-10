# MNU Travel Clone + CMS

Next.js 16 + TypeScript project with:
- Public site pages (`/`, `/tours/[slug]`, `/documents`, `/thank-you`)
- Admin panel (`/admin/*`)
- RBAC (`ADMIN`, `MANAGER`, `STUDENT`)
- Prisma + PostgreSQL
- NextAuth credentials auth
- Cloudinary signed upload API
- i18n content fields for `KZ` (default), `RU`, `EN`
- RU -> KZ/EN auto-translation workflow (OpenAI)
- Poster A/B generation (`1080x1350`) from template data
- Student portal (`/student`) with profile, my tours, and “best moments”
- Password reset via email with 6-digit code

## 1. Install

```bash
npm install
```

## 2. Configure env

```bash
cp .env.example .env
```

Set real values in `.env`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `OPENAI_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## 3. Apply DB migrations

```bash
npx prisma migrate deploy
```

For local development you can use:

```bash
npx prisma migrate dev
```

## 4. Seed first admin + demo tour

```bash
npm run prisma:seed
```

## 5. Run dev server

```bash
npm run dev
```

Open:
- Public site: `http://localhost:3000`
- Auth modal: `http://localhost:3000/?auth=1`
- Admin: `http://localhost:3000/admin`
- Student dashboard: `http://localhost:3000/student`
- Student forgot password: `http://localhost:3000/student/forgot-password`

## Poster Upload Flow

1. Fill RU fields in tour editor.
2. Click `Перевести RU -> KZ/EN`.
3. Review KZ/EN and manually adjust if needed.
4. Upload posters separately for `EN / RU / KZ` (`Add more` supports multiple posters per language).
5. Publish (without posters is allowed, with warning).

## API routes

- `POST /api/auth/[...nextauth]`
- `GET /api/tours?lang=kz|ru|en&status=published`
- `GET /api/tours/catalog?lang=...&q=...&location=...&dateFrom=...&dateTo=...&sort=...&page=...&pageSize=...`
- `GET /api/tours/:slug?lang=...`
- `GET|POST /api/admin/tours`
- `GET|PATCH|DELETE /api/admin/tours/:id`
- `POST /api/admin/tours/translate`
- `GET|PATCH /api/admin/settings/poster`
- `POST /api/admin/upload`
- `GET|POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `PATCH /api/admin/users/:id/role`
- `GET /api/moments?lang=kz|ru|en`
- `POST /api/applications`
- `POST /api/student/register`
- `GET|PATCH /api/student/profile`
- `GET /api/student/tours`
- `POST /api/student/moments`
- `POST /api/student/upload`
- `POST /api/student/password/request-code`
- `POST /api/student/password/confirm`
- `GET /api/admin/moments`
- `PATCH /api/admin/moments/:id`

## Notes

- Admin users management is restricted to `ADMIN`.
- Tours CRUD is available for `ADMIN` and `MANAGER`.
- Login and registration are performed via a single auth modal on the home page.
- Public tours grid uses language-specific uploaded posters (`posterTemplateData.posterUrls`) when available; otherwise fallback content.
- Tour applications auto-reserve a spot if `studentLimit` is not reached.
- Student “best moments” are submitted as `PENDING` and shown on home page only after admin/manager approval.
