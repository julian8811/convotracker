from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    convocatoria_id = Column(Integer, ForeignKey("convocatorias.id"), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    # Unique constraint to prevent duplicate favorites
    __table_args__ = (
        UniqueConstraint('user_id', 'convocatoria_id', name='uq_user_convocatoria'),
    )

    def __repr__(self):
        return f"<Favorite user_id={self.user_id} convocatoria_id={self.convocatoria_id}>"
