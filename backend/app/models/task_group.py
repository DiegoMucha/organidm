"""
Model for task_groups entity
"""
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

class TaskGroup(SQLModel, table=True):
    __tablename__ = "task_groups"
    task_group_id: int | None = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    icon_placeholder: str = "inbox"
    color: str = "#2563eb"
    created_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda:datetime.now(timezone.utc))
