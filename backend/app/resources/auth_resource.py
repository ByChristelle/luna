from pydantic import BaseModel, EmailStr

class UserResource(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class TokenResource(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResource