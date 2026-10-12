from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    period_start_date = Column(String, nullable=False)
    period_end_date = Column(String, nullable=False)
    cycle_length = Column(String, nullable=False)
    period_length = Column(String, nullable=False)
    ovulation_date = Column(String, nullable=False)
    fertility_start_date = Column(String, nullable=False)
    fertility_end_date = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="cycles")
