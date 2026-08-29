from datetime import datetime
from pydantic import BaseModel

class ShareLinkResponse(BaseModel):
    share_url: str
    expires_at: datetime

class ShareCyclePublicResponse(BaseModel):
    first_name: str
    cycle_length: int
    period_length: int
    current_day: int
    next_period_in: int
    next_period_date_short: str
    next_period_date_long: str
    ovulation_in: int
    ovulation_day: int
    ovulation_date_short: str
    phase: str
    fertility_start_day: int
    fertility_end_day: int
    fertility_start_date_short: str
    fertility_end_date_short: str
    fertility_in: int
    is_fertility_window: bool