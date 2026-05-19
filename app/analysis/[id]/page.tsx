import { Metadata } from "next";
import { AnalysisDetailClient } from "./_components/analysis-detail-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analysis Details | Book Framework Analyzer",
};

export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
  return <AnalysisDetailClient id={params?.id || ""} />;
}
