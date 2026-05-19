"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Briefcase,
  Brain,
  Wrench,
  BookHeart,
  Microscope,
  Flame,
  ChevronRight,
  Info,
} from "lucide-react";
import { GENRES } from "@/lib/framework-knowledge";

const genreIcons: Record<string, React.ReactNode> = {
  business_strategy: <Briefcase className="h-5 w-5" />,
  self_help_productivity: <Brain className="h-5 w-5" />,
  how_to_playbook: <Wrench className="h-5 w-5" />,
  memoir_narrative: <BookHeart className="h-5 w-5" />,
  research_academic: <Microscope className="h-5 w-5" />,
  motivational_inspirational: <Flame className="h-5 w-5" />,
};

const genreDetails: Record<string, { whyItWorks: string; componentDetails: { name: string; weight: string; description: string }[] }> = {
  business_strategy: {
    whyItWorks: "Business strategy bestsellers like Good to Great and Blue Ocean Strategy all share a single powerful concept backed by rigorous research. Readers buy these books for a transformative idea they can apply immediately.",
    componentDetails: [
      { name: "Big Idea", weight: "30%", description: "A single named concept introduced early and reinforced throughout — like 'Hedgehog Concept' or 'Blue Ocean'. This becomes the book's identity." },
      { name: "Research & Evidence", weight: "30%", description: "Rigorous data, case studies, and multi-year research. Business readers demand credibility — named companies and comparison groups are essential." },
      { name: "Framework/Model", weight: "25%", description: "A visual model readers can reference, like 'The Flywheel' or 'Strategy Canvas'. If you can draw it on a napkin, it will spread." },
      { name: "Contrarian Insight", weight: "15%", description: "Challenges conventional wisdom with a provocative claim. 'Good is the enemy of great' or 'Competition is for losers' — reframes how readers think." },
    ],
  },
  self_help_productivity: {
    whyItWorks: "Self-help bestsellers like Atomic Habits and 7 Habits create proprietary vocabulary with named principles that readers can internalize, supported by scientific backing and personal stories.",
    componentDetails: [
      { name: "Named Principles/Laws", weight: "30%", description: "3–7 clear rules with memorable names — like 'The 4 Laws of Behavior Change'. Proprietary vocabulary that becomes part of the reader's thinking." },
      { name: "Stories & Anecdotes", weight: "25%", description: "Personal stories and case studies that bring each principle to life. At least one emotional story per principle creates connection." },
      { name: "Actionable System", weight: "25%", description: "Step-by-step tactics under each principle. End-of-chapter action items, checklists, or templates so readers know exactly what to DO." },
      { name: "Scientific Backing", weight: "20%", description: "Psychology, neuroscience, or behavioral science research that validates each principle. Cited studies add authority." },
    ],
  },
  how_to_playbook: {
    whyItWorks: "How-To bestsellers like $100M Offers and Traction give readers a step-by-step system they can follow immediately. The value is in the tools, templates, and proof that the system works.",
    componentDetails: [
      { name: "Clear Sequential Process", weight: "35%", description: "Numbered steps, phases, or a roadmap. The reader follows a clear path from A to Z — if they can't follow it linearly, it fails." },
      { name: "Tools & Templates", weight: "25%", description: "Checklists, worksheets, scripts, and formulas. Fill-in-the-blank resources readers can use immediately — these become the most-shared pages." },
      { name: "Before/After Proof", weight: "20%", description: "Named case studies showing transformation with specific numbers: 'Company X went from $0 to $1.5M in 8 months using this system.'" },
      { name: "Author Credibility Story", weight: "20%", description: "The author's personal journey using this exact system. Shows vulnerability in the struggle, then credibility in the results." },
    ],
  },
  memoir_narrative: {
    whyItWorks: "Narrative nonfiction bestsellers like Rich Dad Poor Dad and Shoe Dog teach through story. The lesson IS the narrative — readers learn by living the author's journey.",
    componentDetails: [
      { name: "Central Narrative Arc", weight: "35%", description: "One compelling story with characters, conflict, rising tension, turning points, and resolution. The story carries the entire book." },
      { name: "Embedded Lessons", weight: "25%", description: "Teaching moments woven INTO the story — not bolted on. Each chapter's lesson emerges naturally from the narrative events." },
      { name: "Emotional Resonance", weight: "25%", description: "Vulnerability, humor, pain, and triumph. The reader must FEEL the journey — emotional highs and lows create investment." },
      { name: "Universal Principles", weight: "15%", description: "Timeless takeaways that transcend the author's specific situation and apply to the reader's life. Memorable enough to quote." },
    ],
  },
  research_academic: {
    whyItWorks: "Research bestsellers like Thinking Fast and Slow and Outliers reveal surprising findings from original data, then make them accessible through storytelling. The 'aha!' factor drives word-of-mouth.",
    componentDetails: [
      { name: "Original Research/Data", weight: "35%", description: "Proprietary studies, experiments, or data analysis revealing new insights. Sample sizes, methodology, and peer-reviewed sources build trust." },
      { name: "Surprising Findings", weight: "25%", description: "Counterintuitive results that challenge assumptions. Every chapter needs an 'aha' moment — 'What you think you know is wrong.'" },
      { name: "Accessible Storytelling", weight: "25%", description: "Complex ideas made simple through vivid examples, real-world analogies, and narrative flow between studies. Jargon-free and engaging." },
      { name: "Practical Implications", weight: "15%", description: "'So what?' — how the research applies to the reader's life or work. Without this, it stays academic instead of becoming a bestseller." },
    ],
  },
  motivational_inspirational: {
    whyItWorks: "Motivational bestsellers like Think and Grow Rich and The Secret build a core belief system, demonstrate it with transformation stories, then give readers exercises to internalize it.",
    componentDetails: [
      { name: "Core Belief System", weight: "30%", description: "A central philosophy or worldview — 'Thoughts become things' or 'Whatever the mind can conceive, it can achieve.' Repeated until it becomes a mantra." },
      { name: "Transformation Stories", weight: "30%", description: "The author's story plus multiple others showing the belief system in action. Before/after journeys that prove the philosophy works." },
      { name: "Exercises & Practices", weight: "20%", description: "Meditations, journaling prompts, affirmations, and daily practices. Readers need something to DO to internalize the beliefs." },
      { name: "Emotional Energy", weight: "20%", description: "Passionate, direct voice. Reader feels empowered and energized after each chapter. Builds momentum and ends on high notes." },
    ],
  },
};

