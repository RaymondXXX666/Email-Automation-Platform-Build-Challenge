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
The API runs locally at: http://localhost:3000
### Contacts
- `GET /contacts`
- `POST /contacts`
- `PUT /contacts/:id`
- `DELETE /contacts/:id`
- `POST /contacts/import`

  Recommended test:
	•	Create a contact with tags such as ["vip", "nz"]
	•	Confirm it appears in GET /contacts

### Health
- `GET /health`

Expected result:
	•	API responds successfully
	•	Database status is available
	•	Cron status is visible

### Templates
- `GET /templates`
- `POST /templates`
- `PUT /templates/:id`
- `DELETE /templates/:id`
- `POST /templates/:id/preview`

Recommended test:
	•	Create a template using variables such as {{first_name}} and {{email}}
	•	Use the preview endpoint to verify interpolation

### Campaigns

- `POST /campaigns`
- `PATCH /campaigns/:id/schedule`
- `POST /campaigns/:id/send-now`
- `GET /campaigns/:id/status`
- `GET /campaigns/:id/logs`

Recommended test:
	1.	Create a campaign using an existing template
	2.	Check initial status with GET /campaigns/:id/status
	3.	Schedule it with PATCH /campaigns/:id/schedule
	4.	Trigger immediate sending with POST /campaigns/:id/send-now
	5.	Review delivery status and logs with:
	•	GET /campaigns/:id/status
	•	GET /campaigns/:id/logs

### Logging and observability

The application includes:
	•	GET /health for API, database, and cron visibility
	•	GET /campaigns/:id/logs for paginated send history

Campaign logs include:
	•	recipient information
	•	send status
	•	resend message id
	•	error message
	•	send timestamp

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

## Reflection

This project was completed as a timeboxed MVP. I prioritized the core backend application workflow — contacts, templates, campaigns, scheduling, cron processing, and logging — over optional UI work, since the brief allowed a backend-only application.

A key takeaway was the importance of observability in external integrations. While the application-side campaign pipeline was implemented end-to-end, outbound delivery at the email API boundary depended on external environment and network reliability. Capturing those outcomes through `send_logs`, campaign status, and `/health` made the system easier to verify and debug.

With more time, I would focus on hardening the live email integration, adding retry and backoff after or during hardening the live email integration, and then introducing a lightweight UI for easier manual operation.
