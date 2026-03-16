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

## Architecture Overview
- Express routes handle HTTP requests
- Service layer contains business logic
- Prisma manages persistence in SQLite
- A cron job polls due scheduled campaigns every 60 seconds
- Campaign sends are recorded in send_logs
- /health reports API, database, and cron runtime visibility

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


## Notes
- SQLite was chosen to minimize setup time and maximize delivery speed.
- Request validation is handled with Zod.
- Template preview uses lightweight {{variable_name}} replacement for speed and simplicity.
- The project is being developed feature-by-feature using GitHub feature branches and pull requests.
- Scheduled campaigns are processed by a cron job running every 60 seconds.
- In the submission environment, outbound delivery at the external email API boundary may depend on external network/API availability; failures are captured in send_logs and exposed through the logs endpoint for observability.
- The project was developed feature-by-feature using GitHub feature branches and pull requests.
- Resend free tier without custom domain, testing limited to verified own email, sender uses onboarding@resend.dev
