import { useRef, useState, useEffect } from "react";
import { emitProctorEvent } from "../events/proctorEventEmitter";

const Camera = (window as any).Camera;
const FaceMesh = (window as any).FaceMesh;
const Hands = (window as any).Hands;

export function useAIMonitoring(studentId: string) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const yoloCooldownRef = useRef<number>(0);

  const [micActive, setMicActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  async function start() {
    if (streamRef.current) return; // prevent double start

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    streamRef.current = stream;
    setMicActive(stream.getAudioTracks().length > 0);

    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((res) => {
      video.onloadedmetadata = () => {
        video.play();
        res();
      };
    });

    videoRef.current = video;
    setCameraReady(true);

    attachVideo();

    const faceMesh = new FaceMesh({
      locateFile: (f: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
    });
    faceMesh.setOptions({ maxNumFaces: 1 });

    const hands = new Hands({
      locateFile: (f: string) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    });
    hands.setOptions({ maxNumHands: 4 });

    faceMesh.onResults((res: any) => {
      if (!res.multiFaceLandmarks?.length) {
        emitProctorEvent({
          studentId,
          timestamp: Date.now(),
          type: "face_missing",
          severity: "high",
        });
      }
    });

    hands.onResults((res: any) => {
      const count = res.multiHandLandmarks?.length || 0;
      if (count > 2) {
        emitProctorEvent({
          studentId,
          timestamp: Date.now(),
          type: "multiple_hands",
          severity: "high",
        });
      }
    });

    const cam = new Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
        await hands.send({ image: video });
      },
    });

    cam.start();
  }

  function attachVideo() {
    if (containerRef.current && videoRef.current) {
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(videoRef.current);
      videoRef.current.style.width = "100%";
      videoRef.current.style.height = "100%";
      videoRef.current.style.objectFit = "cover";
    }
  }

  // fullscreen
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) {
        emitProctorEvent({
          studentId,
          timestamp: Date.now(),
          type: "fullscreen_exit",
          severity: "high",
        });
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // tab switch
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        emitProctorEvent({
          studentId,
          timestamp: Date.now(),
          type: "tab_switch",
          severity: "medium",
        });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // YOLO polling
  useEffect(() => {
    if (!cameraReady || !videoRef.current) return;

    const interval = setInterval(async () => {
      if (!videoRef.current) return;
      if (Date.now() - yoloCooldownRef.current < 8000) return;

      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);

      const frame = canvas.toDataURL("image/jpeg").split(",")[1];

      const res = await fetch("http://localhost:8000/detect_objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, image: frame }),
      });

      const data = await res.json();
      if (data?.detections?.length) {
        yoloCooldownRef.current = Date.now();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [cameraReady]);

  // CLEANUP
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  return { start, containerRef, micActive, attachVideo };
}
