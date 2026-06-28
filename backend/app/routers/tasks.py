from typing import Annotated
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from schemas.task import TaskCreate, TaskRead, TaskUpdate
from models.task import Task
from database import SessionDep
from sqlmodel import select

router = APIRouter()

@router.get("/tasks/", response_model=list[TaskRead])
async def get_tasks(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    tasks = session.exec(select(Task).offset(offset).limit(limit)).all()
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskRead)
async def get_task_by_id(session: SessionDep, task_id: int):
    task = session.get(Task, task_id)
    return task

@router.post("/tasks/", response_model=TaskRead)
async def create_task(session: SessionDep, task: TaskCreate):
    db_task = Task.model_validate(task)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.patch("/tasks/{task_id}", response_model=TaskRead)
async def update_task(session: SessionDep, task_id: int, task: TaskUpdate):
    task_db = session.get(Task, task_id)
    if not task_db:
        return 0
    task_data = task.model_dump(exclude_unset=True)
    task_db.sqlmodel_update(task_data)
    task_db.updated_at = datetime.now(timezone.utc)
    session.add(task_db)
    session.commit()
    session.refresh(task_db)
    return task_db

@router.delete("/tasks/{task_id}")
async def delete_task(session: SessionDep, task_id: int):
    task = session.get(Task, task_id)
    if not task:
        return 0
    session.delete(task)
    session.commit()
    return {"ok": True}
