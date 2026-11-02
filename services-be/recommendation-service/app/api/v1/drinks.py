from fastapi import FastAPI
import chromadb
from pydantic import BaseModel

app = FastAPI()

# Initializes Chroma natively inside the FastAPI process, saving data locally
chroma_client = chromadb.PersistentClient(path="./vector_storage")
collection = chroma_client.get_or_create_collection(name="drinkit_products")


class ProductEvent(BaseModel):
    id: str
    text_to_embed: str
    embedding: list[float]


@app.post("/ingest")
async def ingest_product(event: ProductEvent):

    


    # Consumes data from your Kafka topic and stores it
    collection.add(
        ids=[event.id],
        embeddings=[event.embedding],
        documents=[event.text_to_embed]
    )
    return {"status": "indexed"}