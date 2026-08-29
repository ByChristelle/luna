from sqlalchemy.orm import Session, joinedload
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate
from app.core.security import encrypt_data, decrypt_data

ENCRYPTED_FIELDS = ["last_period_date", "cycle_length", "period_length", "is_regular", "goal", "flow", "symptoms"]

def _encrypt_profile_fields(data: dict) -> dict:
    for field in ENCRYPTED_FIELDS:
        if field in data and data[field] is not None:
            data[field] = encrypt_data(str(data[field]))
    return data

def _decrypt_profile_fields(profile: Profile) -> Profile:
    if not profile:
        return profile
    for field in ENCRYPTED_FIELDS:
        value = getattr(profile, field, None)
        if value is not None:
            try:
                setattr(profile, field, decrypt_data(value))
            except Exception:
                pass
    return profile

def create_profile(db: Session, profile: ProfileCreate, user_id: int):
    data = profile.model_dump()
    data = _encrypt_profile_fields(data)
    db_profile = Profile(user_id=user_id, **data)
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    db.refresh(db_profile, ["user"])

    return db_profile

def get_profile_by_user_id(db: Session, user_id: int):
    db_profile = (
        db.query(Profile)
        .options(joinedload(Profile.user))
        .filter(Profile.user_id == user_id)
        .first()
    )
    return _decrypt_profile_fields(db_profile)

def update_profile(db: Session, user_id: int, profile_data: ProfileCreate):
    db_profile = get_profile_by_user_id(db, user_id)

    if not db_profile:
        return None

    update_data = profile_data.model_dump(exclude_unset=True)
    update_data = _encrypt_profile_fields(update_data)

    for key, value in update_data.items():
        setattr(db_profile, key, value)

    db.commit()
    db.refresh(db_profile)

    return _decrypt_profile_fields(db_profile)

def create_or_update_profile(db: Session, profile_data: ProfileCreate, user_id: int):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()

    if db_profile:
        update_data = profile_data.model_dump(exclude_unset=True)
        update_data = _encrypt_profile_fields(update_data)
        for key, value in update_data.items():
            setattr(db_profile, key, value)
    else:
        data = profile_data.model_dump()
        data = _encrypt_profile_fields(data)
        db_profile = Profile(user_id=user_id, **data)
        db.add(db_profile)

    db.commit()
    db.refresh(db_profile)
    return _decrypt_profile_fields(db_profile)

def delete_profile(db: Session, user_id: int):
    db_profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if db_profile:
        db.delete(db_profile)
        db.commit()
        return True
    return False