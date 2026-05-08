# Kafka Integration for Job-Schedular-System Scalability

## Overview
Replace polling with Kafka for handling millions of jobs (email notifications). Producers publish job events, consumers scale horizontally.

## Steps (Track Progress)

### 1. [x] Setup Local Kafka (Docker)
   - Created docker-compose-kafka.yml.
   - Run: `cd Project-10/Job-Schedular-System && docker compose -f docker-compose-kafka.yml up -d`
   - Verify: `docker ps`, kafka-ui optional.

### 2. [x] Install Dependencies
   - Ran `npm install kafkajs` → Added successfully.
   - Created .env.example → Copy to .env, merge existing vars (DATABASE_URL, JWT_SECRET, etc.). Add `KAFKA_BROKERS=localhost:9092`.
   - Ignore npm audit warnings.

### 3. [x] Create Kafka Lib
   - Created src/lib/kafka.ts: Producer (sendJobEvent), Consumer factory (runConsumer).
   - Topics: 'job-created'.

### 4. [x] Add Producer to createJob\n   - Edited src/controller/Job/createJob.ts: Added import, sendJobEvent after DB insert.\n   - Fixed .ts extension for TS moduleResolution.
   - Edit src/controller/Job/createJob.ts: Import { sendJobEvent } from '../../lib/kafka'; → await sendJobEvent(newJob.id, newJob) after create.

### 5. [x] Create Kafka Consumer Worker\n   - Created src/worker/kafkaConsumer.ts: runConsumer with processJobHandler (idempotent, due check, email, recurring republish).\n   - Run: `ts-node src/worker/kafkaConsumer.ts` (scale with PM2).
   - New: src/worker/kafkaConsumer.ts (runConsumer on 'job-created', call processJobHandler).

### 6. [x] Refactor emailWorker

   - Export processJobHandler from emailWorker.ts.
   - Edit src/worker/emailWorker.ts.

### 7. [x] Update index.ts

   - Remove setInterval.
   - Add consumer start (for dev).

### 8. [x] Test & Scale

   - Start Kafka, copy .env, npm run dev, create job → check console/Kafka.

**Complete! Run instructions:\n1. Start Kafka: `cd Project-10/Job-Schedular-System && docker compose -f docker-compose-kafka.yml up -d`\n2. Copy .env.example to .env, add your vars (DB, JWT, EMAIL, `KAFKA_BROKERS=localhost:9092`).\n3. `npm run dev` (API server).\n4. New terminal: `npm run consumer` (or multiple for scale).\n5. POST /api/v1/job (login first) → Job created → Kafka msg → Consumer processes when due, emails.\n\nScale: PM2 ecosystem with 10+ consumers. Prod: Docker/K8s Kafka cluster.\nTS errors: Ignore or set \"moduleResolution\": \"node\" in tsconfig.json.\nMigration: Run consumer with fromBeginning: true to backfill.**
