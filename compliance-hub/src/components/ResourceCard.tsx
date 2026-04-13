import React from "react";
import { ExternalLink, DollarSign, AlertTriangle } from "lucide-react";
import { Resource, ResourceTag } from "@/types";
import { cn } from "@/lib/utils";

const TAG_STYLES: Record<string, string> = {
  "open-source": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  commercial: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  deprecated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  "multi-cloud": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  aws: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  azure: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
  gcp: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  terraform: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  kubernetes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cis: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  soc2: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "pci-dss": "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  nist: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  fedramp: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  hipaa: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  iso27001: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  gdpr: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "deliberately-broken": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  article: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  video: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  book: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  course: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

const PRIORITY_TAGS: ResourceTag[] = [
  "open-source",
  "commercial",
  "multi-cloud",
  "aws",
  "azure",
  "gcp",
  "terraform",
  "kubernetes",
  "cis",
  "soc2",
  "pci-dss",
  "nist",
  "fedramp",
  "hipaa",
  "iso27001",
  "gdpr",
  "deliberately-broken",
  "deprecated",
];

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const visibleTags = resource.tags
    .filter((t) => PRIORITY_TAGS.includes(t))
    .slice(0, 4);

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-blue-500/50",
        resource.isDeprecated && "opacity-70"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
              {resource.name}
            </h3>
            {resource.isCommercial && (
              <span className="inline-flex items-center gap-0.5 rounded text-[10px] font-medium text-amber-700 dark:text-amber-400">
                <DollarSign className="h-2.5 w-2.5" />
                Commercial
              </span>
            )}
            {resource.isDeprecated && (
              <span className="inline-flex items-center gap-0.5 rounded text-[10px] font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-2.5 w-2.5" />
                Deprecated
              </span>
            )}
          </div>
          {resource.language && (
            <span className="text-[11px] text-muted-foreground">
              {resource.language}
            </span>
          )}
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-blue-500 transition-colors mt-0.5" />
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed text-muted-foreground flex-1 mb-4 line-clamp-3">
        {resource.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
              TAG_STYLES[tag] ||
                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
