"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { exportAnalysisReport } from "@/lib/export-utils";
import {
  History,
  FileText,
  Trash2,
  ExternalLink,
  Download,
  Loader2,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import toast from "react-hot-toast";

interface Analysis {
  id: string;
  filename: string;
  frameworkMatch?: string | null;
  status: string;
  createdAt: string;
  notes?: string | null;
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = useCallback(async () => {
    try {
      const res = await fetch("/api/analyses");
      const data = await res.json();
      setAnalyses(data?.analyses ?? []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const deleteAnalysis = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;
    try {
      await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      setAnalyses((prev) => (prev ?? []).filter((a) => a?.id !== id));
      toast.success("Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const frameworkLabels: Record<string, string> = {
    hybrid: "Principle-Based Hybrid",
    story: "Story-Driven Narrative",
    system: "Step-by-Step System",
    research: "Case Study/Research-Based",
  };

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400",
    analyzing: "bg-amber-500/20 text-amber-400",
    uploaded: "bg-blue-500/20 text-blue-400",
    error: "bg-red-500/20 text-red-400",
    pending: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="min-h-screen magic-gradient">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <History className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Analysis History</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
          ) : (analyses?.length ?? 0) === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No analyses yet</p>
              <p className="text-muted-foreground mb-6">Upload a manuscript to get started</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {analyses?.map((analysis, i) => (
                  <motion.div
                    key={analysis?.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border p-6 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="p-3 rounded-lg bg-secondary">
                          <FileText className="h-6 w-6 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">
                            {analysis?.filename || "Untitled"}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>
                              {analysis?.createdAt
                                ? format(new Date(analysis.createdAt), "MMM d, yyyy 'at' h:mm a")
                                : "Unknown date"}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                statusColors[analysis?.status || "pending"] || statusColors.pending
                              }`}
                            >
                              {analysis?.status || "pending"}
                            </span>
                          </div>
                          {analysis?.frameworkMatch && (
                            <p className="mt-2 text-sm">
                              <span className="text-muted-foreground">Framework: </span>
                              <span className="text-amber-500">
                                {frameworkLabels[analysis.frameworkMatch] || analysis.frameworkMatch}
                              </span>
                            </p>
                          )}
                          {analysis?.notes && (
                            <p className="mt-2 text-sm text-muted-foreground truncate max-w-md">
                              Note: {analysis.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {analysis?.status === "completed" && (
                          <>
                            <Link
                              href={`/analysis/${analysis.id}`}
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              title="View Analysis"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={async () => {
                                const { success, error } = await exportAnalysisReport(analysis.id, "markdown");
                                if (success) {
                                  toast.success("Report exported!");
                                } else {
                                  toast.error(error?.message || "Export failed");
                                }
                              }}
                              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                              title="Export"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => analysis?.id && deleteAnalysis(analysis.id)}
                          className="p-2 rounded-lg bg-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
