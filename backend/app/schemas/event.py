from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal

EventRecurrenceType = Literal["once", "daily", "weekdays", "custom"]

# CRUD

# Create task response model
class EventCreate(BaseModel):
    name: str
    description: str | None = None
    task_group_id: int | None = None
    start_datetime: datetime
    finish_datetime: datetime
    recurrence_type: EventRecurrenceType = "once"
    recurrence_days: list[int] = Field(default_factory=list)

# Read task response model
class EventRead(BaseModel):
    event_id: int
    name: str
    description: str | None
    task_group_id: int | None
    start_datetime: datetime
    finish_datetime: datetime
    recurrence_type: EventRecurrenceType
    recurrence_days: list[int]
    created_at: datetime

# Update task response model
class EventUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    task_group_id: int | None = None
    start_datetime: datetime | None = None
    finish_datetime: datetime | None = None
    recurrence_type: EventRecurrenceType | None = None
    recurrence_days: list[int] | None = None
