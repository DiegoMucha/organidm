"""
Model for event entity
"""
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

class Event(SQLModel, table=True):
    __tablename__ = "events"
    event_id: int | None = Field(default=None, primary_key=True)
    task_group_id: int | None = None
    name: str
    description: str | None = None
    start_datetime: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    finish_datetime: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))