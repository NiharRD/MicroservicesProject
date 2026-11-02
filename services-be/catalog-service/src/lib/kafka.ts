import { Kafka } from "kafkajs";

const kafkaClient = new Kafka({
  clientId: "catalog-service",
  brokers: ["localhost:9092"],
});
const producer = kafkaClient.producer();
const consumer = kafkaClient.consumer({ groupId: "catalog-service-group" });

export { kafkaClient, producer, consumer };
