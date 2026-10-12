from pydantic import BaseModel

class PushTokenCreate(BaseModel):
    token: str

class PushTokenResponse(BaseModel):
    id: int
    user_id: int
    token: str

    class Config:
        from_attributes = True
