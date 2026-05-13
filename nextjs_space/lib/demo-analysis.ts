/**
 * Pre-filled demo analysis data for the landing page.
 * Showcases what the tool produces — based on the HOW_TO_PLAYBOOK genre
 * (a realistic example using a fictional recruitment playbook manuscript).
 */

import type { AnalysisResult } from "@/lib/types";

export const DEMO_ANALYSIS: AnalysisResult = {
  detectedGenre: {
    id: "how_to_playbook",
    name: "How-To Playbook",
    confidence: 92,
    reasoning:
      "The manuscript teaches a specific methodology for modern recruitment using step-by-step processes, scripts, templates, and real case studies — matching the How-To Playbook genre pattern used by bestsellers like $100M Offers and Traction.",
    frameworkName: "The Step-by-Step System",
    provenBy: ["$100M Offers", "Traction (EOS)", "The 4-Hour Workweek"],
  },
  currentStructure: {
    chapters: [
      {
        title: "Why Traditional Recruiting Is Broken",
        chapterNumber: 1,
        content:
          "The recruiting industry hasn't fundamentally changed its approach in decades. While marketing has embraced data-driven funnels, A/B testing, and conversion optimization, most recruiters still rely on job boards and cold outreach with response rates below 3%. This chapter exposes the core problem: recruiters are using 1990s sales tactics in a 2020s talent market...",
        keyPoints: [
          "Job board response rates have dropped 67% since 2015",
          "Growth marketing principles directly apply to candidate sourcing",
          "The candidate funnel mirrors the marketing funnel",
        ],
      },
      {
        title: "The Recruitment Growth Engine",
        chapterNumber: 2,
        content:
          "The core system has four phases: Attract, Engage, Convert, and Retain. Each phase borrows proven tactics from growth marketing and applies them to talent acquisition. Phase 1 — Attract — uses content marketing and employer branding to create inbound candidate flow rather than relying solely on outbound sourcing...",
        keyPoints: [
          "4-phase system: Attract → Engage → Convert → Retain",
          "Inbound candidate generation reduces cost-per-hire by 40%",
          "Each phase has measurable KPIs borrowed from marketing",
        ],
      },
      {
        title: "Building Your Candidate Funnel",
        chapterNumber: 3,
        content:
          "Just like a marketing funnel, your recruitment funnel needs optimization at every stage. Top of funnel: employer brand content, targeted job ads with conversion-optimized copy. Middle of funnel: automated nurture sequences, personalized outreach templates. Bottom of funnel: structured interview scripts, compelling offer frameworks...",
        keyPoints: [
          "Funnel optimization techniques from growth marketing",
          "Template-driven outreach increases response rates 3x",
          "Structured scoring reduces bias and improves quality of hire",
        ],
      },
    ],
    totalChapters: 14,
    estimatedWordCount: 58000,
  },
  componentScores: {
    component1: {
      name: "Clear Sequential Process",
      weight: "35%",
      score: 78,
      present: [
        "Strong 4-phase system (Attract → Engage → Convert → Retain)",
        "Clear chapter progression following the system",
        "Numbered steps within each phase",
      ],
      missing: [
        "No visual roadmap or process diagram referenced",
        "Phase transitions aren't clearly signposted — reader may lose track of where they are in the system",
      ],
      fixes: [
        {
          issue: "No master roadmap that readers can reference throughout",
          fix: "Add a one-page visual 'Recruitment Growth Engine' roadmap in Chapter 2 and reference it at the start of each subsequent chapter with 'You are here' markers",
          example:
            "$100M Offers includes the 'Value Equation' visual that readers reference throughout — it becomes the book's anchor",
          whereToAdd: "Chapter 2, and recapped at start of Chapters 3-14",
        },
      ],
    },
    component2: {
      name: "Tools & Templates",
      weight: "25%",
      score: 52,
      present: [
        "Outreach message templates in Chapter 5",
        "Interview scoring rubric mentioned in Chapter 9",
      ],
      missing: [
        "No downloadable resources or companion toolkit",
        "Templates are described but not presented as fill-in-the-blank ready",
        "Missing: offer letter template, ROI calculator, candidate scoring sheet",
      ],
      fixes: [
        {
          issue: "Templates are described in prose rather than formatted as usable tools",
          fix: "Convert each template into a boxed, fill-in-the-blank format readers can photocopy or download. Add a 'Toolkit' appendix with all templates consolidated.",
          example:
            "Traction (EOS) includes the V/TO, Scorecard, and Accountability Chart as actual fill-in worksheets — they became the most-shared pages",
          whereToAdd: "Chapters 5, 7, 9, and a new Appendix",
        },
        {
          issue: "No companion digital resources",
          fix: "Create a resources page (reshapingrecruitment.com/toolkit) with downloadable spreadsheets, email sequences, and calculators referenced in each chapter",
          example:
            "The 4-Hour Workweek drives readers to a resources page for templates — this became a major lead generation tool",
          whereToAdd: "Mention in Introduction and every chapter with a template",
        },
      ],
    },
    component3: {
      name: "Before/After Proof",
      weight: "20%",
      score: 41,
      present: [
        "Author mentions general results from clients",
        "Some metrics referenced (3x response rates, 40% cost reduction)",
      ],
      missing: [
        "No named case studies with specific companies",
        "Results are mentioned in passing, not structured as before/after transformations",
        "Missing timeline — how long does the transformation take?",
      ],
      fixes: [
        {
          issue: "Case studies are generic — 'one client saw 3x improvement' without names or details",
          fix: "Add 3-5 named case studies with the format: Company situation → Applied which phase → Specific results with numbers → Timeline. Even disguised names ('TechCo, a 200-person SaaS company') work better than unnamed references.",
          example:
            "$100M Offers uses detailed case studies with specific revenue numbers — '$0 to $1.5M in 8 months using this exact offer structure'",
          whereToAdd: "One case study per phase (Chapters 3, 6, 9, 12)",
        },
      ],
    },
    component4: {
      name: "Author Credibility Story",
      weight: "20%",
      score: 65,
      present: [
        "Author's recruiting background is mentioned in the introduction",
        "References to personal experience throughout",
      ],
      missing: [
        "No vulnerable origin story — what failure or frustration led to developing this system?",
        "Missing specific personal results and scale of impact",
      ],
      fixes: [
        {
          issue: "Author credentials are stated but the personal journey isn't shown",
          fix: "Add a dedicated 'My Story' section in Chapter 1 showing: the failure that sparked the idea → the experimentation phase → the breakthrough → the scale. Show vulnerability — readers need to see you struggled before you succeeded.",
          example:
            "In E-Myth Revisited, Gerber opens with his own consulting failure that led to the discovery — readers trust him because he shows the struggle",
          whereToAdd: "Chapter 1, expanded introduction",
        },
      ],
    },
  },
  overallScore: 61,
  prioritizedFixes: [
    {
      priority: 1,
      component: "Before/After Proof",
      issue: "No named, detailed case studies showing the system's real-world results",
      fix: "Add 3-5 structured case studies with company context, actions taken, specific metrics, and timeline",
      impact:
        "This is the #1 gap. How-To Playbooks live or die by proof. Without concrete case studies, readers will doubt the system works.",
      bestseller_example:
        "$100M Offers built its entire marketing on specific before/after client transformations",
    },
    {
      priority: 2,
      component: "Tools & Templates",
      issue: "Templates described in prose instead of formatted as usable tools",
      fix: "Convert all templates into fill-in-the-blank format, add a consolidated Toolkit appendix, and create a companion website",
      impact:
        "Usable templates are what make How-To books 'sticky' — readers return to them, share them, and recommend the book because of them.",
      bestseller_example:
        "Traction's worksheets are the most-photographed pages on social media — they sell the book",
    },
    {
      priority: 3,
      component: "Clear Sequential Process",
      issue: "No visual roadmap or 'you are here' markers between phases",
      fix: "Create a master visual diagram of the 4-phase system and reference it at every phase transition",
      impact:
        "Readers of playbooks need constant orientation — without it they feel lost by Chapter 6 and stop reading.",
      bestseller_example:
        "$100M Offers' Value Equation visual is the most-saved image from the book — it anchors every chapter",
    },
  ],
  transformationSummary:
    "This manuscript has a solid foundation — the 4-phase system is logical and the growth marketing angle is genuinely differentiated. The biggest gap is in proof: the book needs named case studies with specific before/after metrics to convince readers the system works. Secondary priorities are making the templates actually usable (fill-in-the-blank format) and adding a visual roadmap. With these changes, this book moves from a 61% to a projected 80%+ bestseller readiness score — firmly in the competitive range for the How-To Playbook genre.",
};
