from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    age = Column(Integer, nullable=True)
    
    # Données chiffrées stockées en String
    last_period_date = Column(String, nullable=False)
    cycle_length = Column(String, nullable=False)
    period_length = Column(String, nullable=False)
    is_regular = Column(String, nullable=False)
    goal = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    flow = Column(String, nullable=True)
    symptoms = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # AJOUT DE LA RELATION
    user = relationship("User", back_populates="profile")