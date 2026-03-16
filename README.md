# Email Automation Platform Assessment

A fast MVP for the AI Coding Implementor assessment using **TypeScript + Express + Prisma + SQLite**.

## Stack
- Node.js + TypeScript
- Express
- Prisma ORM
- SQLite
- Zod
- Cron
- Resend
- Postman for testing

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

### Campaigns

- `POST /campaigns`
- `PATCH /campaigns/:id/schedule`
- `POST /campaigns/:id/send-now`
- `GET /campaigns/:id/status`
- `GET /campaigns/:id/logs`

### Scheduling

- A background cron job runs every 60 seconds
- Due campaigns with `status = scheduled` and `scheduled_at <= now` are automatically processed

### Sending flow

- Contacts are filtered by matching `target_tags`
- Templates are interpolated per recipient
- Send results are recorded in `send_logs`
- Campaign status and counters are updated after processing

### Current implementation note

- The current implementation uses a mock send flow for local development and verification, with send events logged and tracked through the same campaign processing pipeline

## Notes
- SQLite was chosen to minimize setup time and maximize delivery speed.
- Request validation is handled with Zod.
- Template preview uses lightweight {{variable_name}} replacement for speed and simplicity.
- The project is being developed feature-by-feature using GitHub feature branches and pull requests.
- Scheduled campaigns are processed by a cron job running every 60 seconds.
- The current implementation uses a mock send flow for local verification, while preserving the campaign processing, logging, and scheduling pipeline.
- The project was developed feature-by-feature using GitHub feature branches and pull requests.
