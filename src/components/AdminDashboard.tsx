import { useEffect, useState } from "react";

interface StudentSummary {
  studentId: string;
  alerts: number;
  high: number;
  medium: number;
}

interface Event {
  timestamp: number;
  type: string;
  severity: string;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/admin/students")
      .then(res => res.json())
      .then(setStudents);
  }, []);

  const loadEvents = (studentId: string) => {
    setSelected(studentId);
    fetch(`http://localhost:8000/admin/students/${studentId}/events`)
      .then(res => res.json())
      .then(setEvents);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* LEFT: STUDENTS */}
      <div style={{ width: 350, borderRight: "1px solid #ccc", padding: 16 }}>
        <h2>Active Students</h2>
        {students.map(s => (
          <div
            key={s.studentId}
            style={{
              padding: 12,
              marginBottom: 8,
              border: "1px solid #ddd",
              cursor: "pointer"
            }}
            onClick={() => loadEvents(s.studentId)}
          >
            <strong>{s.studentId}</strong>
            <div>Total Alerts: {s.alerts}</div>
            <div>High: {s.high} | Medium: {s.medium}</div>
          </div>
        ))}
      </div>

      {/* RIGHT: EVENTS */}
      <div style={{ flex: 1, padding: 16 }}>
        <h2>Proctoring Timeline</h2>
        {!selected && <p>Select a student</p>}

        {events.map((e, i) => (
          <div
            key={i}
            style={{
              padding: 10,
              marginBottom: 6,
              background: e.severity === "high" ? "#ffe5e5" : "#fff7cc",
              borderLeft: `5px solid ${
                e.severity === "high" ? "red" : "orange"
              }`
            }}
          >
            <strong>{e.type}</strong>
            <div>{new Date(e.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
