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

## Notes
- SQLite was chosen to minimize setup time and maximize delivery speed.
- Remaining features will build on the existing schema without major restructuring.
