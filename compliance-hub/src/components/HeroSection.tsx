import React from "react";
import { Shield, Star, GitBranch } from "lucide-react";
import { STATS } from "@/data/resources";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 dark:from-blue-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f20_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f20_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            <Shield className="h-3.5 w-3.5" />
            Cloud Compliance &amp; Governance
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Awesome{" "}
            <span className="text-blue-400">Cloud Compliance</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            I kept opening the same docs over and over — OPA here, Checkov there,
            some Prowler page, a drift detection tool I had starred, a FedRAMP
            guide I shared in Slack. So I built a list. Tools organized by what
            they actually do.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#resources"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors"
            >
              Browse Resources
            </a>
            <a
              href="https://github.com/analysent/ag-ui"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Star className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <StatCard value={STATS.total.toString()} label="Resources" />
            <StatCard value={STATS.categories.toString()} label="Categories" />
            <StatCard value={STATS.openSource.toString()} label="Open Source" />
            <StatCard value={STATS.frameworks.length.toString()} label="Frameworks" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 px-6 py-4">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="mt-1 text-xs text-slate-400">{label}</span>
    </div>
  );
}
