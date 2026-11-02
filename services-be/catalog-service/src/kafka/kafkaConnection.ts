import { producer, consumer } from "../lib/kafka";
// Connect to Kafka and start consumer
const startKafka = async () => {
  await producer.connect();
  await consumer.connect();

  // commented as catalog service is not consumer actually, but just a producer for now. If we want to make it a consumer, we can uncomment this code and implement the logic accordingly.

  //await consumer.subscribe({ topic: "order_events", fromBeginning: true });

  //   await consumer.run({
  //     eachMessage: async ({ topic, partition, message }) => {
  //       if (!message.value) return;

  //       const event = JSON.parse(message.value.toString());
  //       console.log(
  //         `Express Consumer received event: ${event.type} for ₹${event.amount}`,
  //       );
  //     },
  //   });
};
