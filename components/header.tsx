"use client";

import { BookOpen, History, Moon, Sun, Sparkles, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession() || {};
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <BookOpen className="h-7 w-7 text-amber-500 transition-transform group-hover:scale-110" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 animate-pulse" />
          </div>
          <span className="font-semibold text-lg">Framework Analyzer</span>
        </Link>
        <nav className="flex items-center gap-2">
          {status === "authenticated" && session?.user ? (
            <>
              <Link
                href="/history"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/60 text-sm">
                <User className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline text-muted-foreground max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-2 rounded-lg bg-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors text-sm"
            >
              Sign In
            </Link>
          ) : null}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
