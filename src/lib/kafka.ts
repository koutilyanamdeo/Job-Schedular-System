import dotenv from 'dotenv';
import { Kafka } from 'kafkajs';
import type { Producer, Consumer, EachMessagePayload } from 'kafkajs';

dotenv.config();

const kafka = new Kafka({
  clientId: 'job-scheduler',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

export const TOPIC_JOB_CREATED = 'job-created';

let producerInstance: Producer | null = null;

export const getProducer = async (): Promise<Producer> => {
  if (!producerInstance) {
    const p = kafka.producer({ 
      allowAutoTopicCreation: true
    });
    await p.connect();
    producerInstance = p;
  }
  return producerInstance;
};

export const sendJobEvent = async (jobId: number, job: Record<string, any>): Promise<void> => {
  try {
    const producer = await getProducer();
    await producer.send({
      topic: TOPIC_JOB_CREATED,
      messages: [{ 
        key: jobId.toString(), 
        value: JSON.stringify(job) 
      }],
    });
    console.log(`Published job ${jobId} to Kafka`);
  } catch (error) {
    console.error('Kafka send failed:', error);
  }
};

export const getConsumer = (groupId: string = 'job-processor-group-v1'): Consumer => {
  return kafka.consumer({ groupId });
};

export const runConsumer = async (
  groupId: string,
  topic: string,
  handler: (payload: EachMessagePayload) => Promise<void>
): Promise<void> => {
  const c = getConsumer(groupId);
  await c.connect();
  await c.subscribe({ topic, fromBeginning: false });
  await c.run({ 
    eachMessage: handler as any 
  });
};

process.on('SIGINT', async () => {
  console.log('Shutting down Kafka connections...');
  if (producerInstance) await producerInstance.disconnect();
  process.exit(0);
});
