"use client";

import React from "react";
import {
  Shield,
  Search,
  Cloud,
  FileText,
  Zap,
  GitBranch,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { CATEGORIES, RESOURCES } from "@/data/resources";
import { ResourceCategory } from "@/types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Search,
  Cloud,
  FileText,
  Zap,
  GitBranch,
  BookOpen,
};

const COLOR_MAP: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400",
  orange: "text-orange-600 dark:text-orange-400",
  purple: "text-purple-600 dark:text-purple-400",
  green: "text-green-600 dark:text-green-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  red: "text-red-600 dark:text-red-400",
  teal: "text-teal-600 dark:text-teal-400",
};

interface CategoryFilterProps {
  selected: ResourceCategory | "all";
  onSelect: (cat: ResourceCategory | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const allCount = RESOURCES.length;

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
        Categories
      </p>

      {/* All */}
      <button
        onClick={() => onSelect("all")}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
          selected === "all"
            ? "bg-blue-600 text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <span className="flex items-center gap-2.5">
          <LayoutGrid className="h-4 w-4 shrink-0" />
          All Resources
        </span>
        <span
          className={cn(
            "text-xs font-medium tabular-nums",
            selected === "all" ? "text-blue-200" : "text-muted-foreground"
          )}
        >
          {allCount}
        </span>
      </button>

      {/* Individual categories */}
      {CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || Shield;
        const count = RESOURCES.filter((r) => r.category === cat.id).length;
        const isSelected = selected === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
              isSelected
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isSelected ? "text-blue-200" : COLOR_MAP[cat.color]
                )}
              />
              {cat.label}
            </span>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                isSelected ? "text-blue-200" : "text-muted-foreground"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
