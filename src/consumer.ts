import { startKafkaJobConsumer } from "./worker/kafkaConsumer.ts";

startKafkaJobConsumer().catch((e) => {
  console.error("Kafka consumer failed to start:", e);
  process.exit(1);
});

