from pydantic import BaseModel
from datetime import datetime

# CRUD

# Create task response model
class TaskCreate(BaseModel):
    name: str
    description: str | None = None
    priority: int | None = None
    due_datetime: datetime | None = None
    task_group_id: int | None = None

# Read task response model
class TaskRead(BaseModel):
    task_id: int
    name: str
    description: str | None
    completed_at: datetime | None
    completed: bool
    priority: int | None
    due_datetime: datetime | None
    task_group_id: int | None
    created_at: datetime
    updated_at: datetime

# Update task response model
class TaskUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    completed: bool | None = None
    completed_at: datetime | None = None
    priority: int | None = None
    due_datetime: datetime | None = None
    task_group_id: int | None = None
