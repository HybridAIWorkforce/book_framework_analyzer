export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { filename, cloud_storage_path } = await request.json();
    if (!filename || !cloud_storage_path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const analysis = await prisma.analysis.create({
      data: {
        filename,
        cloudStoragePath: cloud_storage_path,
        status: "uploaded",
        userId: session?.user?.id || null,
      },
    });
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "Failed to save analysis record" }, { status: 500 });
  }
}
