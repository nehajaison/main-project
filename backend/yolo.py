from ultralytics import YOLO
import cv2
import numpy as np
import base64

# Load YOLOv8 (nano = fast)
model = YOLO("yolov8n.pt")

# Classes we care about
CHEAT_OBJECTS = {
    "cell phone": "phone_detected",
    "book": "book_detected",
    "person": "multiple_people"
}

def detect_objects(base64_image: str):
    # Decode base64 → image
    img_bytes = base64.b64decode(base64_image)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model(frame, conf=0.4, verbose=False)[0]

    detections = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]

        if label in CHEAT_OBJECTS:
            detections.append({
                "type": CHEAT_OBJECTS[label],
                "confidence": float(box.conf[0])
            })

    return detections
