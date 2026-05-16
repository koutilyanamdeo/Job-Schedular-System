import { prisma } from "../lib/prisma.ts";
import { sendJobEvent, runConsumer } from "../lib/kafka.ts";
import { CronExpressionParser } from "cron-parser";
import type { EachMessagePayload } from "kafkajs";
import { sendEmail } from "../lib/mailer.ts";

const TOPIC_JOB_CREATED = "job-created";

// Process a consumed Kafka message. Idempotent via DB re-check.
const processJob = async (job: any): Promise<void> => {
  if (!job || typeof job !== "object") return;

  const jobId: number = Number(job.id);
  if (!Number.isFinite(jobId)) return;

  // Re-check in DB to ensure idempotency
  const dbJob = await prisma.job.findUnique({ where: { id: jobId } });
  if (!dbJob) return;

  const now = new Date();
  const due = dbJob.nextRunTime.getTime() <= now.getTime();
  if (!due) return;
  if (dbJob.status !== "PENDING") return;

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "PROCESSING" },
    });

    const { email, subject, body } = dbJob.payload as any;
    await sendEmail(email, subject, body);

    if (dbJob.frequencyType.toLowerCase() === "once") {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: "COMPLETED" },
      });
      return;
    }

    const interval = CronExpressionParser.parse(dbJob.cronExpression!);
    const next = interval.next().toDate();

    await prisma.job.update({
      where: { id: jobId },
      data: { nextRunTime: next, status: "PENDING" },
    });

    // Republish updated job so other consumer instances can pick it up.
    const updatedJob = await prisma.job.findUnique({ where: { id: jobId } });
    if (updatedJob && updatedJob.status === "PENDING") {
      await sendJobEvent(updatedJob.id, updatedJob);
    }
  } catch (err) {
    console.error(`Kafka consumer job ${jobId} failed:`, err);
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "FAILED" },
    });
  }
};

const handler = async ({ message }: EachMessagePayload): Promise<void> => {
  if (!message?.value) return;

  const raw = message.value.toString();
  let job: any;
  try {
    job = JSON.parse(raw);
  } catch {
    return;
  }

  await processJob(job);
};

export const startKafkaJobConsumer = async () => {
  const groupId = process.env.KAFKA_CONSUMER_GROUP_ID || "job-processor-group";
  console.log(`Starting Kafka consumer. groupId=${groupId}, topic=${TOPIC_JOB_CREATED}`);

  await runConsumer(groupId, TOPIC_JOB_CREATED, handler as any);
};

// Allow running directly with `ts-node src/worker/kafkaConsumer.ts`
if (process.env.KAFKA_CONSUME_NOW === "true") {
  startKafkaJobConsumer().catch((e) => {
    console.error("Consumer failed to start:", e);
    process.exit(1);
  });
}