interface FrameworkExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FrameworkExplainerModal({ isOpen, onClose }: FrameworkExplainerModalProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>(GENRES[0].id);

  const genre = GENRES.find((g) => g.id === selectedGenre);
  const details = genreDetails[selectedGenre];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">How We Score Your Manuscript</h2>
                  <p className="text-sm text-muted-foreground">
                    Each genre has a proven framework with 4 weighted components
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* Genre Sidebar */}
              <div className="md:w-64 md:border-r border-b md:border-b-0 overflow-x-auto md:overflow-y-auto p-3 bg-secondary/20">
                <p className="text-xs font-medium text-muted-foreground mb-2 px-2">SELECT A GENRE</p>
                <div className="flex md:flex-col gap-1">
                  {GENRES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(g.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left text-sm transition-all whitespace-nowrap md:whitespace-normal ${
                        selectedGenre === g.id
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-500"
                          : "hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <span className={selectedGenre === g.id ? "text-amber-500" : "text-muted-foreground"}>
                        {genreIcons[g.id]}
                      </span>
                      <span className="font-medium">{g.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Panel */}
              <div className="flex-1 overflow-y-auto p-5">
                {genre && details && (
                  <div className="space-y-5">
                    {/* Framework Name */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-500">{genreIcons[genre.id]}</span>
                        <h3 className="text-xl font-bold">{genre.framework}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {genre.examples.map((ex, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {ex}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{details.whyItWorks}</p>
                    </div>

                    {/* Components */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-muted-foreground">THE 4 SCORING DIMENSIONS</h4>
                      {details.componentDetails.map((comp, idx) => {
                        const colors = [
                          "border-purple-500/40 bg-purple-500/10",
                          "border-blue-500/40 bg-blue-500/10",
                          "border-green-500/40 bg-green-500/10",
                          "border-amber-500/40 bg-amber-500/10",
                        ];
                        const textColors = ["text-purple-400", "text-blue-400", "text-green-400", "text-amber-400"];
                        return (
                          <div
                            key={idx}
                            className={`border rounded-xl p-4 ${colors[idx]}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`font-semibold ${textColors[idx]}`}>{comp.name}</h5>
                              <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded-full">
                                {comp.weight} weight
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{comp.description}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Scoring Scale */}
                    <div className="bg-secondary/40 rounded-xl p-4">
                      <h4 className="text-sm font-semibold mb-3">SCORING SCALE</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Strong (80–100%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span>Moderate (40–79%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span>Weak (1–39%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500" />
                          <span>Missing (0%)</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Bestseller-ready manuscripts score 70%+ on all components. Your overall score is a weighted average.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-secondary/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                The analyzer automatically detects your genre and applies the matching framework.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
