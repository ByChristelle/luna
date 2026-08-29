from fastapi import APIRouter
from app.routers.app.auth_router import router as auth_router
from app.routers.app.profile_router import router as profile_router
from app.routers.app.share import router as share_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(share_router)