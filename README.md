# Job Scheduler System (Project-10)
### NOTE: The code has been Deployed in Digital Ocean By Creating a Droplet in ubuntu You can access Api using this hosting url http://142.93.119.62/

## Summary
This project is a Node.js + TypeScript + Express API that lets users create scheduled **jobs** (primarily email notifications). Jobs are stored in **MySQL** using **Prisma**, and (to support millions of users) job execution is handled asynchronously via **Kafka**.

## Tech Stack
- **Node.js / TypeScript** (ESM / `module: NodeNext`)
- **Express** (REST API)
- **Prisma** ORM (MySQL)
- **Kafka** message broker (via `kafkajs`)
- **Nodemailer** (email sending)
- **cron-parser** (recurring schedule handling)

## Architecture (Kafka Flow)
### 1) Job creation (API)
When a user creates a job:
1. The job is inserted into MySQL (`Job` table).
2. Immediately after DB insert, the API publishes the job payload to Kafka topic:
   - **Topic:** `job-created`

### 2) Job processing (Kafka consumer)
A separate consumer process listens to `job-created`:
1. Consumed job message is parsed.
2. The consumer **re-checks the job in MySQL** (idempotency).
3. If the job is:
   - **due** (`nextRunTime <= now`) AND
   - **still pending** (`status === "PENDING"`)

   then it:
   - updates status to **`PROCESSING`**
   - sends the email
   - updates status to **`COMPLETED`** for `once`
   - for recurring jobs:
     - computes the next `nextRunTime`
     - updates `status` back to **`PENDING`**
     - republishes the updated job to Kafka (so another consumer instance can pick it up)

### Why this scales
- Kafka allows **horizontal scaling**: run multiple consumer instances/containers with the **same consumer group**.
- Consumers are distributed across Kafka partitions.
- No DB polling loop is required for execution.

> Note: Your environment may not have Docker installed (`docker` command missing). The README still includes Docker instructions for Kafka.

---

## Project Structure (important files)
### API / Controllers
- `src/controller/Job/createJob.ts`
  - Creates a job in MySQL
  - Publishes created job to Kafka (`job-created`)

### Kafka
- `src/lib/kafka.ts`
  - Shared Kafka producer + consumer helper functions
- `src/worker/kafkaConsumer.ts`
  - Kafka consumer worker
  - Processes due jobs and updates Prisma job state
- `src/consumer.ts`
  - Convenience entrypoint to start the consumer

### Email
- `src/lib/mailer.ts`
  - Nodemailer setup
- `src/lib/emailLayout.ts`
  - Email HTML layout

---

## Database (Prisma models)
Defined in: `prisma/schema.prisma`

### `User`
- `id` (uuid)
- `email` (unique)
- `password`
- `jobs` relation

### `Job`
- `id` (autoincrement int)
- `type` (string)
- `frequencyType` (enum: ONCE, DAILY, WEEKLY, MONTHLY, YEARLY, CUSTOM)
- `cronExpression` (nullable string)
- `nextRunTime` (Date)
- `status` (string, values used by app: PENDING, PROCESSING, COMPLETED, FAILED)
- `payload` (Json) — typically `{ email, subject, body }`
- `userId` relation to `User`

---

## API Endpoints
> Endpoint paths depend on the route files, but commonly:

### Authentication
- `POST /api/v1/user/registration`
  - Register a user
- `POST /api/v1/user/login`
  - Login and receive JWT

### Job endpoints
- `POST /api/v1/job/create`
  - Create a scheduled job for the logged-in user
  - Stores job in MySQL
  - Publishes job to Kafka topic `job-created`

- `GET /api/v1/job/fetch` (dashboard)
  - Fetch jobs for the logged-in user

- `PUT /api/v1/job/update/:id`
  - Update job fields (payload, status, schedule, etc.)

- `DELETE /api/v1/job/delete/:id`
  - Delete job

> If your project uses slightly different route paths/params, check `src/routes/JobRoutes/jobRoutes.ts`.

---

## Environment Variables
Copy example file:
- `Project-10/Job-Schedular-System/.env.example` → `.env`

Kafka:
- `KAFKA_BROKERS=localhost:9092`

Other (existing app vars):
- `DATABASE_URL`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

Consumer group (optional):
- `KAFKA_CONSUMER_GROUP_ID` (defaults to `job-processor-group`)

---

## Running the Project

### 1) Kafka (local)
If Docker is available:
```bash
cd Project-10/Job-Schedular-System
docker compose -f docker-compose-kafka.yml up -d
```

If Docker is NOT available, run Kafka using another local method, or use a cloud Kafka.

### 2) Start API
```bash
cd Project-10/Job-Schedular-System
npm run dev
```

### 3) Start Consumer
In a second terminal:
```bash
cd Project-10/Job-Schedular-System
npm run consumer
```

---

## Scaling to millions of users
To scale job execution:
1. Run multiple consumer instances with the **same group id**.
   - By default, the group is: `job-processor-group`
2. Increase Kafka partitions (production setup).
3. Add multiple pods/containers for `kafkaConsumer`.

Example (multiple terminals):
```bash
npm run consumer   # terminal 1
npm run consumer   # terminal 2
npm run consumer   # terminal 3
```

Kafka will distribute messages across instances.

---

## Build / Test
### Build
```bash
cd Project-10/Job-Schedular-System
npm run build
```

### Test
No tests are configured (current script prints an error).

---

## Notes / Limitations
- The consumer performs a DB re-check to ensure idempotency.
- For recurring jobs, the current approach republishes an updated job to Kafka after computing the next run time.
- Ensure Prisma migrations are applied (see Prisma docs / `prisma/migrations`).

---

## Troubleshooting
### `docker: command not found`
Docker is not installed/enabled on your current environment.
- Install Docker Desktop and enable it, or
- Use a remote/local Kafka setup without Docker.

### Kafka not receiving messages
- Verify API can reach Kafka broker from its environment.
- Confirm Kafka is running and broker address matches `KAFKA_BROKERS`.
- Confirm topic exists or `allowAutoTopicCreation` is enabled (it is enabled in the producer).

---

## Completed Kafka Work (Project-10)
- `createJob.ts` publishes newly created jobs to Kafka (`job-created`).
- `kafkaConsumer.ts` consumes and processes due jobs with Prisma updates.
- TypeScript build passes.

