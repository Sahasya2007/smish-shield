import React from "react";
import Link from "next/link";
import MlVisualizer from "@/components/MlVisualizer";

export const metadata = {
  title: "On-Device ML Engine | SmishShield",
  description: "Live ONNX INT8 threat classification pipeline inspection.",
};

export default function MlEnginePage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between pb-6 border-b border-border mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">On-Device ML Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zero-cloud threat vectorization via INT8 Quantized ONNX Runtime.
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition"
        >
          &larr; Back to Dashboard
        </Link>
      </div>

      <MlVisualizer />
    </main>
  );
}