from pydantic import BaseModel, EmailStr

class UserResource(BaseModel):
    id: int
    name: str
    email: EmailStr
    has_completed_onboarding: bool = False

    class Config:
        from_attributes = True

class TokenResource(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResource
