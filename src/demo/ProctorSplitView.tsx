import { useEffect } from "react";
import { useAIMonitoring } from "../ai/hooks/useAIMonitoring";

export default function ProctorSplitView() {
  const { start, containerRef, micActive } = useAIMonitoring("student_001");

  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});
    start();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        ref={containerRef}
        style={{ flex: 1, background: "black" }}
      />
      <div style={{ flex: 1, padding: 20 }}>
        <h2>AI Proctoring Active</h2>
        <p>🎤 Microphone: {micActive ? "ON" : "OFF"}</p>
        <p>⚠ Alerts sent to admin</p>
      </div>
    </div>
  );
}
