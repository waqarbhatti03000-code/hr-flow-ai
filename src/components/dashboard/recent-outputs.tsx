import { Badge } from "@/components/ui/badge";
import { FileText, Network, Coins } from "lucide-react";

type Output = {
  id: string;
  kind: "JOB_DESCRIPTION" | "ORG_STRUCTURE" | "SALARY_BAND";
  title: string;
  model: string;
  createdAt: string;
};

const icons = {
  JOB_DESCRIPTION: FileText,
  ORG_STRUCTURE: Network,
  SALARY_BAND: Coins,
};

const labels = {
  JOB_DESCRIPTION: "Job Description",
  ORG_STRUCTURE: "Org Structure",
  SALARY_BAND: "Salary Band",
};

export function RecentOutputs({ outputs }: { outputs: Output[] }) {
  if (!outputs.length) {
    return <p className="text-sm text-slate-500">No AI outputs yet. Try the HR toolkit.</p>;
  }
  return (
    <ul className="space-y-3">
      {outputs.map((o) => {
        const Icon = icons[o.kind];
        return (
          <li key={o.id} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-900">{o.title}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <span>{labels[o.kind]}</span>
                <span>•</span>
                <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                <Badge variant="muted" className="ml-auto">
                  {o.model}
                </Badge>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
