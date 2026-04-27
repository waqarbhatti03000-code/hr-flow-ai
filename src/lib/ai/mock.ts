/**
 * Deterministic mock generators used when OPENAI_API_KEY is not set.
 *
 * The outputs are realistic enough to demo the product end-to-end — including
 * screenshots for investor pitches — without any network calls.
 */

import type { JobDescription, OrgChart, OrgNode, SalaryBand } from "@/lib/ai/types";

const RESP_BY_DEPT: Record<string, string[]> = {
  Engineering: [
    "Design, build, and ship high-quality features across our product stack",
    "Own services end-to-end: architecture, implementation, deployment, and observability",
    "Review pull requests and raise the engineering bar across the team",
    "Partner with product and design to translate requirements into technical plans",
    "Mentor junior engineers and contribute to hiring",
    "Instrument code with metrics, logs, and traces; debug production incidents",
  ],
  Product: [
    "Own the roadmap for your product area, balancing user needs and business goals",
    "Write crisp product specs with clear success metrics",
    "Partner with engineering, design, and GTM to ship high-impact features",
    "Talk to customers weekly; turn qualitative insights into prioritized work",
    "Analyze product usage data to inform decisions",
  ],
  People: [
    "Run end-to-end talent acquisition for assigned roles",
    "Manage performance reviews, compensation, and career development",
    "Design and iterate on HR policies fit for a fast-growing SME",
    "Own onboarding experience for new hires",
    "Partner with leadership on org design and workforce planning",
  ],
  Sales: [
    "Own a quota and close new-business deals in your segment",
    "Run structured discovery calls and build tailored demos",
    "Manage the full pipeline in the CRM with disciplined hygiene",
    "Collaborate with marketing on outbound campaigns",
    "Negotiate commercials and close deals",
  ],
  Marketing: [
    "Develop and execute multi-channel go-to-market campaigns",
    "Own content production: blogs, case studies, lifecycle emails",
    "Run paid acquisition experiments and track CAC/LTV",
    "Partner with product on launches and positioning",
    "Report on funnel metrics to leadership",
  ],
  Finance: [
    "Own month-end close and management reporting",
    "Build the financial model and three-statement forecast",
    "Manage payroll, invoicing, and collections",
    "Ensure compliance with local tax and labor regulations",
    "Partner with leadership on fundraising and investor updates",
  ],
};

const REQS_BY_LEVEL: Record<string, string[]> = {
  Junior: [
    "0-2 years of relevant experience",
    "Strong fundamentals in your core discipline",
    "Eagerness to learn and receive feedback",
    "Clear written and verbal communication in English",
  ],
  Mid: [
    "3-5 years of relevant experience",
    "Proven track record of shipping projects independently",
    "Strong fundamentals and modern tooling expertise",
    "Ability to mentor juniors and review others' work",
    "Clear written and verbal communication in English",
  ],
  Senior: [
    "5+ years of relevant experience with demonstrated leadership",
    "Track record of owning complex projects end-to-end",
    "Deep expertise in your discipline and adjacent areas",
    "Strong mentoring, code review, and architectural design skills",
    "Excellent written and verbal communication",
  ],
  Lead: [
    "7+ years of experience with 2+ years in a lead role",
    "Experience setting technical direction for a team",
    "Strong project and stakeholder management skills",
    "Track record of hiring, mentoring, and growing engineers",
  ],
  Manager: [
    "5+ years of experience with 2+ years managing direct reports",
    "Track record of delivering team outcomes, not just individual output",
    "Strong performance management and coaching skills",
    "Ability to translate company strategy into team-level priorities",
  ],
  Director: [
    "10+ years of experience with multiple years of second-level management",
    "Track record of scaling a function at an SMB or growth-stage company",
    "Strong strategic thinking paired with operational rigor",
    "Excellent executive communication",
  ],
};

const BENEFITS = [
  "Competitive base salary with annual review",
  "Health insurance for employee and dependents",
  "Flexible / remote-friendly work policy",
  "Paid leave and public holidays",
  "Learning & development budget",
  "Performance-based bonuses",
];

function deptResponsibilities(dept: string) {
  const key = Object.keys(RESP_BY_DEPT).find((k) => dept.toLowerCase().includes(k.toLowerCase()));
  return RESP_BY_DEPT[key ?? "Engineering"];
}

export function mockJobDescription(input: {
  role: string;
  level: string;
  department: string;
  country?: string;
}): JobDescription {
  const level = input.level || "Mid";
  const reqs = REQS_BY_LEVEL[level] ?? REQS_BY_LEVEL.Mid;
  return {
    title: `${level} ${input.role}`,
    summary: `We're hiring a ${level} ${input.role} to join our ${input.department} team${
      input.country ? ` in ${input.country}` : ""
    }. You'll partner cross-functionally to deliver meaningful impact from day one in a fast-moving SaaS environment.`,
    responsibilities: deptResponsibilities(input.department).slice(0, 6),
    requirements: reqs,
    niceToHave: [
      "Experience at a high-growth SaaS startup",
      "Prior exposure to HR tech or enterprise software",
      "Experience working in a distributed/remote team",
    ],
    benefits: BENEFITS,
    keywords: [
      input.role,
      input.department,
      level,
      "remote",
      "SaaS",
      input.country ?? "Pakistan",
    ].filter(Boolean) as string[],
  };
}

