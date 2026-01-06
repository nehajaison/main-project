import { ProctorEvent } from "./proctorEvents";

export function emitProctorEvent(event: ProctorEvent) {
  const key = "proctor_events";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(event);
  localStorage.setItem(key, JSON.stringify(existing));

  // backend optional
  fetch("http://localhost:8000/log_event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => {});
}
