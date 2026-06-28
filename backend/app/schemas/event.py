from pydantic import BaseModel
from datetime import datetime, timezone

# CRUD

# Create task response model
class EventCreate(BaseModel):
    name: str
    description: str | None = None
    task_group_id: int | None = None
    start_datetime: datetime
    finish_datetime: datetime

# Read task response model
class EventRead(BaseModel):
    event_id: int
    name: str
    description: str | None
    task_group_id: int | None
    start_datetime: datetime
    finish_datetime: datetime
    created_at: datetime

# Update task response model
class EventUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    task_group_id: int | None = None
    start_datetime: datetime | None = None
    finish_datetime: datetime | None = None