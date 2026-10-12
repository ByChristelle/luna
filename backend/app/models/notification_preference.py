from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    # Préférences de notifications
    notify_before_period = Column(Boolean, default=True)   # J-2 avant les règles
    notify_period_start = Column(Boolean, default=True)    # Début des règles
    notify_fertility_start = Column(Boolean, default=True) # Début période fertile
    notify_ovulation = Column(Boolean, default=True)       # Jour d'ovulation
    notify_fertility_end = Column(Boolean, default=False)  # Fin période fertile

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notification_preferences")
