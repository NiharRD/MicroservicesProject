import { Kafka } from "kafkajs";

const kafkaClient = new Kafka({
  clientId: "payment-service",
  brokers: ["localhost:9092"],
});
const producer = kafkaClient.producer();
const consumer = kafkaClient.consumer({ groupId: "payment-service-group" });

export { kafkaClient, producer, consumer };
