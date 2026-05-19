export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Login is handled by NextAuth's [...nextauth] route via signIn("credentials").
// This route exists for API consistency.
export async function POST() {
  return NextResponse.json(
    { message: "Please use /api/auth/callback/credentials for login via NextAuth" },
    { status: 200 }
  );
}
