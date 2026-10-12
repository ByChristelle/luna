from pydantic import BaseModel
from typing import Optional

class NotificationPreferenceUpdate(BaseModel):
    notify_before_period: Optional[bool] = None
    notify_period_start: Optional[bool] = None
    notify_fertility_start: Optional[bool] = None
    notify_ovulation: Optional[bool] = None
    notify_fertility_end: Optional[bool] = None

class NotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    notify_before_period: bool
    notify_period_start: bool
    notify_fertility_start: bool
    notify_ovulation: bool
    notify_fertility_end: bool

    class Config:
        from_attributes = True
