export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getFileUrl } from "@/lib/s3";
import { FRAMEWORK_KNOWLEDGE } from "@/lib/framework-knowledge";

export async function POST(request: NextRequest) {
  const { analysisId, chapterByChapter } = await request.json();

  if (!analysisId) {
    return new Response(JSON.stringify({ error: "Missing analysisId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const analysis = await prisma.analysis.findUnique({ where: { id: analysisId } });
  if (!analysis) {
    return new Response(JSON.stringify({ error: "Analysis not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get signed URL for the PDF
  let fileUrl: string;
  try {
    fileUrl = await getFileUrl(analysis.cloudStoragePath, false);
  } catch (e) {
    console.error("Failed to get file URL:", e);
    await prisma.analysis.update({ where: { id: analysisId }, data: { status: "error" } });
    return new Response(
      JSON.stringify({
        error: "file_access_error",
        message: "Could not access the uploaded file. Please re-upload your manuscript.",
        guidance: "Try uploading the file again. Make sure the PDF is not corrupted.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Download PDF and convert to base64
  let base64String: string;
  try {
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) throw new Error(`HTTP ${pdfResponse.status}`);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const sizeInMB = pdfBuffer.byteLength / (1024 * 1024);

    if (pdfBuffer.byteLength < 100) {
      throw new Error("PDF file is empty or too small");
    }

    // Check for very large files (>50MB after base64 may exceed LLM limits)
    if (sizeInMB > 50) {
      await prisma.analysis.update({ where: { id: analysisId }, data: { status: "error" } });
      return new Response(
        JSON.stringify({
          error: "file_too_large",
          message: `Your manuscript is ${sizeInMB.toFixed(0)}MB, which exceeds the 50MB analysis limit.`,
          guidance: "Try compressing the PDF or reducing image resolution. If your PDF contains many images, consider using a tool like Smallpdf to optimize it.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    base64String = Buffer.from(pdfBuffer).toString("base64");
  } catch (e: any) {
    console.error("PDF download/processing error:", e);
    await prisma.analysis.update({ where: { id: analysisId }, data: { status: "error" } });
    return new Response(
      JSON.stringify({
        error: "pdf_processing_error",
        message: "Failed to process the PDF file.",
        guidance: "The PDF may be corrupted or password-protected. Please ensure the file is a valid, unprotected PDF and try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemPrompt = `You are an expert book structure analyst. You analyze manuscripts by first detecting their genre, then applying the PROVEN FRAMEWORK for that specific genre.

${FRAMEWORK_KNOWLEDGE}

## Your Task:
1. DETECT the genre of this manuscript (choose the single best match from the 6 genres above)
2. APPLY that genre's specific framework and score each of its 4 components
3. Provide SPECIFIC fixes for each component based on bestsellers in that genre

## CRITICAL RULES:
- Extract actual text excerpts from the manuscript as evidence
- Be SPECIFIC about what's missing and exactly how to fix it
- Reference bestsellers FROM THE DETECTED GENRE as examples
- Preserve author's voice - suggest additions and restructuring, not rewrites
- Score components using their WEIGHTED importance for that genre
- If the PDF appears to be a scanned document (images of text rather than selectable text), still analyze it using the visible content from the scanned pages. OCR the visible text and proceed normally.
- If the document is unreadable (blank pages, entirely redacted, or severely corrupted), return a JSON with detectedGenre.id set to "unreadable" and reasoning explaining the issue.

Respond in JSON format:
{
  "detectedGenre": {
    "id": "business_strategy|self_help_productivity|how_to_playbook|memoir_narrative|research_academic|motivational_inspirational",
    "name": "Human readable genre name",
    "confidence": 0-100,
    "reasoning": "Why this genre was detected - reference specific content from the manuscript",
    "frameworkName": "The framework name for this genre (e.g. The Authority Builder, The Step-by-Step System, etc.)",
    "provenBy": ["Bestseller 1", "Bestseller 2", "Bestseller 3"]
  },
  "currentStructure": {
    "chapters": [
      {
        "title": "Chapter title from manuscript",
        "chapterNumber": 1,
        "content": "Extract actual opening paragraphs and key content (500+ words)",
        "keyPoints": ["Main point 1", "Main point 2"]
      }
    ],
    "totalChapters": number,
    "estimatedWordCount": number
  },
  "componentScores": {
    "component1": {
      "name": "The name of this component from the genre's framework",
      "weight": "The weight percentage for this component",
      "score": 0-100,
      "present": ["What elements exist in the manuscript for this component"],
      "missing": ["What elements are missing"],
      "fixes": [
        {
          "issue": "Specific problem",
          "fix": "Exactly what to add/change",
          "example": "How [genre bestseller] does this",
          "whereToAdd": "Which chapter or section"
        }
      ]
    },
    "component2": { "name": "...", "weight": "...", "score": 0-100, "present": [], "missing": [], "fixes": [] },
    "component3": { "name": "...", "weight": "...", "score": 0-100, "present": [], "missing": [], "fixes": [] },
    "component4": { "name": "...", "weight": "...", "score": 0-100, "present": [], "missing": [], "fixes": [] }
  },
  "overallScore": 0-100,
  "prioritizedFixes": [
    {
      "priority": 1,
      "component": "The component name this fix applies to",
      "issue": "The biggest gap",
      "fix": "Specific action to take",
      "impact": "Why this matters for bestseller potential in this genre",
      "bestseller_example": "How [specific genre bestseller] handles this"
    }
  ],
  "transformationSummary": "Overall assessment and path to bestseller-ready for this genre"
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

  await prisma.analysis.update({
    where: { id: analysisId },
    data: { status: "analyzing" },
  });

  const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "file",
              file: {
                filename: analysis.filename,
                file_data: `data:application/pdf;base64,${base64String}`,
              },
            },
            {
              type: "text",
              text: "Analyze this manuscript and provide framework transformation suggestions. Remember to preserve all original text - suggest structural changes only.",
            },
          ],
        },
      ],
      stream: true,
      max_tokens: 8000,
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok || !response.body) {
    const errBody = await response.text().catch(() => "");
    console.error("LLM API error:", response.status, errBody);
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: "error" },
    });

    // Detect scan-only or unreadable PDF from LLM refusal
    const isContentIssue = errBody.toLowerCase().includes("cannot") || errBody.toLowerCase().includes("unable");
    return new Response(
      JSON.stringify({
        error: isContentIssue ? "pdf_content_error" : "llm_error",
        message: isContentIssue
          ? "The AI could not extract text from this PDF. It may be a scanned document or image-only PDF."
          : "Analysis engine encountered an error. Please try again.",
        guidance: isContentIssue
          ? "If your PDF is a scanned document, try running it through an OCR tool (like Adobe Acrobat or online OCR services) to create a text-searchable version, then re-upload."
          : "This is usually temporary. Wait a moment and try again. If the problem persists, the manuscript may be too large — try splitting it into parts.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  let buffer = "";
  let partialRead = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          partialRead += decoder.decode(value, { stream: true });
          const lines = partialRead.split("\n");
          partialRead = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                try {
                  const finalResult = JSON.parse(buffer);
                  await prisma.analysis.update({
                    where: { id: analysisId },
                    data: {
                      originalStructure: finalResult.currentStructure,
                      suggestions: finalResult,
                      frameworkMatch: finalResult.frameworkAnalysis?.primaryFramework,
                      status: "completed",
                    },
                  });
                  const finalData = JSON.stringify({ status: "completed", result: finalResult });
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                } catch (parseError) {
                  console.error("JSON parse error:", parseError);
                  await prisma.analysis.update({
                    where: { id: analysisId },
                    data: { status: "error" },
                  });
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ status: "error", message: "Parse error" })}\n\n`)
                  );
                }
                return;
              }
              try {
                const parsed = JSON.parse(data);
                buffer += parsed.choices?.[0]?.delta?.content || "";
                const progressData = JSON.stringify({ status: "processing", message: "Analyzing manuscript..." });
                controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
