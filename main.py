from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Task
from schemas import TaskCreate, TaskRead, TaskStatusUpdate

#Base.metadata.create_all(bind=engine)  # temporary - Alembic takes over later

app = FastAPI(title="Task Tracker")

@app.post("/tasks", response_model=TaskRead, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(title=payload.title, description=payload.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.get("/tasks", response_model=list[TaskRead])
def list_tasks(db: Session = Depends(get_db)):
    return db.scalars(select(Task).order_by(Task.id)).all()

@app.get("/tasks/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.patch("/tasks/{task_id}/status", response_model=TaskRead)
def update_status(task_id: int, payload: TaskStatusUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = payload.status
    db.commit()
    db.refresh(task)
    return task