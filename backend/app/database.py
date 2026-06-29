import os
from typing import Annotated
from sqlmodel import create_engine, SQLModel, Session
from fastapi import Depends
from sqlalchemy import text

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://organidm:organidm@localhost:5432/organidm",
)
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    add_missing_columns()

def add_missing_columns():
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                ALTER TABLE task_groups
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE task_groups
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE task_groups
                ADD COLUMN IF NOT EXISTS icon_placeholder TEXT NOT NULL DEFAULT 'inbox'
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE task_groups
                ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#2563eb'
                """
            )
        )

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]
