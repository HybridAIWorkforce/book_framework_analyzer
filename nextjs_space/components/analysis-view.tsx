"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Download,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  Target,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";
import type { AnalysisResult } from "@/lib/types";
import { AnalysisProgress } from "@/components/analysis-progress";
import { exportAnalysisReport } from "@/lib/export-utils";

interface AnalysisViewProps {
  analysisId: string;
}

const componentColors = [
  { color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500" },
  { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500" },
  { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500" },
  { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500" },
];

interface AnalysisError {
  error: string;
  message: string;
  guidance: string;
}

export function AnalysisView({ analysisId }: AnalysisViewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(0);
  const [selectedComponent, setSelectedComponent] = useState<string>("");

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, chapterByChapter: true }),
      });

      if (!response.ok) {
        // Try to parse structured error from the API
        try {
          const errData = await response.json();
          setAnalysisError({
            error: errData.error || "unknown_error",
            message: errData.message || "Analysis failed. Please try again.",
            guidance: errData.guidance || "",
          });
        } catch {
          setAnalysisError({
            error: "unknown_error",
            message: "Analysis failed. Please try again.",
            guidance: "If this persists, try re-uploading your manuscript.",
          });
        }
        return;
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let partialRead = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split("\n");
        partialRead = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed?.status === "processing") {
                // Smooth incremental progress based on content length
                setProgress((prev) => {
                  if (prev < 15) return prev + 3; // genre detection phase
                  if (prev < 40) return prev + 2; // framework selection
                  if (prev < 70) return prev + 1.5; // scoring phase
                  return Math.min(prev + 0.5, 95); // fix generation
                });
              } else if (parsed?.status === "completed" && parsed?.result) {
                setResult(parsed.result);
                setProgress(100);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisError({
        error: "network_error",
        message: "Connection lost during analysis.",
        guidance: "Check your internet connection and try again. Your manuscript is still saved.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisId]);

  useEffect(() => {
    startAnalysis();
  }, [startAnalysis]);

  // Auto-select first component when result loads
  useEffect(() => {
    if (result?.componentScores) {
      const keys = Object.keys(result.componentScores);
      if (keys.length > 0 && !selectedComponent) {
        setSelectedComponent(keys[0]);
      }
    }
  }, [result, selectedComponent]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const { success, error } = await exportAnalysisReport(analysisId);
    setIsExporting(false);
    if (success) {
      toast.success("Report exported successfully!");
    } else {
      toast.error(error?.message || "Export failed");
      if (error?.guidance) {
        setTimeout(() => toast(error.guidance!, { icon: "💡", duration: 5000 }), 500);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return CheckCircle2;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const chapters = result?.currentStructure?.chapters || [];
  const currentChapter = chapters[selectedChapter];
  const scores = result?.componentScores || {};
  const scoreKeys = Object.keys(scores);
  const currentComponentData = scores[selectedComponent];

  // Error state with guidance
  if (analysisError) {
    const isPdfIssue = ["pdf_content_error", "pdf_processing_error", "file_too_large", "file_access_error"].includes(analysisError.error);
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 max-w-lg mx-auto">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isPdfIssue ? "bg-amber-500/20" : "bg-red-500/20"}`}>
          {isPdfIssue ? (
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{analysisError.message}</h3>
        {analysisError.guidance && (
          <div className="bg-secondary/50 rounded-xl p-4 mb-6 w-full">
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 WHAT TO DO</p>
            <p className="text-sm">{analysisError.guidance}</p>
          </div>
        )}
        {isPdfIssue && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 w-full">
            <p className="text-xs font-medium text-amber-500 mb-2">COMMON PDF ISSUES</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Scanned PDFs:</strong> Run through Adobe Acrobat OCR or an online OCR tool first</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Password-protected:</strong> Remove password protection before uploading</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><strong>Too large:</strong> Compress images or split into smaller files</span>
              </li>
            </ul>
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isAnalyzing || !result) {
    return <AnalysisProgress progress={progress} isAnalyzing={isAnalyzing} />;
  }

  // Handle unreadable PDF detected by LLM
  if (result?.detectedGenre?.id === "unreadable") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Could Not Read This Manuscript</h3>
        <p className="text-sm text-muted-foreground text-center mb-4">
          {result.detectedGenre.reasoning || "The PDF content could not be extracted for analysis."}
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 w-full">
          <p className="text-xs font-medium text-amber-500 mb-2">HOW TO FIX THIS</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• If this is a scanned PDF, run it through OCR software first (Adobe Acrobat, Google Drive, or an online OCR service)</li>
            <li>• If the file is a Word document, export it as PDF using &ldquo;Save As PDF&rdquo;</li>
            <li>• Make sure the PDF has actual text content, not just images</li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
        >
          Upload a Different File
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Genre Detection Header */}
      <div className="bg-card border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-amber-500" />
            <div>
              <h3 className="text-lg font-semibold">Genre Detected</h3>
              <p className="text-sm text-muted-foreground">Matched to proven bestseller framework</p>
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-wait text-black rounded-lg transition-colors font-medium"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Report
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Genre */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">GENRE</span>
            </div>
            <p className="text-lg font-semibold text-amber-500">{result?.detectedGenre?.name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground mt-1">{result?.detectedGenre?.confidence || 0}% confidence</p>
          </div>

          {/* Framework */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">PROVEN FRAMEWORK</span>
            </div>
            <p className="text-lg font-semibold">{result?.detectedGenre?.frameworkName || "Unknown"}</p>
          </div>

          {/* Score */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">BESTSELLER READINESS</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${getScoreColor(result?.overallScore || 0)}`}>
                {result?.overallScore || 0}%
              </span>
              <div className="flex-1">
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
                    style={{ width: `${result?.overallScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Genre Reasoning */}
        {result?.detectedGenre?.reasoning && (
          <div className="bg-secondary/30 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">WHY THIS GENRE</p>
            <p className="text-sm">{result.detectedGenre.reasoning}</p>
          </div>
        )}

        {/* Proven By */}
        {result?.detectedGenre?.provenBy && result.detectedGenre.provenBy.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Proven by:</span>
            {result.detectedGenre.provenBy.map((book, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">{book}</span>
            ))}
          </div>
        )}
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scoreKeys.map((key, idx) => {
          const comp = scores[key];
          const colorSet = componentColors[idx % componentColors.length];
          const score = comp?.score || 0;
          const ScoreIcon = getScoreIcon(score);
          return (
            <button
              key={key}
              onClick={() => setSelectedComponent(key)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedComponent === key
                  ? `${colorSet.border} ${colorSet.bg}`
                  : "border-transparent bg-secondary/50 hover:border-secondary"
              }`}
            >
              <span className="text-xs font-medium text-muted-foreground">{comp?.weight || ""}</span>
              <p className={`text-sm font-medium mt-1 ${colorSet.color}`}>{comp?.name || key}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                <ScoreIcon className={`h-5 w-5 ${getScoreColor(score)}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Split Screen View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* LEFT: Manuscript Content */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-secondary/30">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Your Manuscript</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result?.currentStructure?.totalChapters || 0} chapters • {((result?.currentStructure?.estimatedWordCount || 0) / 1000).toFixed(0)}k words
            </p>
          </div>

          <div className="flex overflow-x-auto border-b bg-secondary/20 p-1 gap-1">
            {chapters.map((chapter, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChapter(idx)}
                className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                  selectedChapter === idx ? "bg-amber-500 text-white" : "hover:bg-secondary"
                }`}
              >
                {chapter.chapterNumber || idx + 1}. {(chapter.title || "").slice(0, 15)}{(chapter.title || "").length > 15 ? "..." : ""}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {currentChapter ? (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-amber-500">{currentChapter.title}</h4>
                {currentChapter.keyPoints && currentChapter.keyPoints.length > 0 && (
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">KEY POINTS</p>
                    <ul className="space-y-1">
                      {currentChapter.keyPoints.map((point, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap bg-secondary/20 rounded-lg p-4 max-h-[350px] overflow-auto">
                  {currentChapter.content || "Content not extracted"}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Select a chapter to view content</p>
            )}
          </div>
        </div>

        {/* RIGHT: Genre-Specific Component Analysis */}
        <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-secondary/30">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">
                {currentComponentData?.name || "Component"} Analysis
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result?.detectedGenre?.frameworkName} • Weight: {currentComponentData?.weight || "N/A"}
            </p>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {currentComponentData ? (
              <>
                {currentComponentData.present && currentComponentData.present.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-400 mb-2">✓ WHAT&apos;S PRESENT</p>
                    <ul className="space-y-1">
                      {currentComponentData.present.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentComponentData.missing && currentComponentData.missing.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-2">✗ WHAT&apos;S MISSING</p>
                    <ul className="space-y-1">
                      {currentComponentData.missing.map((item, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentComponentData.fixes && currentComponentData.fixes.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs font-medium text-amber-400 mb-3">🔧 HOW TO FIX IT</p>
                    {currentComponentData.fixes.map((fix, idx) => (
                      <div key={idx} className="border rounded-lg p-3 mb-3 bg-secondary/30">
                        <p className="text-sm font-medium text-red-400 mb-1">Issue: {fix.issue}</p>
                        <p className="text-sm mb-2"><span className="text-green-400 font-medium">Fix:</span> {fix.fix}</p>
                        {fix.whereToAdd && (
                          <p className="text-xs text-muted-foreground mb-2">📍 Where: {fix.whereToAdd}</p>
                        )}
                        {fix.example && (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 mt-2">
                            <p className="text-xs italic text-amber-300">📚 Bestseller Example: {fix.example}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">Select a component to view analysis</p>
            )}
          </div>
        </div>
      </div>

      {/* Prioritized Fixes */}
      {result?.prioritizedFixes && result.prioritizedFixes.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">🎯 Priority Fixes for {result?.detectedGenre?.name || "This Genre"}</h3>
          <div className="space-y-3">
            {result.prioritizedFixes.slice(0, 5).map((fix, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold shrink-0">
                  {fix.priority || idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                      {fix.component}
                    </span>
                  </div>
                  <p className="font-medium">{fix.issue}</p>
                  <p className="text-sm text-muted-foreground mt-1"><span className="text-green-400">Fix:</span> {fix.fix}</p>
                  {fix.impact && <p className="text-xs text-amber-400 mt-1">Impact: {fix.impact}</p>}
                  {fix.bestseller_example && (
                    <p className="text-xs italic text-muted-foreground mt-1">📚 {fix.bestseller_example}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transformation Summary */}
      {result?.transformationSummary && (
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 p-6 rounded-r-xl">
          <h3 className="font-semibold mb-2">📝 Transformation Summary</h3>
          <p className="text-sm">{result.transformationSummary}</p>
        </div>
      )}
    </div>
  );
}
