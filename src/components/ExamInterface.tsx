import React, { useState } from "react";
import ProctorSplitView from "../demo/ProctorSplitView";
import MonacoEditorScreen from "../demo/MonacoEditorScreen";

export default function ExamInterface() {
  const [phase, setPhase] = useState<"proctor" | "coding">("proctor");

  return phase === "proctor" ? (
    <ProctorSplitView onStartCoding={() => setPhase("coding")} />
  ) : (
    <MonacoEditorScreen />
  );
}