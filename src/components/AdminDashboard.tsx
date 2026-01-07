import { useEffect, useState } from "react";

interface ProctorEvent {
  timestamp: number;
  type: string;
  severity: string;
  confidence?: number;
}

export default function AdminDashboard({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [students, setStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [events, setEvents] = useState<ProctorEvent[]>([]);

  // =========================
  // AUTO‑REFRESH STUDENTS
  // =========================
  useEffect(() => {
    const loadStudents = () => {
      fetch("http://localhost:8000/admin/students")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStudents(data);
          } else {
            setStudents(Object.keys(data));
          }
        })
        .catch(() => {});
    };

    loadStudents(); // initial load
    const interval = setInterval(loadStudents, 2000); // every 2s

    return () => clearInterval(interval);
  }, []);

  // =========================
  // AUTO‑REFRESH EVENTS
  // =========================
  useEffect(() => {
    if (!selectedStudent) return;

    const loadEvents = () => {
      fetch(
        `http://localhost:8000/admin/students/${selectedStudent}/events`
      )
        .then((res) => res.json())
        .then(setEvents)
        .catch(() => {});
    };

    loadEvents(); // initial load
    const interval = setInterval(loadEvents, 2000); // every 2s

    return () => clearInterval(interval);
  }, [selectedStudent]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* =========================
          LEFT PANEL — STUDENTS
      ========================= */}
      <div
        style={{
          width: 260,
          borderRight: "1px solid #ddd",
          padding: 12,
          background: "#f8fafc",
        }}
      >
        <h3>Active Students</h3>

        {students.length === 0 && (
          <p style={{ color: "#888" }}>No active students</p>
        )}

        {students.map((s) => (
          <div
            key={s}
            onClick={() => setSelectedStudent(s)}
            style={{
              padding: 8,
              marginBottom: 6,
              cursor: "pointer",
              background:
                selectedStudent === s ? "#e0f2fe" : "transparent",
              borderRadius: 4,
            }}
          >
            {s}
          </div>
        ))}

        <button onClick={onLogout} style={{ marginTop: 20 }}>
          Logout
        </button>
      </div>

      {/* =========================
          RIGHT PANEL — EVENTS
      ========================= */}
      <div style={{ flex: 1, padding: 16 }}>
        <h3>Live Proctoring Timeline</h3>

        {!selectedStudent && <p>Select a student</p>}

        {selectedStudent && events.length === 0 && (
          <p>No events yet</p>
        )}

        {events
          .slice()
          .reverse()
          .map((e, i) => (
            <div
              key={i}
              style={{
                padding: 10,
                marginBottom: 8,
                borderLeft: `4px solid ${
                  e.severity === "high"
                    ? "red"
                    : e.severity === "medium"
                    ? "orange"
                    : "green"
                }`,
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <strong>{e.type}</strong>
              <div>
                {new Date(e.timestamp).toLocaleTimeString()}
              </div>
              <div>Severity: {e.severity}</div>
              {e.confidence !== undefined && (
                <div>Confidence: {e.confidence.toFixed(2)}</div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
