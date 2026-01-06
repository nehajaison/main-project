from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from storage import add_event, get_events, get_all_students

app = FastAPI()

# ✅ CORS FIX (THIS IS REQUIRED)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProctorEvent(BaseModel):
    studentId: str
    timestamp: int
    type: str
    severity: str

@app.post("/log_event")
def log_event(event: ProctorEvent):
    add_event(event.studentId, event.dict())
    return {"status": "ok"}

@app.get("/admin/students")
def list_students():
    return get_all_students()

@app.get("/admin/students/{student_id}/events")
def student_events(student_id: str):
    return get_events(student_id)
from yolo import detect_objects
from fastapi import Body

@app.post("/detect_objects")
def detect_objects_api(payload: dict = Body(...)):
    """
    payload = {
      studentId: str,
      image: base64_string
    }
    """
    detections = detect_objects(payload["image"])

    for d in detections:
        add_event(payload["studentId"], {
            "studentId": payload["studentId"],
            "timestamp": int(__import__("time").time() * 1000),
            "type": d["type"],
            "severity": "high"
        })

    return {"detections": detections}
