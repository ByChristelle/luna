from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.push_token import PushToken
from app.models.notification_preference import NotificationPreference
from app.schemas.push_token import PushTokenCreate, PushTokenResponse
from app.schemas.notification_preference import NotificationPreferenceUpdate, NotificationPreferenceResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/register-token", response_model=PushTokenResponse)
def register_push_token(
    data: PushTokenCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Enregistre ou met à jour le push token de l'appareil."""
    existing = db.query(PushToken).filter(PushToken.token == data.token).first()
    if existing:
        existing.user_id = current_user.id
        db.commit()
        db.refresh(existing)
        return existing

    push_token = PushToken(user_id=current_user.id, token=data.token)
    db.add(push_token)
    db.commit()
    db.refresh(push_token)
    return push_token

@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Récupère les préférences de notifications."""
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()

    if not prefs:
        # Créer les préférences par défaut si elles n'existent pas
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)

    return prefs

@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_preferences(
    data: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Met à jour les préférences de notifications."""
    prefs = db.query(NotificationPreference).filter(
        NotificationPreference.user_id == current_user.id
    ).first()

    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prefs, key, value)

    db.commit()
    db.refresh(prefs)
    return prefs
