from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine
from app.routers.api import api_router
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(api_router)

# Autorise React à communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # À restreindre en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "API en ligne"}

@app.get("/api/health")
def health_check():
    return {"status": "ok",
            "message": "Backend Luna connecté!"}