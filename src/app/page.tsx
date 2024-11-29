"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import SettingsMenu from "@/components/SettingsMenu";
import { translations } from "@/translations";
import { Upload, Trash2 } from "lucide-react";

const JsonView = dynamic(() => import("@/components/JsonView"), {
  ssr: false,
});

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [isDark, setIsDark] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonInput(value);
    try {
      if (value.trim() === "") {
        setParsedJson(null);
        setError(null);
        return;
      }
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
      setError(null);
    } catch (e) {
      setError(t.invalidJson);
      setParsedJson(null);
    }
  };

  const processFile = (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".json")) {
      setError("Please upload a JSON file");
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
      } catch (e) {
        setError(t.invalidJson);
        setParsedJson(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setParsedJson(parsed);
      setError(null);
    } catch (e) {
      setError(t.invalidJson);
    }
  };

  const clearJson = () => {
    setJsonInput("");
    setParsedJson(null);
    setError(null);
    setFileName("");
  };

  const handleExport = () => {
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
  };

  return (
    <main className={`container mx-auto p-4 ${isDark ? "dark" : ""}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold dark:text-white">{t.title}</h1>
        <SettingsMenu
          language={language}
          setLanguage={setLanguage}
          isDark={isDark}
          setIsDark={setIsDark}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card
            className={`p-4 dark:bg-[#1E1E1E] ${
              isDragging ? "ring-2 ring-blue-500" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
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
                className="w-full dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t.uploadJson}
              </Button>
            </div>
            <Textarea
              spellCheck="false"
              value={jsonInput}
              onChange={handleJsonChange}
              placeholder={t.placeholder}
              className="min-h-[400px] font-mono bg-transparent resize-none p-2 dark:bg-[#1E1E1E] dark:text-[#CE9178] text-green-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </Card>
          <div className="flex gap-2">
            <Button
              onClick={formatJson}
              className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {t.format}
            </Button>
            <Button
              onClick={clearJson}
              variant="outline"
              className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t.clear}
            </Button>
            <Button
              onClick={handleExport}
              disabled={!parsedJson}
              className="dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 disabled:dark:bg-gray-900 disabled:dark:text-gray-600"
            >
              {t.export}
            </Button>
          </div>
        </div>
        <Card className="p-4 overflow-auto dark:bg-[#1E1E1E]">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">
            {t.readableView}
          </h2>
          <div className="min-h-[400px] dark:text-gray-100">
            {parsedJson ? (
              <JsonView
                data={parsedJson}
                isReadableView={true}
                isDark={isDark}
              />
            ) : (
              <p className="text-gray-400 dark:text-gray-500">{t.preview}</p>
            )}
          </div>
        </Card>
      </div>
      <Footer />
    </main>
  );
}
