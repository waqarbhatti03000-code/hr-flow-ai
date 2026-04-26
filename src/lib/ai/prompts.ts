/**
 * Centralized prompt templates for the HR Toolkit. Keeping prompts as pure
 * string builders makes them easy to unit test and iterate on.
 */

export const JD_SYSTEM = `You are an expert HR consultant and job description writer.
You write structured, inclusive, bias-free job descriptions optimized for SMEs
in Pakistan and global remote-first companies. Return strictly valid JSON with
the following shape and no additional commentary:
{
  "title": string,
  "summary": string,
  "responsibilities": string[],
  "requirements": string[],
  "niceToHave": string[],
  "benefits": string[],
  "keywords": string[]
}`;

export function jdUserPrompt(input: {
  role: string;
  level: string;
  department: string;
  country?: string;
  companySize?: string;
  extraContext?: string;
}) {
  const lines = [
    `Role: ${input.role}`,
    `Level: ${input.level}`,
    `Department: ${input.department}`,
  ];
  if (input.country) lines.push(`Country: ${input.country}`);
  if (input.companySize) lines.push(`Company size: ${input.companySize}`);
  if (input.extraContext) lines.push(`Additional context: ${input.extraContext}`);
  lines.push(
    "Return a concise, modern job description. 5-8 responsibilities, 5-8 requirements.",
  );
  return lines.join("\n");
}

export const ORG_SYSTEM = `You design lean organizational structures for SMEs.
Return strictly valid JSON representing an org chart as a tree, with this shape:
{
  "companyName": string,
  "root": {
    "name": string,            // department or function name
    "headcount": number,       // recommended headcount for this node only
    "children": Node[]         // recursive
  }
}
Keep depth <= 4. Total headcount across all nodes should roughly match the
requested company size.`;

export function orgUserPrompt(input: {
  companyName: string;
  companySize: number;
  departments: string[];
  industry?: string;
  country?: string;
}) {
  return [
    `Company: ${input.companyName}`,
    `Target headcount: ${input.companySize}`,
    `Departments: ${input.departments.join(", ") || "auto-suggest"}`,
    input.industry ? `Industry: ${input.industry}` : "",
    input.country ? `Country: ${input.country}` : "",
    "Design a lean org chart. Use flat teams for small companies, add middle management as headcount grows.",
  ]
    .filter(Boolean)
    .join("\n");
}

export const SALARY_SYSTEM = `You are a compensation analyst specializing in
Pakistan and global remote markets. Return strictly valid JSON with this shape:
{
  "role": string,
  "level": string,
  "country": string,
  "currency": string,
  "period": "annual" | "monthly",
  "bands": {
    "p25": number,
    "p50": number,
    "p75": number,
    "p90": number
  },
  "rationale": string,
  "sources": string[]
}
Numbers must be integers in the local currency. Be realistic, not aspirational.`;

export function salaryUserPrompt(input: {
  role: string;
  level: string;
  country: string;
  remote?: boolean;
}) {
  return [
    `Role: ${input.role}`,
    `Level: ${input.level}`,
    `Country: ${input.country}`,
    input.remote ? "Engagement: fully remote" : "Engagement: hybrid/on-site",
    "Provide a realistic annual salary band for this role in the local currency.",
  ].join("\n");
}
