import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAIMonitoring } from "../ai/hooks/useAIMonitoring";

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "JavaScript", value: "javascript" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

export default function MonacoEditorScreen() {
  const { start, containerRef, micActive } =
    useAIMonitoring("student_001");

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour

  // =========================
  // START CAMERA + FULLSCREEN
  // =========================
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    start();
  }, []);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const runCode = async () => {
    setOutput("Running...");
    const res = await fetch("http://localhost:8000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });
    const data = await res.json();
    setOutput(data.stdout || data.stderr || "");
  };

  const submitCode = () => {
    alert("Code submitted successfully");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ height: "100vh", background: "#0f172a", color: "#fff" }}>
      {/* =========================
          TOP BAR
      ========================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 16px",
          background: "#020617",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: "#020617",
            color: "#fff",
            border: "1px solid #334155",
            padding: "6px 10px",
            marginRight: 12,
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <button onClick={runCode} style={btnStyle("#22c55e")}>
          ▶ Run
        </button>
        <button onClick={submitCode} style={btnStyle("#3b82f6")}>
          📤 Submit
        </button>

        <div style={{ marginLeft: "auto" }}>
          ⏱ Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      {/* =========================
          EDITOR + OUTPUT
      ========================= */}
      <div style={{ display: "flex", height: "calc(100vh - 48px)" }}>
        <div style={{ flex: 3 }}>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            background: "#020617",
            borderLeft: "1px solid #1e293b",
            padding: 12,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>Output</strong>
          <pre>{output}</pre>
        </div>
      </div>

      {/* =========================
          FLOATING CAMERA PREVIEW
      ========================= */}
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 220,
          height: 160,
          borderRadius: 8,
          overflow: "hidden",
          border: "2px solid red",
          background: "#000",
          zIndex: 9999,
        }}
      />

      {/* MIC STATUS */}
      <div
        style={{
          position: "fixed",
          bottom: 180,
          right: 16,
          fontSize: 12,
          color: micActive ? "#22c55e" : "#ef4444",
        }}
      >
        🎤 {micActive ? "Mic ON" : "Mic OFF"}
      </div>
    </div>
  );
}

function btnStyle(color: string) {
  return {
    background: color,
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    marginRight: 8,
    cursor: "pointer",
  };
}
