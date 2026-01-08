import { RefObject, useEffect } from "react";
import { useExam } from "../context/ExamContext";

export default function ProctorSplitView({
  containerRef,
  micActive,
  attachVideo,
}: {
  containerRef: RefObject<HTMLDivElement>;
  micActive: boolean;
  attachVideo: () => void;
}) {
  const { switchToCoding } = useExam();


  useEffect(() => {
    attachVideo();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* CAMERA */}
      <div
        ref={containerRef}
        style={{ flex: 1, background: "black" }}
      />

      {/* INTERVIEW PANEL */}
      <div style={{ flex: 1, padding: 20 }}>
        <h2>AI Proctoring Active</h2>
        <p>🎤 Microphone: {micActive ? "ON" : "OFF"}</p>

        <button onClick={switchToCoding} style={{ marginTop: 20 }}>
          Start Coding
        </button>
      </div>
    </div>
  );
}
