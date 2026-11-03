import { producer } from "../lib/kafka.ts";
export const sendPaymentSucessfullDetailsToKafkaTopic = async (
  orderId: string,
) => {
  await producer.send({
    topic: "payment_sucessfull",
    messages: [
      {
        value: JSON.stringify({
          type: "payment_sucessfull",
          details: {
            orderId,
          },
          timestamp: new Date(),
        }),
      },
    ],
  });
};
