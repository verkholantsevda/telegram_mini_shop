from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
from app.telegram_bot import run_bot_async
from app.database import engine, Base
from app.routers import user, basket, item, category, order, bot_routes
import uvicorn
import os
app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "../static")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(basket.router, prefix="/api/basket", tags=["Basket"])
app.include_router(item.router, prefix="/api/item", tags=["Item"])
app.include_router(category.router, prefix="/api/category", tags=["Category"])
app.include_router(order.router, prefix="/api/order", tags=["Order"])
app.include_router(bot_routes.router, prefix="/api", tags=["send-order"])
app.include_router(bot_routes.router, prefix="/api", tags=["send-order-message"])

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(run_bot_async())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5050, reload=True)