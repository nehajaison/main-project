import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useAIMonitoring } from "../ai/hooks/useAIMonitoring";

export default function MonacoEditorScreen() {
  const { isActive, startMonitoring, getVideoElement } = useAIMonitoring();
  const camRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) startMonitoring();
    const videoEl = getVideoElement();
    if (videoEl && camRef.current && !camRef.current.contains(videoEl)) {
      camRef.current.innerHTML = "";
      camRef.current.appendChild(videoEl);
      videoEl.style.width = "150px";
      videoEl.style.height = "120px";
      videoEl.style.objectFit = "contain";
      videoEl.style.border = "2px solid white";
      videoEl.style.borderRadius = "6px";
    }
  }, [isActive]);

  return (
    <div className="w-screen h-screen relative">
      <Editor
        height="100vh"
        defaultLanguage="javascript"
        theme="vs-dark"
        defaultValue="// start typing here..."
      />

      {/* Floating webcam preview */}
      <div
        ref={camRef}
        className="absolute bottom-4 right-4 bg-black rounded overflow-hidden"
      />
    </div>
  );
}