export function mockOrgChart(input: {
  companyName: string;
  companySize: number;
  departments: string[];
}): OrgChart {
  const size = Math.max(1, Math.min(1000, input.companySize));
  const depts = input.departments.length
    ? input.departments
    : ["Engineering", "Product", "People", "Sales", "Marketing", "Finance"];

  // Distribute headcount roughly proportionally, with a bias toward engineering.
  const weights: Record<string, number> = {
    Engineering: 0.35,
    Product: 0.1,
    Design: 0.08,
    Sales: 0.15,
    Marketing: 0.1,
    People: 0.07,
    Finance: 0.07,
    Operations: 0.08,
  };
  const sumWeight = depts.reduce((s, d) => s + (weights[d] ?? 0.1), 0);

  const leadership: OrgNode = {
    name: "CEO",
    headcount: 1,
    children: [],
  };

  for (const dept of depts) {
    const target = Math.max(1, Math.round(((weights[dept] ?? 0.1) / sumWeight) * (size - 1)));
    const head: OrgNode = {
      name: `Head of ${dept}`,
      headcount: 1,
      children: [],
    };
    const remaining = Math.max(0, target - 1);
    if (size >= 50 && remaining >= 4) {
      // add middle management
      const teamsCount = Math.min(3, Math.max(1, Math.floor(remaining / 5)));
      const perTeam = Math.floor(remaining / teamsCount);
      for (let i = 0; i < teamsCount; i++) {
        head.children.push({
          name: `${dept} Team ${i + 1}`,
          headcount: perTeam,
          children: [],
        });
      }
    } else if (remaining > 0) {
      head.children.push({
        name: `${dept} ICs`,
        headcount: remaining,
        children: [],
      });
    }
    leadership.children.push(head);
  }

  return { companyName: input.companyName, root: leadership };
}

// Rough annual salary anchors (PKR for Pakistan, USD elsewhere). Mock only.
const SALARY_ANCHORS: Record<string, Record<string, number>> = {
  PK: { Junior: 900_000, Mid: 1_800_000, Senior: 3_600_000, Lead: 5_400_000, Manager: 6_000_000, Director: 9_000_000 },
  US: { Junior: 75_000, Mid: 120_000, Senior: 170_000, Lead: 210_000, Manager: 200_000, Director: 260_000 },
  AE: { Junior: 120_000, Mid: 220_000, Senior: 340_000, Lead: 420_000, Manager: 420_000, Director: 600_000 },
  GB: { Junior: 35_000, Mid: 60_000, Senior: 90_000, Lead: 115_000, Manager: 110_000, Director: 150_000 },
  IN: { Junior: 800_000, Mid: 1_800_000, Senior: 3_500_000, Lead: 5_000_000, Manager: 5_500_000, Director: 8_000_000 },
};

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  PK: "PKR", US: "USD", AE: "AED", GB: "GBP", IN: "INR",
};

const ROLE_MULTIPLIERS: Record<string, number> = {
  Engineer: 1.0, "Software Engineer": 1.0, "Product Manager": 1.05,
  Designer: 0.9, "Data Scientist": 1.1, "Sales": 0.95, "Marketing": 0.85,
  "HR Manager": 0.9, "Finance": 0.9, "Recruiter": 0.8,
};

function roleMultiplier(role: string): number {
  const k = Object.keys(ROLE_MULTIPLIERS).find((r) => role.toLowerCase().includes(r.toLowerCase()));
  return k ? ROLE_MULTIPLIERS[k] : 1.0;
}

export function mockSalaryBand(input: {
  role: string;
  level: string;
  country: string;
}): SalaryBand {
  const country = input.country.toUpperCase();
  const anchors = SALARY_ANCHORS[country] ?? SALARY_ANCHORS.PK;
  const base = anchors[input.level] ?? anchors.Mid;
  const mult = roleMultiplier(input.role);
  const p50 = Math.round(base * mult);
  return {
    role: input.role,
    level: input.level,
    country,
    currency: CURRENCY_BY_COUNTRY[country] ?? "USD",
    period: "annual",
    bands: {
      p25: Math.round(p50 * 0.85),
      p50,
      p75: Math.round(p50 * 1.15),
      p90: Math.round(p50 * 1.3),
    },
    rationale: `Benchmark derived from market anchors for ${input.level} ${input.role} roles in ${country}, adjusted ${Math.round(
      mult * 100,
    )}% for role scarcity.`,
    sources: [
      "Internal HR Flow AI market dataset (2024)",
      "Public compensation surveys",
      "Cross-referenced with regional hiring partners",
    ],
  };
}
