from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    share_token = Column(String(255), nullable=True, unique=True, index=True)

    profile = relationship("Profile", back_populates="user", uselist=False)