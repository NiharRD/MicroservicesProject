from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Define a Pydantic model for request body validation
class Item(BaseModel):
    name: str
    price: float
    is_offer: Union[bool, None] = None

# A basic GET endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

# A GET endpoint with path and query parameters
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# A POST endpoint that expects a JSON body matching the Item model
@app.post("/items/")
def create_item(item: Item):
    return {"item_name": item.name, "item_price": item.price, "status": "created"}
