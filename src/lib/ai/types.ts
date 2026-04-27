export type JobDescription = {
  title: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
  keywords: string[];
};

export type OrgNode = {
  name: string;
  headcount: number;
  children: OrgNode[];
};

export type OrgChart = {
  companyName: string;
  root: OrgNode;
};

export type SalaryBand = {
  role: string;
  level: string;
  country: string;
  currency: string;
  period: "annual" | "monthly";
  bands: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  rationale: string;
  sources: string[];
};
