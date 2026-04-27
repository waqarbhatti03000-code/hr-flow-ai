import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Building2, Wand2, BarChart3, ShieldCheck } from "lucide-react";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-brand-600" />
            HR Flow AI
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Start free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="info" className="mb-4">
            Built for SMEs in Pakistan & global remote teams
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Your AI-native HR department,{" "}
            <span className="text-brand-600">in one place.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            Generate job descriptions, design your org chart, and benchmark salaries in seconds.
            HR Flow AI gives lean teams the leverage of an entire people function.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Demo login: <code className="font-mono">admin@acme.test</code> /{" "}
            <code className="font-mono">password123</code>
          </p>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Wand2 className="h-5 w-5" />} title="AI Job Descriptions">
            Structured, inclusive JDs in seconds for any role, level, or department.
          </Feature>
          <Feature icon={<Building2 className="h-5 w-5" />} title="Org Chart Designer">
            Turn company size and departments into a lean org chart you can iterate on.
          </Feature>
          <Feature icon={<BarChart3 className="h-5 w-5" />} title="Salary Benchmarks">
            Country-aware compensation bands calibrated to your role and level.
          </Feature>
          <Feature icon={<Users className="h-5 w-5" />} title="Employee Directory">
            Profiles, departments, and status. Role-based access for your team.
          </Feature>
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Roles & Permissions">
            Admin, HR Manager, and Employee roles with scoped access by default.
          </Feature>
          <Feature icon={<Sparkles className="h-5 w-5" />} title="Plug your own LLM">
            Bring your OpenAI key — or run fully offline with the built-in mock.
          </Feature>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} HR Flow AI
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          {icon}
        </div>
        <h3 className="mt-4 font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{children}</p>
      </CardContent>
    </Card>
  );
}
