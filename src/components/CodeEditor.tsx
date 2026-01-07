import Editor from "@monaco-editor/react";
import { LANGUAGES } from "../constants/languages";

export default function CodeEditor({
  language,
  code,
  onChange,
}: {
  language: keyof typeof LANGUAGES;
  code: string;
  onChange: (v: string) => void;
}) {
  return (
    <Editor
      height="100%"
      language={LANGUAGES[language].monaco}
      value={code}
      theme="vs-dark"
      onChange={(v) => onChange(v || "")}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}
