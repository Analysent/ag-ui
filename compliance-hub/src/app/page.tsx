"use client";

import React, { useState, useMemo } from "react";
import { HeroSection } from "@/components/HeroSection";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { AICopilot } from "@/components/AICopilot";
import { FrameworksBadges } from "@/components/FrameworksBadges";
import { Header } from "@/components/Header";
import {
  RESOURCES,
  CATEGORIES,
  getResourcesByCategory,
  searchResources,
} from "@/data/resources";
import { ResourceCategory } from "@/types";
import { Filter, X, CheckSquare, Square } from "lucide-react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<
    ResourceCategory | "all"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCommercial, setShowCommercial] = useState(true);
  const [showDeprecated, setShowDeprecated] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const filteredResources = useMemo(() => {
    let results = getResourcesByCategory(selectedCategory);

    if (searchQuery.trim()) {
      results = searchResources(results, searchQuery.trim());
    }

    if (!showCommercial) {
      results = results.filter((r) => !r.isCommercial);
    }

    if (!showDeprecated) {
      results = results.filter((r) => !r.isDeprecated);
    }

    return results;
  }, [selectedCategory, searchQuery, showCommercial, showDeprecated]);

  const categoryLabel = useMemo(() => {
    if (selectedCategory === "all") return "All Resources";
    return (
      CATEGORIES.find((c) => c.id === selectedCategory)?.label ||
      "All Resources"
    );
  }, [selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onToggleAI={() => setAiOpen((v) => !v)} aiOpen={aiOpen} />

      <main className="flex flex-1 flex-col">
        <HeroSection />
        <FrameworksBadges />

        <div id="resources" className="flex flex-1">
          {/* Sidebar — desktop */}
          <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-5">
              <CategoryFilter
                selected={selectedCategory}
                onSelect={(cat) => {
                  setSelectedCategory(cat);
                  setMobileSidebarOpen(false);
                }}
              />

              {/* Filters */}
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                  Filters
                </p>
                <ToggleFilter
                  label="Show Commercial Tools"
                  checked={showCommercial}
                  onChange={setShowCommercial}
                />
                <ToggleFilter
                  label="Show Deprecated"
                  checked={showDeprecated}
                  onChange={setShowDeprecated}
                />
              </div>

              {/* Legend */}
              <div className="mt-6 border-t border-border pt-5 px-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Legend
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                      commercial
                    </span>
                    Paid or freemium
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px]">
                      open-source
                    </span>
                    Free, OSS
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-[10px]">
                      deprecated
                    </span>
                    No longer maintained
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 h-full w-72 bg-background border-r border-border p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-foreground">Filter Resources</span>
                  <button onClick={() => setMobileSidebarOpen(false)}>
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <CategoryFilter
                  selected={selectedCategory}
                  onSelect={(cat) => {
                    setSelectedCategory(cat);
                    setMobileSidebarOpen(false);
                  }}
                />
                <div className="mt-6 border-t border-border pt-5">
                  <ToggleFilter
                    label="Show Commercial Tools"
                    checked={showCommercial}
                    onChange={setShowCommercial}
                  />
                  <ToggleFilter
                    label="Show Deprecated"
                    checked={showDeprecated}
                    onChange={setShowDeprecated}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0 p-5 lg:p-8">
            {/* Search + mobile filter button */}
            <div className="mb-6 flex gap-3">
              <div className="flex-1">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors lg:hidden"
              >
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            <ResourceGrid
              resources={filteredResources}
              categoryLabel={categoryLabel}
            />
          </div>

          {/* AI Copilot Panel */}
          {aiOpen && (
            <div className="hidden lg:flex w-96 shrink-0 flex-col border-l border-border">
              <AICopilot onClose={() => setAiOpen(false)} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <p>
          Commercial tools are marked. Deprecated projects are flagged. Anything
          that doesn&apos;t specifically work with cloud governance gets cut.
        </p>
        <p className="mt-1">
          If you maintain something that should be here,{" "}
          <a
            href="https://github.com/analysent/ag-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            open a PR
          </a>
          .
        </p>
      </footer>
    </div>
  );
}

function ToggleFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {checked ? (
        <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      ) : (
        <Square className="h-4 w-4 shrink-0" />
      )}
      {label}
    </button>
  );
}
