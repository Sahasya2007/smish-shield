"use client";

import React, { useState } from "react";

interface LayerOutput {
  name: string;
  type: string;
  shape: string;
  quantization: string;
  status: string;
}

export default function MlVisualizer() {
  const [inputText, setInputText] = useState(
    "URGENT: Your SBI account is suspended. Update KYC now at bit.ly/sbi-kyc-alert or pay pending fee via upi://pay?pa=sbifee@upi"
  );
  const [isInferring, setIsInferring] = useState(false);
  const [tokens, setTokens] = useState<string[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [scores, setScores] = useState<{ smish: number; benign: number } | null>(null);

  const modelLayers: LayerOutput[] = [
    { name: "Input Tokenizer", type: "WordPiece / Subword", shape: "[1, 128]", quantization: "Int64 IDs", status: "Active" },
    { name: "Embedding Projection", type: "Embedding Layer", shape: "[1, 128, 256]", quantization: "INT8 Dynamic", status: "Mapped" },
    { name: "Quantized Transformer Blocks", type: "QLinearMatMul (4x)", shape: "[1, 128, 256]", quantization: "INT8 Symm", status: "Optimized" },
    { name: "Global Pooling & Dense Head", type: "Gemm + Softmax", shape: "[1, 2]", quantization: "FP16 Dequant", status: "Executed" },
  ];

  const runSimulation = () => {
    setIsInferring(true);
    setScores(null);

    const parsedTokens = inputText
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

    setTokens(parsedTokens);

    setTimeout(() => {
      const lower = inputText.toLowerCase();
      const isSuspicious =
        lower.includes("urgent") ||
        lower.includes("suspended") ||
        lower.includes("kyc") ||
        lower.includes("bit.ly") ||
        lower.includes("upi://");

      const smishScore = isSuspicious ? 0.96 : 0.05;
      const benignScore = Number((1 - smishScore).toFixed(2));

      setScores({ smish: smishScore, benign: benignScore });
      setLatency(Math.floor(Math.random() * 20) + 42); // 42ms - 62ms
      setIsInferring(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <label className="block text-sm font-semibold mb-2">
          SMS Payload for On-Device INT8 Inference:
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Target Architecture: <strong>ONNX Runtime Mobile (INT8 Quantized)</strong>
          </span>
          <button
            onClick={runSimulation}
            disabled={isInferring}
            className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {isInferring ? "Computing Tensors..." : "Run ML Inference"}
          </button>
        </div>
      </div>

      {tokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">
              1. Token Decomposition
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Fixed vocabulary sequence mapping ($N=128$, padding truncated).
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {tokens.map((token, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground border border-border font-mono"
                >
                  [{token}]
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2">
              2. Classification Head
            </h3>
            {scores ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Threat Confidence (Smishing)</span>
                    <span>{(scores.smish * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${scores.smish > 0.5 ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${scores.smish * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">On-Device Latency:</span>
                  <span className="font-mono font-bold">{latency} ms (Budget: &lt;120 ms)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">DPDP Act Compliance:</span>
                  <span className="font-semibold">
                    {scores.smish < 0.35 ? "Benign - Memory Flushed" : "Flagged - Threat Hash Retained"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Execute pipeline to generate tensors.</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
          3. Quantized ONNX Execution Graph
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-2">Layer Name</th>
                <th className="pb-2">Operation</th>
                <th className="pb-2">Tensor Shape</th>
                <th className="pb-2">Precision</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modelLayers.map((layer, index) => (
                <tr key={index}>
                  <td className="py-2.5 font-sans font-medium">{layer.name}</td>
                  <td className="py-2.5">{layer.type}</td>
                  <td className="py-2.5">{layer.shape}</td>
                  <td className="py-2.5 text-primary font-semibold">{layer.quantization}</td>
                  <td className="py-2.5 text-muted-foreground">{layer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}