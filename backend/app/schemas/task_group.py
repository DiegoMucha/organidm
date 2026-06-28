from pydantic import BaseModel
from datetime import datetime

# CRUD

# Create task response model
class TaskGroupCreate(BaseModel):
    name: str
    description: str | None = None

# Read task response model
class TaskGroupRead(BaseModel):
    task_group_id: int
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

# Update task response model
class TaskGroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

