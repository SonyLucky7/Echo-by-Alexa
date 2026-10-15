"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ChefHat, ToggleLeft, ArrowLeft, LogOut, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check initial auth status by pinging /api/staff/orders
    fetch("/api/staff/orders")
      .then((res) => {
        setIsAuthenticated(res.ok);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/staff/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        throw new Error("Invalid passkey. Default passkey: echo-hearth-pass");
      }

      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/staff/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center">
        <div className="flex items-center gap-2 text-ember">
          <Flame className="w-5 h-5 animate-spin-slow" />
          <span className="font-serif">Authenticating Hearth Operations...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-charcoal text-ivory flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-charcoal-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-ember/20 text-ember mx-auto mb-6">
            <KeyRound className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-2xl font-medium text-center text-ivory mb-2">
            ECHO Staff Operations
          </h2>
          <p className="text-xs text-ivory/60 text-center font-sans mb-8">
            Kitchen Kanban Queue & Service Availability (86)
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ivory/70 mb-2 font-mono">
                Staff Passkey
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff passkey..."
                required
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-ember focus:ring-1 focus:ring-ember transition-all"
              />
              <p className="text-[11px] text-ivory/40 mt-1.5">
                Default configured passkey: <code className="text-ember font-mono">echo-hearth-pass</code>
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="ember"
              size="lg"
              disabled={isLoading}
              className="w-full py-3.5"
            >
              {isLoading ? "Validating..." : "Enter Hearth Dashboard"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-ivory/60 hover:text-ember transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Restaurant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal text-ivory flex flex-col font-sans">
      {/* Top Operations Header */}
      <header className="border-b border-white/10 bg-charcoal-900 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/staff/orders" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ember/20 text-ember flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif font-medium text-base text-ivory">ECHO Operations</h1>
              <span className="text-[10px] text-ember uppercase tracking-wider font-mono">
                Kitchen & Floor Management
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-white/10 pl-4">
            <Link
              href="/staff/orders"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                pathname === "/staff/orders"
                  ? "bg-white/10 text-ivory font-semibold"
                  : "text-ivory/60 hover:text-ivory hover:bg-white/5"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 text-ember" />
              Kitchen Kanban
            </Link>

            <Link
              href="/staff/menu"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                pathname === "/staff/menu"
                  ? "bg-white/10 text-ivory font-semibold"
                  : "text-ivory/60 hover:text-ivory hover:bg-white/5"
              }`}
            >
              <ToggleLeft className="w-3.5 h-3.5 text-forest-light" />
              Dish 86 Toggle
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-ivory/60 hover:text-ivory px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dining Room
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-ivory/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Operations View */}
      <main className="flex-1 p-6 md:p-8 overflow-x-auto">{children}</main>
    </div>
  );
}
