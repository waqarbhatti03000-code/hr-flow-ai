import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Network,
  Coins,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"] },
  { href: "/employees", label: "Employees", icon: Users, roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"] },
  { href: "/departments", label: "Departments", icon: Building2, roles: ["ADMIN", "HR_MANAGER", "EMPLOYEE"] },
  { href: "/ai/job-description", label: "AI · Job Description", icon: FileText, roles: ["ADMIN", "HR_MANAGER"] },
  { href: "/ai/org-structure", label: "AI · Org Structure", icon: Network, roles: ["ADMIN", "HR_MANAGER"] },
  { href: "/ai/salary-band", label: "AI · Salary Band", icon: Coins, roles: ["ADMIN", "HR_MANAGER"] },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  const items = nav.filter((n) => n.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-5 font-semibold">
          <Sparkles className="h-5 w-5 text-brand-600" />
          HR Flow AI
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <item.icon className="h-4 w-4 text-slate-500" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-md p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-medium text-brand-700">
              {initials(session.user.name || session.user.email || "U")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">
                {session.user.name || session.user.email}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="truncate">{session.user.companyName}</span>
                <Badge variant="info" className="ml-auto">
                  {role}
                </Badge>
              </div>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm" className="mt-2 w-full justify-start">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 md:hidden">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-brand-600" />
            HR Flow AI
          </div>
          <Badge variant="info">{role}</Badge>
        </div>
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
