from typing import Annotated
from datetime import datetime, timezone
from fastapi import APIRouter, Query
from schemas.task_group import TaskGroupCreate, TaskGroupRead, TaskGroupUpdate
from models.task_group import TaskGroup
from database import SessionDep
from sqlmodel import select

router = APIRouter()

@router.get("/task_groups/", response_model=list[TaskGroupRead])
async def get_task_groups(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    task_groups = session.exec(select(TaskGroup).offset(offset).limit(limit)).all()
    return task_groups

@router.get("/task_groups/{task_group_id}", response_model=TaskGroupRead)
async def get_task_group_by_id(task_group_id: int, session: SessionDep):
    task_group = session.get(TaskGroup, task_group_id)
    return task_group

@router.post("/task_groups/", response_model=TaskGroupRead)
async def create_task_group(task_group: TaskGroupCreate, session: SessionDep):
    db_task_group = TaskGroup.model_validate(task_group)
    session.add(db_task_group)
    session.commit()
    session.refresh(db_task_group)
    return db_task_group

@router.patch("/task_groups/{task_group_id}", response_model=TaskGroupRead)
async def update_task_group(session: SessionDep, task_group_id: int, task_group: TaskGroupUpdate):
    task_group_db = session.get(TaskGroup, task_group_id)
    if not task_group_db:
        return 0
    task_group_data = task_group.model_dump(exclude_unset=True)
    task_group_db.sqlmodel_update(task_group_data)
    task_group_db.updated_at = datetime.now(timezone.utc)
    session.add(task_group_db)
    session.commit()
    session.refresh(task_group_db)
    return task_group_db

@router.delete("/task_groups/{task_group_id}")
async def delete_task_group(task_group_id: int, session: SessionDep):
    task_group = session.get(TaskGroup, task_group_id)
    if not task_group:
        return 0
    session.delete(task_group)
    session.commit()
    return {"ok": True}
