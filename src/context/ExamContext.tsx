import { createContext, useContext, useState, ReactNode } from "react";

type ExamMode = "interview" | "coding" | "ended";

interface CodeSubmission {
  id: string;
  code: string;
  language: string;
  timestamp: Date;
}

interface ExamState {
  mode: ExamMode;
  currentQuestion: number;
  timeRemaining: number;
  codeSubmissions: CodeSubmission[];
}

interface ExamContextType {
  examState: ExamState;
  startInterview: () => void;
  switchToCoding: () => void;
  endExam: () => void;
  submitCode: (code: string, language: string) => void;
  updateTimeRemaining: (time: number) => void;
}

const ExamContext = createContext<ExamContextType | null>(null);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [examState, setExamState] = useState<ExamState>({
    mode: "interview",
    currentQuestion: 1,
    timeRemaining: 3600,
    codeSubmissions: [],
  });

  const startInterview = () => {
    setExamState((p) => ({ ...p, mode: "interview" }));
  };

  const switchToCoding = () => {
    setExamState((p) => ({ ...p, mode: "coding" }));
  };

  const endExam = () => {
    setExamState((p) => ({ ...p, mode: "ended" }));
  };

  const submitCode = (code: string, language: string) => {
    setExamState((p) => ({
      ...p,
      codeSubmissions: [
        ...p.codeSubmissions,
        {
          id: Date.now().toString(),
          code,
          language,
          timestamp: new Date(),
        },
      ],
    }));
  };

  const updateTimeRemaining = (time: number) => {
    setExamState((p) => ({ ...p, timeRemaining: time }));
  };

  return (
    <ExamContext.Provider
      value={{
        examState,
        startInterview,
        switchToCoding,
        endExam,
        submitCode,
        updateTimeRemaining,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) {
    throw new Error("useExam must be used inside ExamProvider");
  }
  return ctx;
}
