import React from "react";
import { Resource } from "@/types";
import { ResourceCard } from "./ResourceCard";
import { Search } from "lucide-react";

interface ResourceGridProps {
  resources: Resource[];
  categoryLabel: string;
}

export function ResourceGrid({ resources, categoryLabel }: ResourceGridProps) {
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No results found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different search term or category
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">{categoryLabel}</h2>
        <span className="text-sm text-muted-foreground">
          {resources.length} {resources.length === 1 ? "resource" : "resources"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
