/**
 * Shared export utility with retry logic and detailed error handling.
 * Used by analysis-view, history page, and analysis detail page.
 */

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

interface ExportError {
  message: string;
  isRetryable: boolean;
  guidance?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function exportAnalysisReport(
  analysisId: string,
  format: string = "markdown"
): Promise<{ success: boolean; error?: ExportError }> {
  let lastError: ExportError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY_MS * attempt);
      }

      const response = await fetch(
        `/api/export?id=${encodeURIComponent(analysisId)}&format=${encodeURIComponent(format)}`
      );

      if (!response.ok) {
        let serverMsg = "";
        try {
          const errData = await response.json();
          serverMsg = errData.message || errData.error || "";
        } catch {
          // non-JSON error body
        }

        if (response.status === 404) {
          return {
            success: false,
            error: {
              message: serverMsg || "Analysis not found. It may have been deleted.",
              isRetryable: false,
              guidance: "Go back to the home page and run a new analysis.",
            },
          };
        }

        if (response.status === 400) {
          return {
            success: false,
            error: {
              message: serverMsg || "Invalid export request.",
              isRetryable: false,
            },
          };
        }

        // 500+ errors are retryable
        lastError = {
          message: serverMsg || `Server error (${response.status}). Retrying...`,
          isRetryable: true,
          guidance: "The export service encountered an issue. Retrying automatically.",
        };
        continue;
      }

      const data = await response.json();

      if (!data.content) {
        return {
          success: false,
          error: {
            message: "The analysis is still processing or has no results to export yet.",
            isRetryable: false,
            guidance: "Wait for the analysis to complete, then try exporting again.",
          },
        };
      }

      // Trigger download
      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "analysis-report.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (e: any) {
      lastError = {
        message:
          e?.message === "Failed to fetch"
            ? "Network error — check your internet connection."
            : `Export error: ${e?.message || "Unknown error"}`,
        isRetryable: attempt < MAX_RETRIES,
        guidance:
          e?.message === "Failed to fetch"
            ? "Make sure you're connected to the internet and try again."
            : "If this keeps happening, try refreshing the page.",
      };
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError || {
      message: "Export failed after multiple attempts.",
      isRetryable: false,
      guidance: "Try refreshing the page and exporting again. If the issue persists, re-run the analysis.",
    },
  };
}
