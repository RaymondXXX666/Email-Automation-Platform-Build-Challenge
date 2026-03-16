# Email Automation Platform Assessment

A fast MVP for the AI Coding Implementor assessment using **TypeScript + Express + Prisma + SQLite**.

## Stack
- Node.js + TypeScript
- Express
- Prisma ORM
- SQLite
- Resend
- cron

## Setup
```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Implemented so far
- Project scaffold
- Prisma schema for contacts, templates, campaigns, send_logs
- Feature 1 started: contacts CRUD + import
- Health endpoint
- Error handling + validation foundation

## API
### Contacts
- `GET /contacts`
- `POST /contacts`
- `PUT /contacts/:id`
- `DELETE /contacts/:id`
- `POST /contacts/import`

### Health
- `GET /health`

### Templates
- `GET /templates`
- `POST /templates`
- `PUT /templates/:id`
- `DELETE /templates/:id`
- `POST /templates/:id/preview`

## Notes
- SQLite was chosen to minimize setup time and maximize delivery speed.
- Request validation is handled with Zod.
- Template preview uses lightweight {{variable_name}} replacement for speed and simplicity.
- The project is being developed feature-by-feature using GitHub feature branches and pull requests.
