from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers.api import api_router
from app.models.user import User
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.notification_service import check_and_send_notifications

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler pour les notifications — tourne chaque jour à 8h00
scheduler = AsyncIOScheduler()
scheduler.add_job(
    check_and_send_notifications,
    trigger="cron",
    hour=8,
    minute=0,
    id="daily_notifications",
)

@app.on_event("startup")
async def startup():
    scheduler.start()

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()

@app.get("/")
def read_root():
    return {"status": "API en ligne"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend Luna connecté!"}
