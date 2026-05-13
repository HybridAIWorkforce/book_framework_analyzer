"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { exportAnalysisReport } from "@/lib/export-utils";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  BookOpen,
  Download,
  Save,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Header } from "@/components/header";
import toast from "react-hot-toast";

interface AnalysisDetailClientProps {
  id: string;
}

interface Chapter {
  title?: string;
  sections?: string[];
  summary?: string;
}

interface Suggestion {
  type?: string;
  priority?: string;
  currentLocation?: string;
  suggestedLocation?: string;
  rationale?: string;
  exampleFromBestseller?: string;
}

interface AnalysisData {
  id: string;
  filename: string;
  status: string;
  createdAt: string;
  notes?: string | null;
  suggestions?: {
    currentStructure?: {
      chapters?: Chapter[];
      totalChapters?: number;
      estimatedWordCount?: number;
    };
    frameworkAnalysis?: {
      primaryFramework?: string;
      matchScore?: number;
      strengths?: string[];
      gaps?: string[];
    };
    suggestions?: Suggestion[];
    recommendedFramework?: string;
    transformationSummary?: string;
  } | null;
}

export function AnalysisDetailClient({ id }: AnalysisDetailClientProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
  const [expandedSuggestions, setExpandedSuggestions] = useState<Set<number>>(new Set([0]));

  const fetchAnalysis = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/analyses/${id}`);
      const data = await res.json();
      setAnalysis(data?.analysis ?? null);
      setNotes(data?.analysis?.notes || "");
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const saveNotes = async () => {
    try {
      await fetch(`/api/analyses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      toast.success("Notes saved!");
    } catch (error) {
      toast.error("Failed to save notes");
    }
  };

  const toggleChapter = (index: number) => {
    const next = new Set(expandedChapters);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpandedChapters(next);
  };

  const toggleSuggestion = (index: number) => {
    const next = new Set(expandedSuggestions);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setExpandedSuggestions(next);
  };

  const frameworkLabels: Record<string, string> = {
    hybrid: "Principle-Based Hybrid",
    story: "Story-Driven Narrative",
    system: "Step-by-Step System",
    research: "Case Study/Research-Based",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  if (loading) {
    return (
      <div className="min-h-screen magic-gradient">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen magic-gradient">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-12 text-center">
          <p className="text-muted-foreground">Analysis not found</p>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 mt-4 text-amber-500 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </main>
      </div>
    );
  }

  const result = analysis.suggestions;

  return (
    <div className="min-h-screen magic-gradient">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Link>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="h-6 w-6 text-amber-500" />
                {analysis.filename}
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyzed on{" "}
                {analysis.createdAt
                  ? format(new Date(analysis.createdAt), "MMMM d, yyyy 'at' h:mm a")
                  : "Unknown date"}
              </p>
            </div>
            <button
              onClick={async () => {
                const { success, error } = await exportAnalysisReport(id, "markdown");
                if (success) {
                  toast.success("Report exported!");
                } else {
                  toast.error(error?.message || "Export failed");
                }
              }}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {result ? (
            <div className="space-y-8">
              {/* Split View */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Structure */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <BookOpen className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Current Structure</h2>
                  </div>

                  {result.currentStructure && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {result.currentStructure?.totalChapters || 0}
                        </span>{" "}
                        chapters •{" "}
                        <span className="font-medium text-foreground">
                          {(result.currentStructure?.estimatedWordCount || 0).toLocaleString()}
                        </span>{" "}
                        words
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {result.currentStructure?.chapters?.map((chapter, i) => (
                      <div key={i} className="rounded-lg bg-secondary/50 overflow-hidden">
                        <button
                          onClick={() => toggleChapter(i)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-secondary/80 transition-colors"
                        >
                          {expandedChapters.has(i) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-xs font-mono text-muted-foreground">Ch {i + 1}</span>
                          <span className="font-medium truncate">{chapter?.title || "Untitled"}</span>
                        </button>
                        <AnimatePresence>
                          {expandedChapters.has(i) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-1 space-y-2">
                                {chapter?.summary && (
                                  <p className="text-sm text-muted-foreground">{chapter.summary}</p>
                                )}
                                {(chapter?.sections?.length ?? 0) > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">Sections:</p>
                                    {chapter?.sections?.map((section, j) => (
                                      <div key={j} className="flex items-center gap-2 text-sm">
                                        <FileText className="h-3 w-3 text-muted-foreground" />
                                        <span>{section}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Suggestions */}
                <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-semibold">Transformation Suggestions</h2>
                  </div>

                  {/* Framework Match */}
                  {result.frameworkAnalysis && (
                    <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Framework</span>
                        <span className="font-semibold text-amber-500">
                          {frameworkLabels[result.frameworkAnalysis?.primaryFramework || ""] ||
                            result.frameworkAnalysis?.primaryFramework ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                            style={{ width: `${result.frameworkAnalysis?.matchScore || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {result.frameworkAnalysis?.matchScore || 0}% match
                        </span>
                      </div>
                      {(result.frameworkAnalysis?.strengths?.length ?? 0) > 0 && (
                        <div className="pt-2 space-y-1">
                          {result.frameworkAnalysis?.strengths?.slice(0, 2)?.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {(result.frameworkAnalysis?.gaps?.length ?? 0) > 0 && (
                        <div className="space-y-1">
                          {result.frameworkAnalysis?.gaps?.slice(0, 2)?.map((g, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{g}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {result.suggestions?.map((suggestion, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-secondary/50 overflow-hidden border border-transparent hover:border-amber-500/20 transition-colors"
                      >
                        <button
                          onClick={() => toggleSuggestion(i)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left"
                        >
                          {expandedSuggestions.has(i) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <Target className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <span className="font-medium flex-1">
                            {suggestion?.type?.replace("_", " ")?.toUpperCase() || "SUGGESTION"}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              priorityColors[suggestion?.priority || "medium"] || priorityColors.medium
                            }`}
                          >
                            {suggestion?.priority || "medium"}
                          </span>
                        </button>
                        <AnimatePresence>
                          {expandedSuggestions.has(i) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3">
                                {suggestion?.currentLocation && suggestion?.suggestedLocation && (
                                  <div className="flex items-center gap-2 text-sm p-2 rounded bg-background">
                                    <span className="text-muted-foreground">
                                      {suggestion.currentLocation}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-amber-500" />
                                    <span className="text-amber-500 font-medium">
                                      {suggestion.suggestedLocation}
                                    </span>
                                  </div>
                                )}
                                {suggestion?.rationale && (
                                  <div className="text-sm">
                                    <span className="font-medium">Why: </span>
                                    <span className="text-muted-foreground">{suggestion.rationale}</span>
                                  </div>
                                )}
                                {suggestion?.exampleFromBestseller && (
                                  <div className="text-sm flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                                    <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-muted-foreground">
                                      {suggestion.exampleFromBestseller}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary & Notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {result.transformationSummary && (
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Transformation Summary
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {result.transformationSummary}
                    </p>
                  </div>
                )}

                <div className="bg-card rounded-2xl border border-border p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    Notes & Annotations
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target?.value || "")}
                    placeholder="Add your notes here..."
                    className="w-full h-32 bg-secondary/50 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    onClick={saveNotes}
                    className="mt-3 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Save className="h-4 w-4" />
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg">No analysis data available</p>
              <p className="text-muted-foreground">This analysis may still be processing or encountered an error.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
