export type ResourceCategory =
  | "policy-engines"
  | "iac-scanners"
  | "cspm"
  | "compliance-frameworks"
  | "automation-platforms"
  | "drift-detection"
  | "learning-resources";

export type ResourceTag =
  | "commercial"
  | "deprecated"
  | "open-source"
  | "cloud-native"
  | "multi-cloud"
  | "aws"
  | "azure"
  | "gcp"
  | "terraform"
  | "kubernetes"
  | "cis"
  | "soc2"
  | "pci-dss"
  | "nist"
  | "fedramp"
  | "hipaa"
  | "iso27001"
  | "gdpr"
  | "article"
  | "video"
  | "book"
  | "course"
  | "deliberately-broken";

export interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: ResourceCategory;
  tags: ResourceTag[];
  stars?: number;
  language?: string;
  isCommercial?: boolean;
  isDeprecated?: boolean;
  frameworks?: string[];
}

export interface CategoryMeta {
  id: ResourceCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export interface FilterState {
  search: string;
  category: ResourceCategory | "all";
  tags: ResourceTag[];
  showCommercial: boolean;
  showDeprecated: boolean;
}
