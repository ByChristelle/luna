from fastapi import APIRouter
from app.routers.app.auth_router import router as auth_router
from app.routers.app.profile_router import router as profile_router
from app.routers.app.share import router as share_router
from app.routers.app.cycle_router import router as cycle_router
from app.routers.app.ai_router import router as ai_router
from app.routers.app.notification_router import router as notification_router


api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(profile_router)
api_router.include_router(share_router)
api_router.include_router(cycle_router)
api_router.include_router(ai_router)
api_router.include_router(notification_router)