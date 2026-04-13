import React from "react";
import { STATS } from "@/data/resources";

const FRAMEWORK_COLORS: Record<string, string> = {
  CIS: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  "SOC 2": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  "PCI DSS": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "NIST 800-53": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  FedRAMP: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  HIPAA: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
  "ISO 27001": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  GDPR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
};

export function FrameworksBadges() {
  return (
    <div
      id="frameworks"
      className="border-b border-border bg-muted/30 py-4"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Compliance Frameworks:
          </span>
          {STATS.frameworks.map((fw) => (
            <span
              key={fw}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                FRAMEWORK_COLORS[fw] ||
                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {fw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
