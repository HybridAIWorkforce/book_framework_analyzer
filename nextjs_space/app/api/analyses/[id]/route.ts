export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFile } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
    });
    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Fetch analysis error:", error);
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const analysis = await prisma.analysis.update({
      where: { id: params.id },
      data: { notes: body.notes },
    });
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Update analysis error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
    });
    if (analysis?.cloudStoragePath) {
      await deleteFile(analysis.cloudStoragePath).catch(console.error);
    }
    await prisma.analysis.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete analysis error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
