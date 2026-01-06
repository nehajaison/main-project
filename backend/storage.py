from typing import Dict, List

EVENT_STORE: Dict[str, List[dict]] = {}

def add_event(student_id: str, event: dict):
    if student_id not in EVENT_STORE:
        EVENT_STORE[student_id] = []
    EVENT_STORE[student_id].append(event)

def get_events(student_id: str):
    return EVENT_STORE.get(student_id, [])

def get_all_students():
    return [
        {
            "studentId": sid,
            "alerts": len(events),
            "high": len([e for e in events if e["severity"] == "high"]),
            "medium": len([e for e in events if e["severity"] == "medium"]),
        }
        for sid, events in EVENT_STORE.items()
    ]
