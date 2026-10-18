import sys
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

app = FastAPI(
    title="Inventory Service",
    description="Python FastAPI Inventory Microservice",
    version="1.0.0"
)

# Mock in-memory database
INVENTORY_DB = {
    "ITEM-101": {"name": "Mechanical Keyboard", "stock": 15, "price": 99.99},
    "ITEM-102": {"name": "4K Ultra-Wide Monitor", "stock": 8, "price": 349.50},
    "ITEM-103": {"name": "Wireless Ergonomic Mouse", "stock": 25, "price": 49.99},
}

class ReservationRequest(BaseModel):
    item_id: str
    quantity: int

@app.get("/health", tags=["Monitoring"])
def health_check():
    return {
        "status": "UP",
        "service": "inventory-service",
        "runtime": f"Python {sys.version.split()[0]}",
        "itemsTracked": len(INVENTORY_DB)
    }

@app.get("/inventory/{item_id}", tags=["Inventory"])
def get_item(item_id: str):
    item = INVENTORY_DB.get(item_id.upper())
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{item_id}' not found in catalog"
        )
    return {
        "itemId": item_id.upper(),
        "name": item["name"],
        "stock": item["stock"],
        "price": item["price"],
        "runtime": f"Python FastAPI ({sys.version.split()[0]})"
    }

@app.post("/inventory/reserve", tags=["Inventory"])
def reserve_item(req: ReservationRequest):
    item_id = req.item_id.upper()
    item = INVENTORY_DB.get(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item '{item_id}' not found in catalog"
        )
    
    if item["stock"] < req.quantity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Insufficient stock for '{item_id}'. Available: {item['stock']}, Requested: {req.quantity}"
        )
    
    item["stock"] -= req.quantity
    return {
        "status": "RESERVED",
        "itemId": item_id,
        "remainingStock": item["stock"]
    }
