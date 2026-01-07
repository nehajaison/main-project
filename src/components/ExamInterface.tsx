import { useEffect } from "react";
import { useExam } from "../context/ExamContext";
import ProctorSplitView from "../demo/ProctorSplitView";
import MonacoEditorScreen from "../demo/MonacoEditorScreen";
import { useAIMonitoring } from "../ai/hooks/useAIMonitoring";

export default function ExamInterface({ onLogout }: { onLogout: () => void }) {
  const { examState } = useExam();

  const {
    start,
    containerRef,
    micActive,
    attachVideo,
  } = useAIMonitoring("student_001");

  // 🔥 THIS WAS MISSING / BROKEN
  useEffect(() => {
    start(); // camera + mic starts ONCE
    document.documentElement.requestFullscreen().catch(() => {});
  }, []);

  if (examState.mode === "interview") {
    return (
      <ProctorSplitView
        containerRef={containerRef}
        micActive={micActive}
        attachVideo={attachVideo}
      />
    );
  }

  if (examState.mode === "coding") {
    return (
      <MonacoEditorScreen
        containerRef={containerRef}
        attachVideo={attachVideo}
      />
    );
  }

  return <button onClick={onLogout}>Logout</button>;
}
