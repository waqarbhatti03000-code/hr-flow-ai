/**
 * Seed script — populates a demo company with users, departments, employees,
 * and a few AI outputs so the dashboard is non-empty on first login.
 *
 * Demo logins:
 *   admin@acme.test    / password123   (ADMIN)
 *   hr@acme.test       / password123   (HR_MANAGER)
 *   employee@acme.test / password123   (EMPLOYEE)
 */

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mockJobDescription, mockOrgChart, mockSalaryBand } from "../src/lib/ai/mock";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const company = await prisma.company.upsert({
    where: { id: "demo-company" },
    update: {},
    create: {
      id: "demo-company",
      name: "Acme SME",
      country: "PK",
      size: "SMB",
    },
  });

  const [engineering, product, people, sales] = await Promise.all([
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Engineering" } },
      update: {},
      create: { name: "Engineering", description: "Builds and runs the product", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Product" } },
      update: {},
      create: { name: "Product", description: "Defines what we build", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "People" } },
      update: {},
      create: { name: "People", description: "HR and talent", companyId: company.id },
    }),
    prisma.department.upsert({
      where: { companyId_name: { companyId: company.id, name: "Sales" } },
      update: {},
      create: { name: "Sales", description: "Revenue and partnerships", companyId: company.id },
    }),
  ]);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@acme.test" },
      update: { passwordHash, role: Role.ADMIN },
      create: {
        email: "admin@acme.test",
        name: "Aisha Admin",
        passwordHash,
        role: Role.ADMIN,
        companyId: company.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "hr@acme.test" },
      update: { passwordHash, role: Role.HR_MANAGER },
      create: {
        email: "hr@acme.test",
        name: "Hamza HR",
        passwordHash,
        role: Role.HR_MANAGER,
        companyId: company.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "employee@acme.test" },
      update: { passwordHash, role: Role.EMPLOYEE },
      create: {
        email: "employee@acme.test",
        name: "Eman Employee",
        passwordHash,
        role: Role.EMPLOYEE,
        companyId: company.id,
      },
    }),
  ]);

  const employees: Array<{
    firstName: string; lastName: string; email: string; title: string;
    level: string; departmentId: string; salary: number; userId?: string;
  }> = [
    { firstName: "Aisha", lastName: "Admin", email: "admin@acme.test", title: "Founder / CEO", level: "Director", departmentId: people.id, salary: 12_000_000, userId: users[0].id },
    { firstName: "Hamza", lastName: "HR", email: "hr@acme.test", title: "HR Manager", level: "Manager", departmentId: people.id, salary: 3_000_000, userId: users[1].id },
    { firstName: "Eman", lastName: "Employee", email: "employee@acme.test", title: "Software Engineer", level: "Mid", departmentId: engineering.id, salary: 1_800_000, userId: users[2].id },
    { firstName: "Bilal", lastName: "Ahmed", email: "bilal.ahmed@acme.test", title: "Senior Software Engineer", level: "Senior", departmentId: engineering.id, salary: 3_500_000 },
    { firstName: "Sara", lastName: "Khan", email: "sara.khan@acme.test", title: "Staff Software Engineer", level: "Lead", departmentId: engineering.id, salary: 5_200_000 },
    { firstName: "Zain", lastName: "Malik", email: "zain.malik@acme.test", title: "Product Designer", level: "Mid", departmentId: product.id, salary: 2_000_000 },
    { firstName: "Noor", lastName: "Fatima", email: "noor.fatima@acme.test", title: "Product Manager", level: "Senior", departmentId: product.id, salary: 3_200_000 },
    { firstName: "Usman", lastName: "Raza", email: "usman.raza@acme.test", title: "Account Executive", level: "Mid", departmentId: sales.id, salary: 1_900_000 },
    { firstName: "Hina", lastName: "Sheikh", email: "hina.sheikh@acme.test", title: "Sales Manager", level: "Manager", departmentId: sales.id, salary: 2_800_000 },
    { firstName: "Ali", lastName: "Qureshi", email: "ali.qureshi@acme.test", title: "Recruiter", level: "Mid", departmentId: people.id, salary: 1_400_000 },
  ];

  for (const e of employees) {
    await prisma.employee.upsert({
      where: { companyId_email: { companyId: company.id, email: e.email } },
      update: { title: e.title, level: e.level, salary: e.salary, departmentId: e.departmentId, userId: e.userId },
      create: {
        ...e,
        companyId: company.id,
        country: "PK",
        currency: "PKR",
      },
    });
  }

  // Seed a few AI outputs for the "recent outputs" dashboard card.
  const jd = mockJobDescription({ role: "Software Engineer", level: "Senior", department: "Engineering", country: "PK" });
  const org = mockOrgChart({ companyName: company.name, companySize: 50, departments: ["Engineering", "Product", "People", "Sales"] });
  const band = mockSalaryBand({ role: "Software Engineer", level: "Senior", country: "PK" });

  await prisma.aiOutput.createMany({
    data: [
      {
        kind: "JOB_DESCRIPTION",
        title: jd.title,
        input: { role: "Software Engineer", level: "Senior", department: "Engineering", country: "PK" },
        output: jd as unknown as object,
        companyId: company.id,
        model: "mock",
      },
      {
        kind: "ORG_STRUCTURE",
        title: `${company.name} org chart (50)`,
        input: { companyName: company.name, companySize: 50 },
        output: org as unknown as object,
        companyId: company.id,
        model: "mock",
      },
      {
        kind: "SALARY_BAND",
        title: `Senior Software Engineer — PK`,
        input: { role: "Software Engineer", level: "Senior", country: "PK" },
        output: band as unknown as object,
        companyId: company.id,
        model: "mock",
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log("✓ Seed complete. Demo logins:");
  // eslint-disable-next-line no-console
  console.log("  admin@acme.test    / password123  (ADMIN)");
  // eslint-disable-next-line no-console
  console.log("  hr@acme.test       / password123  (HR_MANAGER)");
  // eslint-disable-next-line no-console
  console.log("  employee@acme.test / password123  (EMPLOYEE)");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
