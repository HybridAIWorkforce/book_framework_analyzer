export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const analyses = await prisma.analysis.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Fetch analyses error:", error);
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
  }
}
