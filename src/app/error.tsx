"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hearth Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-6 md:px-12">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-medium text-charcoal">
            A Hearth Disturbance Occurred
          </h2>
          <p className="text-charcoal/60 text-sm font-light leading-relaxed">
            We encountered an unexpected disruption while preparing this page. Our culinary team has been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="ember"
            size="md"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Rekindle Page</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Return Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
