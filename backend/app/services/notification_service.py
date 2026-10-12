from datetime import date, timedelta
from sqlalchemy.orm import Session
import httpx

from app.core.database import SessionLocal
from app.core.security import decrypt_data
from app.models.user import User
from app.models.profile import Profile
from app.models.push_token import PushToken
from app.models.notification_preference import NotificationPreference

def _compute_cycle_day(last_period_date: date, cycle_length: int) -> int:
    """Calcule le jour actuel du cycle."""
    today = date.today()
    days_since = (today - last_period_date).days
    return (days_since % cycle_length) + 1

async def send_expo_push(token: str, title: str, body: str):
    """Envoie une notification push via Expo."""
    async with httpx.AsyncClient() as client:
        await client.post(
            "https://exp.host/--/api/v2/push/send",
            json={
                "to": token,
                "title": title,
                "body": body,
                "sound": "default",
                "priority": "high",
            },
            headers={"Content-Type": "application/json"},
        )

async def check_and_send_notifications():
    """
    Tâche planifiée — vérifie les cycles de toutes les utilisatrices
    et envoie les notifications selon leurs préférences.
    """
    db: Session = SessionLocal()
    try:
        users = db.query(User).all()

        for user in users:
            profile = db.query(Profile).filter(Profile.user_id == user.id).first()
            if not profile:
                continue

            # Déchiffrer les données du profil
            try:
                last_period_raw = decrypt_data(profile.last_period_date)
                cycle_length = int(decrypt_data(profile.cycle_length))
                period_length = int(decrypt_data(profile.period_length))
                last_period_date = date.fromisoformat(last_period_raw)
            except Exception:
                continue

            # Récupérer les préférences
            prefs = db.query(NotificationPreference).filter(
                NotificationPreference.user_id == user.id
            ).first()
            if not prefs:
                continue

            # Récupérer les push tokens
            tokens = db.query(PushToken).filter(PushToken.user_id == user.id).all()
            if not tokens:
                continue

            # Calculer le jour du cycle
            current_day = _compute_cycle_day(last_period_date, cycle_length)
            ovulation_day = cycle_length - 14
            fertility_start = ovulation_day - 3
            fertility_end = ovulation_day + 2
            days_before_period = cycle_length - current_day

            # Déterminer quelle notification envoyer
            notification = None

            if prefs.notify_before_period and days_before_period == 2:
                notification = ("Luna 🩸", "Tes règles arrivent dans 2 jours. Prends soin de toi 💕")

            elif prefs.notify_period_start and current_day == 1:
                notification = ("Luna 🌸", "Ton nouveau cycle commence aujourd'hui. Bon courage 💕")

            elif prefs.notify_fertility_start and current_day == fertility_start:
                notification = ("Luna 💙", "Ta période fertile commence aujourd'hui !")

            elif prefs.notify_ovulation and current_day == ovulation_day:
                notification = ("Luna ✨", "Tu es en ovulation aujourd'hui.")

            elif prefs.notify_fertility_end and current_day == fertility_end:
                notification = ("Luna 💙", "Ta période fertile se termine demain.")

            # Envoyer la notification sur tous les appareils
            if notification:
                for token in tokens:
                    await send_expo_push(token.token, notification[0], notification[1])

    finally:
        db.close()
