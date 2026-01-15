"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import SettingsMenu from "@/components/SettingsMenu";
import { translations } from "@/translations";
import { Upload, Trash2, Copy, Check, FileJson, Download, Wand2 } from "lucide-react";

const JsonView = dynamic(() => import("@/components/JsonView"), {
  ssr: false,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      const storedLanguage = localStorage.getItem("language");
      const browserLanguage = navigator.language.split("-")[0];
      const supportedLanguages = ["en", "es", "fr", "de", "pt"];

      return (
        storedLanguage ||
        (supportedLanguages.includes(browserLanguage) ? browserLanguage : "en")
      );
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleJsonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setJsonInput(value);
      setHasChanges(false);

      try {
        if (value.trim() === "") {
          setParsedJson(null);
          setError(null);
          return;
        }
        const parsed = JSON.parse(value);
        setParsedJson(parsed);
        setError(null);
      } catch {
        setError(t.invalidJson);
        setParsedJson(null);
      }
    },
    [t.invalidJson]
  );

  // Handle updates from the visual editor
  const handleJsonUpdate = useCallback((newData: unknown) => {
    setParsedJson(newData);
    const formatted = JSON.stringify(newData, null, 2);
    setJsonInput(formatted);
    setHasChanges(true);
    setError(null);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file || !file.name.toLowerCase().endsWith(".json")) {
        setError(t.uploadJsonError || "Please upload a JSON file");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(t.fileTooLarge || "File is too large (max 10MB)");
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setJsonInput(formatted);
          setParsedJson(parsed);
          setError(null);
          setHasChanges(false);
        } catch {
          setError(t.invalidJson);
          setParsedJson(null);
        }
      };
      reader.readAsText(file);
    },
    [t.invalidJson, t.uploadJsonError, t.fileTooLarge]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const formatJson = useCallback(() => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setParsedJson(parsed);
      setError(null);
    } catch {
      setError(t.invalidJson);
    }
  }, [jsonInput, t.invalidJson]);

  const minifyJson = useCallback(() => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonInput(minified);
      setParsedJson(parsed);
      setError(null);
    } catch {
      setError(t.invalidJson);
    }
  }, [jsonInput, t.invalidJson]);

  const clearJson = useCallback(() => {
    setJsonInput("");
    setParsedJson(null);
    setError(null);
    setFileName("");
    setHasChanges(false);
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!parsedJson) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = JSON.stringify(parsedJson, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [parsedJson]);

  const handleExport = useCallback(() => {
    if (!parsedJson) return;
    const blob = new Blob([JSON.stringify(parsedJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "exported-json.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [parsedJson, fileName]);

  const getStatsText = useCallback(() => {
    if (!parsedJson) return null;
    const jsonStr = JSON.stringify(parsedJson);
    const keys = countKeys(parsedJson);
    return `${jsonStr.length} ${t.characters || "chars"} • ${keys} ${t.keys || "keys"}`;
  }, [parsedJson, t.characters, t.keys]);

  return (
    <main className={`min-h-screen ${isDark ? "dark bg-black" : "bg-white"}`}>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isDark ? "bg-white/10" : "bg-black/10"
              }`}
            >
              <FileJson
                className={`w-6 h-6 ${isDark ? "text-white" : "text-black"}`}
              />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {t.title}
              </h1>
              {fileName && (
                <p
                  className={`text-sm ${
                    isDark ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  {fileName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  isDark
                    ? "bg-white/20 text-white"
                    : "bg-black/10 text-black"
                }`}
              >
                {t.unsavedChanges || "Modified"}
              </span>
            )}
            <SettingsMenu
              language={language}
              setLanguage={setLanguage}
              isDark={isDark}
              setIsDark={setIsDark}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left panel - Input */}
          <div className="space-y-4">
            <Card
              className={`p-4 ${
                isDark ? "bg-black border-neutral-800" : "bg-white border-neutral-200"
              } ${isDragging ? "ring-2 ring-neutral-500 ring-offset-2" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Upload area */}
              <div className="flex gap-2 mb-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 ${
                    isDark
                      ? "bg-black text-white hover:bg-neutral-900 border-neutral-700"
                      : "bg-white text-black hover:bg-neutral-100 border-neutral-300"
                  }`}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t.uploadJson}
                </Button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <Textarea
                  spellCheck="false"
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder={t.placeholder}
                  className={`min-h-[400px] font-mono text-sm resize-none p-3 ${
                    isDark
                      ? "bg-black text-white border-neutral-700 placeholder:text-neutral-600"
                      : "bg-white text-black border-neutral-300 placeholder:text-neutral-400"
                  } ${error ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {getStatsText() && (
                  <div
                    className={`absolute bottom-2 right-2 text-xs px-2 py-1 rounded ${
                      isDark
                        ? "bg-neutral-900 text-neutral-400"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {getStatsText()}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div
                  className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
                    isDark
                      ? "bg-red-500/10 text-red-400"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </Card>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={formatJson}
                disabled={!jsonInput.trim()}
                className={`${
                  isDark
                    ? "bg-white hover:bg-neutral-200 text-black"
                    : "bg-black hover:bg-neutral-800 text-white"
                } disabled:opacity-50`}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {t.format}
              </Button>
              <Button
                onClick={minifyJson}
                disabled={!jsonInput.trim()}
                variant="outline"
                className={`${
                  isDark
                    ? "bg-black text-white hover:bg-neutral-900 border-neutral-700"
                    : "bg-white text-black hover:bg-neutral-100 border-neutral-300"
                } disabled:opacity-50`}
              >
                {t.minify || "Minify"}
              </Button>
              <Button
                onClick={copyToClipboard}
                disabled={!parsedJson}
                variant="outline"
                className={`${
                  isDark
                    ? "bg-black text-white hover:bg-neutral-900 border-neutral-700"
                    : "bg-white text-black hover:bg-neutral-100 border-neutral-300"
                } disabled:opacity-50`}
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? t.copied || "Copied!" : t.copy || "Copy"}
              </Button>
              <Button
                onClick={handleExport}
                disabled={!parsedJson}
                variant="outline"
                className={`${
                  isDark
                    ? "bg-black text-white hover:bg-neutral-900 border-neutral-700"
                    : "bg-white text-black hover:bg-neutral-100 border-neutral-300"
                } disabled:opacity-50`}
              >
                <Download className="mr-2 h-4 w-4" />
                {t.export}
              </Button>
              <Button
                onClick={clearJson}
                disabled={!jsonInput}
                variant="outline"
                className={`${
                  isDark
                    ? "bg-black text-red-400 hover:bg-neutral-900 border-neutral-700"
                    : "bg-white text-red-500 hover:bg-red-50 border-neutral-300"
                } disabled:opacity-50`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t.clear}
              </Button>
            </div>
          </div>

          {/* Right panel - Preview */}
          <Card
            className={`p-4 overflow-auto max-h-[600px] ${
              isDark ? "bg-black border-neutral-800" : "bg-white border-neutral-200"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDark ? "text-white" : "text-black"
                }`}
              >
                {t.readableView}
              </h2>
              {parsedJson !== null && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    isDark
                      ? "bg-white/20 text-white"
                      : "bg-black/10 text-black"
                  }`}
                >
                  {t.editable || "Editable"}
                </span>
              )}
            </div>
            <div
              className={`min-h-[400px] ${
                isDark ? "text-white" : "text-black"
              }`}
            >
              {parsedJson ? (
                <JsonView
                  data={parsedJson}
                  isReadableView={true}
                  isDark={isDark}
                  onUpdate={handleJsonUpdate}
                />
              ) : (
                <div
                  className={`flex flex-col items-center justify-center h-[400px] ${
                    isDark ? "text-neutral-500" : "text-neutral-400"
                  }`}
                >
                  <FileJson className="w-12 h-12 mb-3 opacity-50" />
                  <p>{t.preview}</p>
                  <p className="text-sm mt-1">
                    {t.dragDropHint || "Paste JSON or drag & drop a file"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Footer language={language} />
      </div>
    </main>
  );
}

// Utility function to count keys in JSON
function countKeys(obj: unknown): number {
  if (obj === null || typeof obj !== "object") {
    return 0;
  }
  if (Array.isArray(obj)) {
    return obj.reduce((acc, item) => acc + countKeys(item), 0);
  }
  const keys = Object.keys(obj as Record<string, unknown>);
  return (
    keys.length +
    keys.reduce(
      (acc, key) => acc + countKeys((obj as Record<string, unknown>)[key]),
      0
    )
  );
}
