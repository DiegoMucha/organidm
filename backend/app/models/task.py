"""
Model for tasks entity
"""
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    task_id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    task_group_id: int | None = None
    due_datetime: datetime | None = None
    completed_at: datetime | None = None
    completed: bool = False
    priority: int | None = None
    created_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
