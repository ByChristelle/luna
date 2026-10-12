from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class CycleCreate(BaseModel):
    period_start_date: date

class CycleResponse(BaseModel):
    id: int
    user_id: int
    period_start_date: date
    period_end_date: date
    cycle_length: int
    period_length: int
    ovulation_date: date
    fertility_start_date: date
    fertility_end_date: date
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
