from ultralytics import YOLO
import cv2
import numpy as np
import base64
import time

# Load YOLOv8 (nano = fast)
model = YOLO("yolov8n.pt")

# ===== CONFIDENCE THRESHOLDS (TUNED) =====
CONF_THRESHOLDS = {
    "person": 0.55,
    "cell phone": 0.40,
    "book": 0.45,
}

# ===== STATE (per student) =====
PERSON_FRAME_COUNT = {}
PERSON_LAST_ALERT = {}

COOLDOWN_SECONDS = 8
REQUIRED_FRAMES = 3  # consecutive frames

def detect_objects(base64_image: str, student_id: str):
    # Decode base64 → image
    img_bytes = base64.b64decode(base64_image)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model(frame, verbose=False)[0]

    persons = []
    phones = []
    books = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        conf = float(box.conf[0])

        if label not in CONF_THRESHOLDS:
            continue
        if conf < CONF_THRESHOLDS[label]:
            continue

        if label == "person":
            persons.append(conf)
        elif label == "cell phone":
            phones.append(conf)
        elif label == "book":
            books.append(conf)

    events = []
    now = time.time()

    # ===== MULTIPLE PEOPLE (STABLE) =====
    if len(persons) > 1:
        PERSON_FRAME_COUNT[student_id] = PERSON_FRAME_COUNT.get(student_id, 0) + 1
    else:
        PERSON_FRAME_COUNT[student_id] = 0

    if PERSON_FRAME_COUNT.get(student_id, 0) >= REQUIRED_FRAMES:
        last = PERSON_LAST_ALERT.get(student_id, 0)
        if now - last > COOLDOWN_SECONDS:
            events.append({
                "type": "possible_multiple_people",
                "confidence": max(persons),
            })
            PERSON_LAST_ALERT[student_id] = now
            PERSON_FRAME_COUNT[student_id] = 0

    # ===== PHONE DETECTION =====
    if phones:
        events.append({
            "type": "phone_detected",
            "confidence": max(phones),
        })

    # ===== BOOK DETECTION =====
    if books:
        events.append({
            "type": "book_detected",
            "confidence": max(books),
        })

    return events
