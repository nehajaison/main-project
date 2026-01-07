EVENTS = {}

def add_event(student_id, event):
    if student_id not in EVENTS:
        EVENTS[student_id] = []
    EVENTS[student_id].append(event)

def get_all_students():
    return list(EVENTS.keys())

def get_events(student_id):
    return EVENTS.get(student_id, [])
