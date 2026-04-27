import { z } from "zod";

// ---- Employees -----------------------------------------------------------
export const EmployeeCreate = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  title: z.string().min(1).max(120),
  level: z.string().default("Mid"),
  status: z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]).default("ACTIVE"),
  country: z.string().length(2).default("PK"),
  salary: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("PKR"),
  departmentId: z.string().cuid().nullable().optional(),
});

export const EmployeeUpdate = EmployeeCreate.partial();

// ---- Departments ---------------------------------------------------------
export const DepartmentCreate = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  parentId: z.string().cuid().nullable().optional(),
});

// ---- AI ------------------------------------------------------------------
export const JDInput = z.object({
  role: z.string().min(2).max(120),
  level: z.string().min(1).max(30),
  department: z.string().min(1).max(80),
  country: z.string().length(2).optional(),
  companySize: z.string().optional(),
  extraContext: z.string().max(2000).optional(),
});

export const OrgInput = z.object({
  companyName: z.string().min(1).max(120),
  companySize: z.number().int().positive().max(10_000),
  departments: z.array(z.string().min(1).max(80)).max(24).default([]),
  industry: z.string().max(80).optional(),
  country: z.string().length(2).optional(),
});

export const SalaryInput = z.object({
  role: z.string().min(2).max(120),
  level: z.string().min(1).max(30),
  country: z.string().length(2),
  remote: z.boolean().optional(),
});

// ---- Auth ----------------------------------------------------------------
export const RegisterInput = z.object({
  companyName: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(80),
});
