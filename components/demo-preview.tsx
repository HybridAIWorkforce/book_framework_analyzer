"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Tag,
  Target,
  Compass,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { DEMO_ANALYSIS } from "@/lib/demo-analysis";

const componentColors = [
  { color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500" },
  { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500" },
  { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500" },
  { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500" },
];

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

export function DemoPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState("component1");

  const result = DEMO_ANALYSIS;
  const scores = result.componentScores || {};
  const scoreKeys = Object.keys(scores);
  const currentComponentData = scores[selectedComponent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl hover:border-amber-500/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Eye className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold group-hover:text-amber-500 transition-colors">
              See Example Analysis Output
            </h3>
            <p className="text-sm text-muted-foreground">
              Preview what you&apos;ll get — genre detection, framework scoring, and specific fixes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 font-medium">
            How-To Playbook Example
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable Demo Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4 relative">
              {/* "Demo" watermark ribbon */}
              <div className="absolute top-2 right-2 z-10">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-black font-bold tracking-wider">
                  DEMO
                </span>
              </div>

              {/* Genre Detection Header (compact) */}
              <div className="bg-card border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="h-5 w-5 text-amber-500" />
                  <h4 className="font-semibold">Genre Detected</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-muted-foreground">GENRE</span>
                    </div>
                    <p className="font-semibold text-amber-500">{result.detectedGenre?.name}</p>
                    <p className="text-xs text-muted-foreground">{result.detectedGenre?.confidence}% confidence</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-medium text-muted-foreground">FRAMEWORK</span>
                    </div>
                    <p className="font-semibold">{result.detectedGenre?.frameworkName}</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <span className="text-xs font-medium text-muted-foreground">BESTSELLER READINESS</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-2xl font-bold ${getScoreColor(result.overallScore || 0)}`}>
                        {result.overallScore}%
                      </span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
                          style={{ width: `${result.overallScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {result.detectedGenre?.reasoning && (
                  <div className="bg-secondary/30 rounded-lg p-3 text-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">WHY THIS GENRE</p>
                    {result.detectedGenre.reasoning}
                  </div>
                )}
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {scoreKeys.map((key, idx) => {
                  const comp = scores[key];
                  const colorSet = componentColors[idx % componentColors.length];
                  const score = comp?.score || 0;
                  const ScoreIcon = getScoreIcon(score);
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedComponent(key)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        selectedComponent === key
                          ? `${colorSet.border} ${colorSet.bg}`
                          : "border-transparent bg-secondary/50 hover:border-secondary"
                      }`}
                    >
                      <span className="text-xs font-medium text-muted-foreground">{comp?.weight}</span>
                      <p className={`text-sm font-medium mt-1 ${colorSet.color}`}>{comp?.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</span>
                        <ScoreIcon className={`h-4 w-4 ${getScoreColor(score)}`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Split Screen Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Manuscript Content */}
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="p-3 border-b bg-secondary/30 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-semibold">Your Manuscript</h4>
                    <span className="text-xs text-muted-foreground">
                      {result.currentStructure?.totalChapters} chapters • {((result.currentStructure?.estimatedWordCount || 0) / 1000).toFixed(0)}k words
                    </span>
                  </div>
                  <div className="p-4 max-h-[280px] overflow-auto">
                    <h5 className="text-sm font-semibold text-amber-500 mb-2">
                      Ch.2 — {result.currentStructure?.chapters?.[1]?.title}
                    </h5>
                    <div className="bg-secondary/20 rounded-lg p-3">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {result.currentStructure?.chapters?.[1]?.content}
                      </p>
                    </div>
                    <div className="mt-3 bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">KEY POINTS</p>
                      <ul className="space-y-1">
                        {result.currentStructure?.chapters?.[1]?.keyPoints?.map((point, i) => (
                          <li key={i} className="text-xs flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right: Component Analysis */}
                <div className="bg-card border rounded-xl overflow-hidden">
                  <div className="p-3 border-b bg-secondary/30 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-semibold">{currentComponentData?.name} Analysis</h4>
                  </div>
                  <div className="p-4 max-h-[280px] overflow-auto space-y-3">
                    {currentComponentData?.present && currentComponentData.present.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-400 mb-1">✓ WHAT&apos;S PRESENT</p>
                        <ul className="space-y-1">
                          {currentComponentData.present.map((item, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentComponentData?.missing && currentComponentData.missing.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-400 mb-1">✗ WHAT&apos;S MISSING</p>
                        <ul className="space-y-1">
                          {currentComponentData.missing.map((item, i) => (
                            <li key={i} className="text-xs flex items-start gap-1.5">
                              <XCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentComponentData?.fixes && currentComponentData.fixes.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-amber-400 mb-2">🔧 HOW TO FIX IT</p>
                        {currentComponentData.fixes.slice(0, 1).map((fix, idx) => (
                          <div key={idx} className="border rounded-lg p-2.5 bg-secondary/30">
                            <p className="text-xs font-medium text-red-400 mb-1">Issue: {fix.issue}</p>
                            <p className="text-xs mb-1">
                              <span className="text-green-400 font-medium">Fix:</span> {fix.fix}
                            </p>
                            {fix.example && (
                              <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 mt-1.5">
                                <p className="text-xs italic text-amber-300">📚 {fix.example}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Priority Fix (just one as teaser) */}
              {result.prioritizedFixes && result.prioritizedFixes.length > 0 && (
                <div className="bg-card border rounded-xl p-4">
                  <h4 className="text-sm font-semibold mb-3">🎯 #1 Priority Fix</h4>
                  <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-sm shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                        {result.prioritizedFixes[0].component}
                      </span>
                      <p className="text-sm font-medium mt-1">{result.prioritizedFixes[0].issue}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="text-green-400">Fix:</span> {result.prioritizedFixes[0].fix}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="text-center py-3">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Upload your manuscript above to get your own genre-specific analysis
                  <Sparkles className="h-4 w-4 text-amber-500" />
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
