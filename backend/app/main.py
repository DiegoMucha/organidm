from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.tasks import router as tasks_router
from routers.task_groups import router as task_groups_router
from routers.events import router as events_router
from database import create_db_and_tables
app = FastAPI()

app.include_router(tasks_router, prefix="/api")
app.include_router(task_groups_router, prefix="/api")
app.include_router(events_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/api")
async def root():
    return {"message": "Hi blud"}