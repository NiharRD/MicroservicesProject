from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager
import asyncio
from app.consumers.order_consumer import consume_events




@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the Kafka consumer as a background task
    consumer_task = asyncio.create_task(consume_events())
    yield
    # Clean up when the server shuts down
    consumer_task.cancel()

app = FastAPI(lifespan=lifespan)

