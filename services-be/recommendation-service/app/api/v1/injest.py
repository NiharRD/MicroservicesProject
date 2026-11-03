import os
import uuid
import dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import PointStruct

# Load environment variables
dotenv.load_dotenv()

app = FastAPI()

# Initialize Async Qdrant Client matching your batch script setup
qdrant_client = AsyncQdrantClient(
    url="http://localhost:6333", 
    api_key=os.getenv("QDRANT__SERVICE__API_KEY")
)
COLLECTION_NAME = "drinkit_catalog"

# Model matching the payload structure from your batch script
class ProductEvent(BaseModel):
    mongo_id: str
    name: str
    brand: str
    price: float
    isAlcoholic: bool = False
    flavorProfile: list[str] = []
    dietaryTags: list[str] = []
    text_to_embed: str
    embedding: list[float]

@app.post("/ingest")
async def ingest_product(event: ProductEvent):
    # Qdrant requires UUIDs; we generate one and store the original mongo_id in the payload
    point_id = str(uuid.uuid4())
    
    point = PointStruct(
        id=point_id,
        vector=event.embedding,
        payload={
            "mongo_id": event.mongo_id,
            "name": event.name,
            "brand": event.brand,
            "price": event.price,
            "isAlcoholic": event.isAlcoholic,
            "flavorProfile": event.flavorProfile,
            "dietaryTags": event.dietaryTags,
            "text": event.text_to_embed
        }
    )
    
    await qdrant_client.upsert(
        collection_name=COLLECTION_NAME,
        wait=True,
        points=[point]
    )
    
    return {"status": "indexed", "qdrant_id": point_id, "mongo_id": event.mongo_id}