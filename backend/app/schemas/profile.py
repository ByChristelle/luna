from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Schema utilisé pour la création
class ProfileCreate(BaseModel):
    last_period_date: str
    cycle_length: str
    period_length: str
    is_regular: str
    goal: str
    age: Optional[int] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    flow: Optional[str] = None
    symptoms: Optional[str] = None

# Schema pour l'utilisateur dans la réponse
class UserInProfile(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

# Schema complet pour la réponse
class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: Optional[int] = None
    last_period_date: str
    cycle_length: str
    period_length: str
    is_regular: str
    goal: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    flow: Optional[str] = None
    symptoms: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserInProfile] = None

    class Config:
        from_attributes = True