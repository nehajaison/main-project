export type ProctorSeverity = "low" | "medium" | "high";

export interface ProctorEvent {
  studentId: string;
  timestamp: number;
  type:
    | "face_missing"
    | "multiple_hands"
    | "fullscreen_exit"
    | "tab_switch";
  severity: ProctorSeverity;
}
