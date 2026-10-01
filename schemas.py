from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

Status = Literal["todo", "in_progress", "done"]

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None

class TaskStatusUpdate(BaseModel):
    status: Status

class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    status: Status
    created_at: datetime
    description: str | None