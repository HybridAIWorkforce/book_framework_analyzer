export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || searchParams.get("analysisId");
  const format = searchParams.get("format") || "markdown";

  if (!id) {
    return NextResponse.json(
      { error: "missing_id", message: "No analysis ID provided." },
      { status: 400 }
    );
  }

  let analysis;
  try {
    analysis = await prisma.analysis.findUnique({ where: { id } });
  } catch (dbErr: any) {
    console.error("Export DB error:", dbErr);
    return NextResponse.json(
      { error: "database_error", message: "Could not retrieve the analysis. Please try again." },
      { status: 500 }
    );
  }

  if (!analysis) {
    return NextResponse.json(
      { error: "not_found", message: "Analysis not found. It may have been deleted." },
      { status: 404 }
    );
  }

  if (!analysis.suggestions) {
    // Analysis exists but hasn't completed yet
    const statusMsg =
      analysis.status === "analyzing"
        ? "This analysis is still in progress. Please wait for it to complete."
        : analysis.status === "error"
        ? "This analysis encountered an error and has no results to export. Try running it again."
        : "This analysis has no results to export yet.";
    return NextResponse.json(
      { error: "no_results", message: statusMsg },
      { status: 404 }
    );
  }

  const data = analysis.suggestions as any;

  let content = `# Book Framework Analysis: ${analysis.filename}\n`;
  content += `\n**Analyzed:** ${analysis.createdAt.toLocaleDateString()}\n`;
  content += `\n---\n\n`;

  // Genre Detection
  if (data.detectedGenre) {
    const genre = data.detectedGenre;
    content += `## Detected Genre\n\n`;
    content += `**Genre:** ${genre.name || "Unknown"}\n`;
    content += `**Confidence:** ${genre.confidence || 0}%\n`;
    content += `**Framework:** ${genre.frameworkName || "Unknown"}\n`;
    if (genre.provenBy?.length) {
      content += `**Proven By:** ${genre.provenBy.join(", ")}\n`;
    }
    if (genre.reasoning) {
      content += `\n> ${genre.reasoning}\n`;
    }
    content += `\n`;
  }

  // Overall Score
  if (data.overallScore !== undefined) {
    content += `## Bestseller Readiness Score: ${data.overallScore}%\n\n`;
  }

  // Component Scores
  if (data.componentScores) {
    content += `## Component Scores\n\n`;
    for (const [key, comp] of Object.entries(data.componentScores)) {
      const c = comp as any;
      content += `### ${c.name || key} (${c.weight || "N/A"}) — Score: ${c.score || 0}%\n\n`;
      
      if (c.present?.length) {
        content += `**✓ Present:**\n`;
        c.present.forEach((p: string) => content += `- ${p}\n`);
        content += `\n`;
      }
      if (c.missing?.length) {
        content += `**✗ Missing:**\n`;
        c.missing.forEach((m: string) => content += `- ${m}\n`);
        content += `\n`;
      }
      if (c.fixes?.length) {
        content += `**🔧 Fixes:**\n\n`;
        c.fixes.forEach((f: any, i: number) => {
          content += `${i + 1}. **Issue:** ${f.issue || ""}\n`;
          content += `   **Fix:** ${f.fix || ""}\n`;
          if (f.whereToAdd) content += `   **Where:** ${f.whereToAdd}\n`;
          if (f.example) content += `   **Bestseller Example:** ${f.example}\n`;
          content += `\n`;
        });
      }
    }
  }

  // Prioritized Fixes
  if (data.prioritizedFixes?.length) {
    content += `## Priority Fixes\n\n`;
    data.prioritizedFixes.forEach((f: any) => {
      content += `### #${f.priority || ""} — ${f.component || ""}\n`;
      content += `**Issue:** ${f.issue || ""}\n`;
      content += `**Fix:** ${f.fix || ""}\n`;
      if (f.impact) content += `**Impact:** ${f.impact}\n`;
      if (f.bestseller_example) content += `**Example:** ${f.bestseller_example}\n`;
      content += `\n`;
    });
  }

  // Transformation Summary
  if (data.transformationSummary) {
    content += `## Transformation Summary\n\n${data.transformationSummary}\n\n`;
  }

  // Current Structure
  if (data.currentStructure?.chapters?.length) {
    content += `## Manuscript Structure\n\n`;
    content += `**Chapters:** ${data.currentStructure.totalChapters || data.currentStructure.chapters.length}\n`;
    content += `**Estimated Words:** ${(data.currentStructure.estimatedWordCount || 0).toLocaleString()}\n\n`;
    data.currentStructure.chapters.forEach((ch: any) => {
      content += `### Ch ${ch.chapterNumber || ""}: ${ch.title || "Untitled"}\n`;
      if (ch.keyPoints?.length) {
        ch.keyPoints.forEach((p: string) => content += `- ${p}\n`);
      }
      content += `\n`;
    });
  }

  if (analysis.notes) {
    content += `## Notes\n\n${analysis.notes}\n`;
  }

  try {
    return NextResponse.json({
      content,
      filename: `analysis-${analysis.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}.md`,
    });
  } catch (serializeErr: any) {
    console.error("Export serialization error:", serializeErr);
    return NextResponse.json(
      { error: "generation_error", message: "Failed to generate the export file. The analysis data may be corrupted." },
      { status: 500 }
    );
  }
}
