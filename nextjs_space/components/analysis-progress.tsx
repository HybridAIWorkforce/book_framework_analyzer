"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, BookOpen, Compass, Target, Lightbulb, CheckCircle2, Wrench } from "lucide-react";

interface AnalysisProgressProps {
  progress: number;
  isAnalyzing: boolean;
}

// Analysis stages with typical progress ranges and descriptions
const STAGES = [
  {
    id: "upload",
    label: "Reading manuscript",
    description: "Downloading and processing your PDF",
    icon: BookOpen,
    minProgress: 0,
    maxProgress: 10,
  },
  {
    id: "genre",
    label: "Detecting genre",
    description: "Identifying which bestseller framework applies",
    icon: Compass,
    minProgress: 10,
    maxProgress: 30,
  },
  {
    id: "framework",
    label: "Applying framework",
    description: "Mapping your content to genre-specific components",
    icon: Target,
    minProgress: 30,
    maxProgress: 60,
  },
  {
    id: "scoring",
    label: "Scoring components",
    description: "Evaluating each framework component against bestseller benchmarks",
    icon: Lightbulb,
    minProgress: 60,
    maxProgress: 80,
  },
  {
    id: "fixes",
    label: "Generating fixes",
    description: "Creating specific, actionable recommendations with bestseller examples",
    icon: Wrench,
    minProgress: 80,
    maxProgress: 100,
  },
];

// Typical analysis duration range in seconds
const EST_MIN_SECONDS = 60;
const EST_MAX_SECONDS = 120;

export function AnalysisProgress({ progress, isAnalyzing }: AnalysisProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());
  // Store recent progress snapshots for velocity-based estimation
  const progressHistory = useRef<{ t: number; p: number }[]>([]);

  useEffect(() => {
    if (!isAnalyzing) return;
    startRef.current = Date.now();
    setElapsed(0);
    progressHistory.current = [];
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnalyzing]);

  // Track progress velocity
  useEffect(() => {
    if (progress > 0) {
      progressHistory.current.push({ t: Date.now(), p: progress });
      // Keep last 10 snapshots for smooth averaging
      if (progressHistory.current.length > 10) {
        progressHistory.current = progressHistory.current.slice(-10);
      }
    }
  }, [progress]);

  // Estimate remaining time using velocity-weighted approach
  const getEstimatedRemaining = (): number => {
    const history = progressHistory.current;
    if (history.length < 2 || progress < 5) {
      // Not enough data yet — use the midpoint of our typical range
      const midEstimate = (EST_MIN_SECONDS + EST_MAX_SECONDS) / 2;
      return Math.max(0, midEstimate - elapsed);
    }

    // Calculate velocity from recent history (progress % per second)
    const oldest = history[0];
    const newest = history[history.length - 1];
    const timeDelta = (newest.t - oldest.t) / 1000; // seconds
    const progressDelta = newest.p - oldest.p;

    if (timeDelta <= 0 || progressDelta <= 0) {
      return Math.max(0, EST_MAX_SECONDS - elapsed);
    }

    const velocity = progressDelta / timeDelta; // % per second
    const remaining = (100 - progress) / velocity;

    // Clamp to reasonable range (don't show > 5 min or < 5 sec)
    return Math.max(5, Math.min(300, Math.round(remaining)));
  };

  const estimatedRemaining = getEstimatedRemaining();

  const formatTime = (seconds: number) => {
    if (seconds <= 10) return "Almost done...";
    if (seconds < 60) return `About ${Math.round(seconds / 5) * 5}s remaining`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round((seconds % 60) / 10) * 10;
    if (secs === 0) return `About ${mins}m remaining`;
    return `About ${mins}m ${secs}s remaining`;
  };

  // Determine active stage
  const activeStageIdx = STAGES.findIndex(
    (s) => progress >= s.minProgress && progress < s.maxProgress
  );
  const currentStage = activeStageIdx >= 0 ? activeStageIdx : STAGES.length - 1;
  const activeStage = STAGES[currentStage];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-lg mx-auto">
      {/* Circular progress indicator */}
      <div className="relative mb-6 w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="hsl(217.2 32.6% 17.5%)"
            strokeWidth="6"
          />
          <circle
            cx="40" cy="40" r="34"
            fill="none"
            stroke="hsl(45 93% 47%)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-amber-500">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Title & current stage */}
      <p className="text-lg font-semibold mb-1">Analyzing your manuscript</p>
      <p className="text-sm text-amber-500 mb-1">{activeStage.label}</p>
      <p className="text-xs text-muted-foreground mb-6">
        {formatTime(estimatedRemaining)}
      </p>

      {/* Main progress bar */}
      <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Stage Steps */}
      <div className="w-full space-y-2">
        {STAGES.map((stage, idx) => {
          const isComplete = progress >= stage.maxProgress;
          const isActive = idx === currentStage;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive
                  ? "bg-amber-500/10 border border-amber-500/30"
                  : isComplete
                  ? "bg-green-500/5 border border-green-500/20"
                  : "bg-secondary/20 border border-transparent opacity-40"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isComplete
                    ? "bg-green-500/20"
                    : isActive
                    ? "bg-amber-500/20"
                    : "bg-secondary/50"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isComplete
                      ? "text-green-400"
                      : isActive
                      ? "text-amber-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </p>
                {isActive && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {stage.description}
                  </p>
                )}
              </div>
              {isComplete && (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              )}
              {isActive && (
                <span className="text-xs text-amber-500 animate-pulse shrink-0">Working</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Elapsed time */}
      <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground">
        <span>Elapsed: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>Manuscripts typically take 1–2 minutes</span>
      </div>
    </div>
  );
}
