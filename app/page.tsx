"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Lightbulb, Compass, Info } from "lucide-react";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisView } from "@/components/analysis-view";
import { DemoPreview } from "@/components/demo-preview";
import { FrameworkExplainerModal } from "@/components/framework-explainer-modal";
import { GENRES } from "@/lib/framework-knowledge";

export default function Home() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div className="min-h-screen magic-gradient">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-500">Genre-Specific Bestseller Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Transform Your Manuscript Into a{" "}
            <span className="gold-accent">Bestseller</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Upload your manuscript. We detect its genre, then apply the proven framework that
            produced bestsellers in that exact category.
          </p>
          <button
            onClick={() => setShowExplainer(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border hover:border-amber-500/30 transition-all text-sm text-muted-foreground hover:text-amber-500"
          >
            <Info className="h-4 w-4" />
            How do we score your manuscript?
          </button>
        </motion.div>

        {/* Framework Explainer Modal */}
        <FrameworkExplainerModal isOpen={showExplainer} onClose={() => setShowExplainer(false)} />

        {/* Main Content */}
        <div className="space-y-12">
          {!analysisId ? (
            <>
              <UploadZone onUploadComplete={(id) => setAnalysisId(id)} />

              {/* Demo Preview */}
              <DemoPreview />
              
              {/* Genre Framework Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-500" />
                  Genre-Specific Proven Frameworks
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {GENRES.map((genre, i) => (
                    <motion.div
                      key={genre.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="bg-card rounded-xl border border-border p-5 hover:border-amber-500/30 transition-colors group"
                    >
                      <h3 className="font-semibold group-hover:text-amber-500 transition-colors mb-1">
                        {genre.name}
                      </h3>
                      <p className="text-xs text-amber-500 font-medium mb-3">{genre.framework}</p>
                      <div className="space-y-1 mb-3">
                        {genre.components.map((comp, j) => (
                          <div key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {comp}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {genre.examples.map((ex, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-2xl border border-border p-8"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    {
                      step: 1,
                      title: "Upload Manuscript",
                      desc: "Upload your PDF — any length, any stage of completion.",
                    },
                    {
                      step: 2,
                      title: "Genre Detection",
                      desc: "AI detects your book's genre and selects the proven framework.",
                    },
                    {
                      step: 3,
                      title: "Framework Scoring",
                      desc: "Scores each component that bestsellers in your genre all have.",
                    },
                    {
                      step: 4,
                      title: "Specific Fixes",
                      desc: "Get actionable fixes with examples from your genre's bestsellers.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="font-bold text-amber-500">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          ) : (
            <AnalysisView analysisId={analysisId} />
          )}
        </div>
      </main>
    </div>
  );
}
