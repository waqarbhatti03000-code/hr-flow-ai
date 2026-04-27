/**
 * Unit tests for the AI mock generators and the validators.
 *
 * These cover the core logic of the `/api/ai/*` endpoints without requiring
 * a live database or an OpenAI key: the handlers simply parse with zod and
 * call into these pure functions when `OPENAI_API_KEY` is unset.
 */

import { describe, it, expect } from "vitest";
import {
  mockJobDescription,
  mockOrgChart,
  mockSalaryBand,
} from "@/lib/ai/mock";
import { JDInput, OrgInput, SalaryInput } from "@/lib/validators";

describe("validators", () => {
  it("rejects bad JD inputs", () => {
    expect(JDInput.safeParse({}).success).toBe(false);
    expect(
      JDInput.safeParse({ role: "x", level: "Mid", department: "Eng" }).success,
    ).toBe(false); // role too short
  });

  it("accepts a good JD input", () => {
    const parsed = JDInput.parse({
      role: "Software Engineer",
      level: "Senior",
      department: "Engineering",
      country: "PK",
    });
    expect(parsed.role).toBe("Software Engineer");
  });

  it("validates org input shape", () => {
    const parsed = OrgInput.parse({
      companyName: "Acme",
      companySize: 50,
      departments: ["Engineering", "Product"],
    });
    expect(parsed.companySize).toBe(50);
  });

  it("enforces 2-letter country in salary input", () => {
    expect(
      SalaryInput.safeParse({ role: "Engineer", level: "Mid", country: "PAK" }).success,
    ).toBe(false);
  });
});

describe("mockJobDescription", () => {
  it("produces a well-formed JD", () => {
    const jd = mockJobDescription({
      role: "Software Engineer",
      level: "Senior",
      department: "Engineering",
      country: "PK",
    });
    expect(jd.title).toContain("Senior");
    expect(jd.title).toContain("Software Engineer");
    expect(jd.responsibilities.length).toBeGreaterThan(3);
    expect(jd.requirements.length).toBeGreaterThan(3);
    expect(jd.keywords).toContain("Software Engineer");
  });

  it("falls back to Mid-level requirements for unknown level", () => {
    const jd = mockJobDescription({
      role: "Designer",
      level: "WhoKnows",
      department: "Product",
    });
    expect(jd.requirements.length).toBeGreaterThan(0);
  });
});

describe("mockOrgChart", () => {
  it("returns a tree with a CEO root and children per department", () => {
    const chart = mockOrgChart({
      companyName: "Acme",
      companySize: 30,
      departments: ["Engineering", "Sales"],
    });
    expect(chart.companyName).toBe("Acme");
    expect(chart.root.name).toBe("CEO");
    expect(chart.root.children).toHaveLength(2);
  });

  it("adds middle management for larger orgs", () => {
    const chart = mockOrgChart({
      companyName: "Acme",
      companySize: 200,
      departments: ["Engineering"],
    });
    const eng = chart.root.children[0];
    expect(eng.children.length).toBeGreaterThan(0);
  });
});

describe("mockSalaryBand", () => {
  it("produces p25 <= p50 <= p75 <= p90", () => {
    const band = mockSalaryBand({ role: "Software Engineer", level: "Senior", country: "PK" });
    expect(band.currency).toBe("PKR");
    expect(band.bands.p25).toBeLessThanOrEqual(band.bands.p50);
    expect(band.bands.p50).toBeLessThanOrEqual(band.bands.p75);
    expect(band.bands.p75).toBeLessThanOrEqual(band.bands.p90);
  });

  it("uses USD for US", () => {
    const band = mockSalaryBand({ role: "Software Engineer", level: "Senior", country: "US" });
    expect(band.currency).toBe("USD");
  });

  it("falls back gracefully to default anchors for unknown country", () => {
    const band = mockSalaryBand({ role: "Software Engineer", level: "Senior", country: "ZZ" });
    expect(band.bands.p50).toBeGreaterThan(0);
  });
});
