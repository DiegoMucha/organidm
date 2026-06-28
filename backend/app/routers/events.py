from typing import Annotated
from fastapi import APIRouter, Query
from database import SessionDep
from models.event import Event
from schemas.event import EventCreate, EventRead, EventUpdate
from sqlmodel import select
router = APIRouter()

@router.get("/events/", response_model=list[EventRead])
async def get_events(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100):
    events = session.exec(select(Event).offset(offset).limit(limit)).all()
    return events

@router.get("/events/{event_id}", response_model=EventRead)
async def get_event_by_id(session: SessionDep, event_id: int):
    event = session.get(Event, event_id)
    return event

@router.post("/events/", response_model=EventRead)
async def create_event(session: SessionDep, event: EventCreate):
    db_event = Event.model_validate(event)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event

@router.patch("/events/{event_id}", response_model=EventRead)
async def update_event(session: SessionDep, event_id: int, event: EventUpdate):
    db_event = session.get(Event, event_id)
    if not db_event:
        return 0
    event_data = event.model_dump(exclude_unset=True)
    db_event.sqlmodel_update(event_data)
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event

@router.delete("/events/{event_id}")
async def delete_event(session: SessionDep, event_id: int):
    event = session.get(Event, event_id)
    if not event:
        return 0
    session.delete(event)
    session.commit()
    return {"ok": True}
