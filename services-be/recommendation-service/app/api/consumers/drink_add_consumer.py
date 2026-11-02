from fastapi import FastAPI, BackgroundTasks
from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
import asyncio
import json



async def consume_drink_added_events():
    consumer = AIOKafkaConsumer(
        "drink-addition",
        bootstrap_servers="localhost:9092",
        group_id="recommendation-service-consumer"
    )
    await consumer.start()
    try:
        async for msg in consumer:
            event = json.loads(msg.value.decode("utf-8"))
            print(f"all bussiness logic regarding adding of new drinks is done: {event}")
            # Here you can process the event, e.g., update your recommendation model
    finally:
        await consumer.stop()