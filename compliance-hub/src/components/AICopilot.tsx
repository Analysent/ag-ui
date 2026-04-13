"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { X, Bot, Sparkles } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "How do I get started with cloud compliance?",
  "What tool is best for SOC 2 compliance?",
  "Compare OPA vs Kyverno for Kubernetes",
  "How do I detect infrastructure drift?",
  "What does FedRAMP require in AWS?",
  "Checkov vs tfsec vs Trivy — which to use?",
];

interface AICopilotProps {
  onClose: () => void;
}

export function AICopilot({ onClose }: AICopilotProps) {
  return (
    <div className="flex h-full flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-gradient-to-r from-blue-950 to-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Compliance Assistant</p>
            <p className="text-[11px] text-blue-300">Ask me anything</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested prompts */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="h-3 w-3 text-blue-500" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suggested Questions
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-blue-500/50 hover:text-foreground transition-colors text-left"
              onClick={() => {
                // We'd need to wire this to the CopilotChat input
                // For now it's a visual hint
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          showDevConsole={false}
          agent="complianceAgent"
        >
          <CopilotChat
            className="h-full"
            labels={{
              initial:
                "Hey — I know this space pretty well. Ask me about tools, frameworks, where to start, or how to pick between options. Happy to help.",
              placeholder: "What are you trying to figure out?",
            }}
          />
        </CopilotKit>
      </div>
    </div>
  );
}
