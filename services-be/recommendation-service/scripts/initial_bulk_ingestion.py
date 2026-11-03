import asyncio
import json
import os
import dotenv
import uuid
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from openai import AsyncOpenAI

# Load environment variables
dotenv.load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
# Initialize clients
qdrant_client = AsyncQdrantClient(
    url="http://localhost:6333", 
    api_key=os.getenv("QDRANT__SERVICE__API_KEY")
)
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

COLLECTION_NAME = "drinkit_catalog"
EMBEDDING_MODEL = "text-embedding-3-small"
VECTOR_SIZE = 1536
BATCH_SIZE = 100  # Send 100 items per API call to avoid rate limits

async def setup_collection():
    if not await qdrant_client.collection_exists(collection_name=COLLECTION_NAME):
        await qdrant_client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )

async def ingest_catalog(brands_file, drinks_file):
    # Load JSON data
    with open(brands_file, 'r') as f:
        brands_data = json.load(f)
    
    with open(drinks_file, 'r') as f:
        drinks_data = json.load(f)
        
    # Create a lookup dictionary mapping the MongoDB ObjectId to the brand name
    brands_map = {b["_id"]["$oid"]: b["name"] for b in brands_data}
    
    # Process inventory in chunks
    for i in range(0, len(drinks_data), BATCH_SIZE):
        batch = drinks_data[i:i + BATCH_SIZE]
        
        texts_to_embed = []
        for drink in batch:
            brand_id = drink["brand"]["$oid"]
            brand_name = brands_map.get(brand_id, "Unknown Brand")
            
            # Combine relevant fields to create rich semantic context
            flavors = ", ".join(drink.get("flavorProfile", []))
            text = f"{drink['name']} by {brand_name}. {drink['description']} Flavors: {flavors}"
            texts_to_embed.append(text)
            
        # Execute a single batched API call to OpenAI
        response = await openai_client.embeddings.create(
            input=texts_to_embed,
            model=EMBEDDING_MODEL
        )
        
        points = []
        for j, drink in enumerate(batch):
            brand_name = brands_map.get(drink["brand"]["$oid"], "Unknown Brand")
            
            points.append(
                PointStruct(
                    # Qdrant requires UUIDs; MongoDB ObjectIds are too short, so we generate a new UUID 
                    # and store the original MongoDB ID in the payload for cross-referencing.
                    id=str(uuid.uuid4()),
                    vector=response.data[j].embedding,
                    payload={
                        "mongo_id": drink["_id"]["$oid"],
                        "name": drink["name"],
                        "brand": brand_name,
                        "price": drink["price"],
                        "isAlcoholic": drink.get("isAlcoholic", False),
                        "flavorProfile": drink.get("flavorProfile", []),
                        "dietaryTags": drink.get("dietaryTags", [])
                    }
                )
            )
            
        await qdrant_client.upsert(
            collection_name=COLLECTION_NAME,
            wait=True,
            points=points
        )
        print(f"Ingested batch {i//BATCH_SIZE + 1} ({len(batch)} items)")

async def main():
    await setup_collection()
    await ingest_catalog("scripts/catalog_service_db.brands.json", 
        "scripts/catalog_service_db.drinks.json")

if __name__ == "__main__":
    asyncio.run(main())