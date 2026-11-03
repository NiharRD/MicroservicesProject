# # Inside your Kafka consumer processing loop
# user_key = f"user:{user_id}:recent_views"
# await redis_client.lpush(user_key, product_id)
# await redis_client.ltrim(user_key, 0, 9) # Keep only the 10 most recent clicks
import numpy as np
from fastapi import FastAPI, HTTPException

# Assuming redis_client and qdrant_client are initialized globally as in your previous script

@app.get("/recommend/feed/{user_id}")
async def get_personalized_feed(user_id: str):
    user_key = f"user:{user_id}:recent_views"
    
    # 1. Retrieve the list of strings from Redis and decode bytes to strings
    raw_recent_ids = await redis_client.lrange(user_key, 0, 4)
    recent_product_ids = [pid.decode("utf-8") for pid in raw_recent_ids] if raw_recent_ids else []
    
    if not recent_product_ids:
        # Fallback for new users with no history
        # In production, you might query your top 5 highest-rated items here
        return {"recommendations": [{"id": "fallback_1", "name": "Popular Drink 1"}]}

    # 2. Fetch the vectors for these recently viewed products from Qdrant asynchronously
    recent_points = await qdrant_client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=recent_product_ids,
        with_vectors=True
    )
    
    vectors = [point.vector for point in recent_points if point.vector]
    
    # Safety check: If none of the IDs were found in Qdrant, fallback
    if not vectors:
        return {"recommendations": [{"id": "fallback_1", "name": "Popular Drink 1"}]}

    # 3. Create a user profile vector by averaging their recent views
    user_profile_vector = np.mean(vectors, axis=0).tolist()
    
    # 4. Search Qdrant for drinks matching this averaged profile
    search_results = await qdrant_client.search(
        collection_name=COLLECTION_NAME,
        query_vector=user_profile_vector,
        limit=10,  # Fetch extra to account for filtering
        with_payload=True
    )
    
    # 5. Filter out the drinks the user has already viewed
    recommendations = []
    for hit in search_results:
        if str(hit.id) not in recent_product_ids:
            recommendations.append({
                "qdrant_id": str(hit.id), 
                "mongo_id": hit.payload.get("mongo_id"),
                "name": hit.payload.get("name"),
                "brand": hit.payload.get("brand"),
                "price": hit.payload.get("price")
            })
            
        if len(recommendations) == 5:
            break
            
    return {"recommendations": recommendations}