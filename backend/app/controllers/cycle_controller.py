from sqlalchemy.orm import Session
from datetime import timedelta, date
from app.models.cycle import Cycle
from app.models.profile import Profile
from app.schemas.cycle import CycleCreate
from app.core.security import decrypt_data, encrypt_data

ENCRYPTED_FIELDS = [
    "period_start_date", "period_end_date", "cycle_length",
    "period_length", "ovulation_date", "fertility_start_date", "fertility_end_date"
]

def _encrypt_cycle_fields(data: dict) -> dict:
    for field in ENCRYPTED_FIELDS:
        if field in data and data[field] is not None:
            data[field] = encrypt_data(str(data[field]))
    return data

def _decrypt_cycle(cycle: Cycle) -> Cycle:
    if not cycle:
        return cycle
    for field in ENCRYPTED_FIELDS:
        value = getattr(cycle, field, None)
        if value is not None:
            try:
                setattr(cycle, field, decrypt_data(value))
            except Exception:
                pass
    return cycle

def _compute_cycle(period_start_date: date, cycle_length: int, period_length: int) -> dict:
    period_end_date = period_start_date + timedelta(days=period_length - 1)
    ovulation_date = period_start_date + timedelta(days=cycle_length - 14)
    fertility_start_date = ovulation_date - timedelta(days=3)
    fertility_end_date = ovulation_date + timedelta(days=2)

    return {
        "period_end_date": str(period_end_date),
        "ovulation_date": str(ovulation_date),
        "fertility_start_date": str(fertility_start_date),
        "fertility_end_date": str(fertility_end_date),
    }

def create_cycle(db: Session, data: CycleCreate, user_id: int):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not db_profile:
        return None

    cycle_length = int(decrypt_data(db_profile.cycle_length))
    period_length = int(decrypt_data(db_profile.period_length))

    computed = _compute_cycle(data.period_start_date, cycle_length, period_length)

    raw_data = {
        "period_start_date": str(data.period_start_date),
        "period_length": str(period_length),
        "cycle_length": str(cycle_length),
        **computed,
    }

    encrypted_data = _encrypt_cycle_fields(raw_data)

    db_cycle = Cycle(user_id=user_id, **encrypted_data)
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)

    return _decrypt_cycle(db_cycle)

def get_cycles_by_user(db: Session, user_id: int):
    cycles = (
        db.query(Cycle)
        .filter(Cycle.user_id == user_id)
        .order_by(Cycle.created_at.desc())
        .all()
    )
    return [_decrypt_cycle(c) for c in cycles]

def get_latest_cycle(db: Session, user_id: int):
    cycle = (
        db.query(Cycle)
        .filter(Cycle.user_id == user_id)
        .order_by(Cycle.created_at.desc())
        .first()
    )
    return _decrypt_cycle(cycle)
