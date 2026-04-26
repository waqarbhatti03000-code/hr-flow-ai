import { aiEnabled, generateJSON, AI_MODEL } from "@/lib/ai/client";
import {
  JD_SYSTEM,
  ORG_SYSTEM,
  SALARY_SYSTEM,
  jdUserPrompt,
  orgUserPrompt,
  salaryUserPrompt,
} from "@/lib/ai/prompts";
import { mockJobDescription, mockOrgChart, mockSalaryBand } from "@/lib/ai/mock";
import type { JobDescription, OrgChart, SalaryBand } from "@/lib/ai/types";

type Result<T> = { data: T; model: string };

export async function generateJobDescription(input: {
  role: string;
  level: string;
  department: string;
  country?: string;
  companySize?: string;
  extraContext?: string;
}): Promise<Result<JobDescription>> {
  if (!aiEnabled()) {
    return { data: mockJobDescription(input), model: "mock" };
  }
  try {
    return await generateJSON<JobDescription>({
      system: JD_SYSTEM,
      user: jdUserPrompt(input),
    });
  } catch (err) {
    // On any OpenAI failure, degrade gracefully to the mock generator so the
    // user-facing UX is never a hard failure.
    // eslint-disable-next-line no-console
    console.warn("[ai] falling back to mock JD:", err);
    return { data: mockJobDescription(input), model: `mock-fallback:${AI_MODEL}` };
  }
}

export async function generateOrgStructure(input: {
  companyName: string;
  companySize: number;
  departments: string[];
  industry?: string;
  country?: string;
}): Promise<Result<OrgChart>> {
  if (!aiEnabled()) {
    return { data: mockOrgChart(input), model: "mock" };
  }
  try {
    return await generateJSON<OrgChart>({
      system: ORG_SYSTEM,
      user: orgUserPrompt(input),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[ai] falling back to mock org chart:", err);
    return { data: mockOrgChart(input), model: `mock-fallback:${AI_MODEL}` };
  }
}

export async function generateSalaryBand(input: {
  role: string;
  level: string;
  country: string;
  remote?: boolean;
}): Promise<Result<SalaryBand>> {
  if (!aiEnabled()) {
    return { data: mockSalaryBand(input), model: "mock" };
  }
  try {
    return await generateJSON<SalaryBand>({
      system: SALARY_SYSTEM,
      user: salaryUserPrompt(input),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[ai] falling back to mock salary band:", err);
    return { data: mockSalaryBand(input), model: `mock-fallback:${AI_MODEL}` };
  }
}
