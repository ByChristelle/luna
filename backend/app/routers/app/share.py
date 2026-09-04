from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta, date

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, decrypt_data
from app.models.user import User
from app.models.profile import Profile
from app.schemas.share import ShareCyclePublicResponse

router = APIRouter(prefix="/share", tags=["Share"])

BASE_WEB_URL = f"{settings.FRONTEND_WEB_BASE_URL.rstrip('/')}/?token="

MONTHS_FR = [
    "janv.", "févr.", "mars", "avr.", "mai", "juin",
    "juil.", "août", "sept.", "oct.", "nov.", "déc."
]


def _fmt_date_short(d: date) -> str:
    """Formatte une date en '21 sept.' en français."""
    return f"{d.day} {MONTHS_FR[d.month - 1]}"


def _fmt_date_long(d: date) -> str:
    """Formatte une date en '21/09/2026'."""
    return d.strftime("%d/%m/%Y")


def _compute_cycle_data_backend(
    last_period_start: date,
    cycle_length: int,
    period_length: int,
) -> dict:
    """
    Miroir backend de la fonction computeCycleData du frontend (cycleStore.js).
    Retourne un dictionnaire avec toutes les valeurs calculées du cycle.
    """
    today = date.today()
    days_since_last = (today - last_period_start).days

    current_day = (days_since_last % cycle_length) + 1

    # Prochaines règles
    if current_day <= period_length:
        next_period_in = period_length - current_day + 1
    else:
        next_period_in = cycle_length - current_day + 1

    cycles_elapsed = days_since_last // cycle_length

    next_period_date = date(
        last_period_start.year,
        last_period_start.month,
        last_period_start.day
    ) + timedelta(days=(cycles_elapsed + 1) * cycle_length)

    # Phase
    if current_day <= period_length:
        phase = "menstruelle"
    elif current_day <= cycle_length - 16:
        phase = "folliculaire"
    elif current_day <= cycle_length - 13:
        phase = "ovulation"
    else:
        phase = "luteale"

    # Ovulation (14 jours avant la fin du cycle)
    ovulation_day = cycle_length - 14
    ovu_end = ovulation_day + 1

    if current_day < ovulation_day:
        ovulation_in = ovulation_day - current_day
    elif current_day <= ovu_end:
        ovulation_in = 0
    else:
        ovulation_in = cycle_length - current_day + ovulation_day

    ovulation_date = date(
        last_period_start.year,
        last_period_start.month,
        last_period_start.day
    ) + timedelta(days=ovulation_day - 1 + cycles_elapsed * cycle_length)

    # Période fertile : 5 jours avant ovulation + 1 jour après
    fertility_start_day = max(1, ovulation_day - 5)
    fertility_end_day = min(cycle_length, ovulation_day + 1)

    fertility_start_date = date(
        last_period_start.year,
        last_period_start.month,
        last_period_start.day
    ) + timedelta(days=fertility_start_day - 1 + cycles_elapsed * cycle_length)

    fertility_end_date = date(
        last_period_start.year,
        last_period_start.month,
        last_period_start.day
    ) + timedelta(days=fertility_end_day - 1 + cycles_elapsed * cycle_length)

    is_fertility_window = fertility_start_day <= current_day <= fertility_end_day

    if is_fertility_window:
        fertility_in = 0
    elif current_day < fertility_start_day:
        fertility_in = fertility_start_day - current_day
    else:
        fertility_in = (cycle_length - current_day) + fertility_start_day

    return {
        "cycle_length": cycle_length,
        "period_length": period_length,
        "current_day": current_day,
        "next_period_in": next_period_in,
        "next_period_date_short": _fmt_date_short(next_period_date),
        "next_period_date_long": _fmt_date_long(next_period_date),
        "ovulation_in": ovulation_in,
        "ovulation_day": ovulation_day,
        "ovulation_date_short": _fmt_date_short(ovulation_date),
        "phase": phase,
        "fertility_start_day": fertility_start_day,
        "fertility_end_day": fertility_end_day,
        "fertility_start_date_short": _fmt_date_short(fertility_start_date),
        "fertility_end_date_short": _fmt_date_short(fertility_end_date),
        "fertility_in": fertility_in,
        "is_fertility_window": is_fertility_window,
    }


@router.post("/generate-link")
def get_or_create_share_link(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Vérifier que l'utilisateur existe bien en BDD
    db_user = db.query(User).filter(User.id == current_user.id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expirée ou utilisateur introuvable. Veuillez vous recharger la page et vous reconnecter."
        )

    # 2. Générer le token s'il n'existe pas
    if not db_user.share_token:
        db_user.share_token = secrets.token_urlsafe(16)
        db.commit()
        db.refresh(db_user)

    # 3. Retourner le lien avec une date d'expiration valide (30 jours)
    return {
        "share_url": f"{BASE_WEB_URL}{db_user.share_token}",
        "expires_at": datetime.utcnow() + timedelta(days=30)
    }


@router.get("/{share_token}", response_model=ShareCyclePublicResponse)
def get_shared_cycle_public(
    share_token: str,
    db: Session = Depends(get_db)
):
    """
    Endpoint PUBLIC — accès SANS connexion.
    Retourne les données calculées du cycle d'une utilisatrice à partir de son share_token.
    """
    # 1. Chercher l'utilisatrice par le token de partage
    db_user = db.query(User).filter(User.share_token == share_token).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lien de partage invalide ou introuvable."
        )

    # 2. Vérifier qu'elle a bien un profil avec des données de cycle
    db_profile = db.query(Profile).filter(Profile.user_id == db_user.id).first()
    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cette utilisatrice n'a pas encore complété son profil de cycle."
        )

    # 3. Parser les champs String en int (règle du projet : strings dans DB)
    #    Attention : ces champs sont CHIFFRES via Fernet, il faut d'abord les dechiffrer !
    try:
        cycle_length_raw = decrypt_data(db_profile.cycle_length) if db_profile.cycle_length else None
        period_length_raw = decrypt_data(db_profile.period_length) if db_profile.period_length else None
        cycle_length = int(cycle_length_raw)
        period_length = int(period_length_raw)
    except (TypeError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Données de cycle invalides ou impossible a dechiffrer pour cette utilisatrice."
        )

    # 4. Parser last_period_date "YYYY-MM-DD" en date (chiffre egalement)
    try:
        last_period_raw = decrypt_data(db_profile.last_period_date) if db_profile.last_period_date else None
        if isinstance(last_period_raw, str):
            last_period_start = datetime.strptime(last_period_raw, "%Y-%m-%d").date()
        else:
            last_period_start = last_period_raw
    except (TypeError, ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Date des dernières règles invalide ou impossible a dechiffrer."
        )

    # 5. Calculer toutes les données du cycle
    cycle_data = _compute_cycle_data_backend(
        last_period_start=last_period_start,
        cycle_length=cycle_length,
        period_length=period_length,
    )

    # 6. Prénom par défaut si absent
    first_name = getattr(db_user, "first_name", None) or getattr(db_user, "name", None) or "Chérie"

    # 7. Retourner la réponse publique
    return ShareCyclePublicResponse(
        first_name=first_name,
        last_period_date=str(last_period_start),
        **cycle_data,
    )