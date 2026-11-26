import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MinusCircle,
  PlugZap,
  RefreshCw,
  XCircle,
} from "lucide-react";

// Live checks that the site's connected services still accept their keys.
// Each check makes one read-only call from the server (test-integration-secrets);
// key values never reach the browser. This panel was the "Live integration
// tests" section of the retired Secrets Handoff page (May 2026 move).

type ProbeResult = {
  id: string;
  label: string;
  category: string;
  required_secret: string;
  status: "pass" | "fail" | "warn" | "skipped";
  http_status?: number;
  latency_ms?: number;
  detail?: string;
  hint?: string;
};

type ProbeResponse = {
  ok: boolean;
  checked_at: string;
  summary: { total: number; pass: number; fail: number; warn?: number; skipped: number };
  results: ProbeResult[];
};

const STATUS_STYLE: Record<ProbeResult["status"], { box: string; icon: typeof CheckCircle2; color: string }> = {
  pass: { box: "border-green-600/40 bg-green-600/5", icon: CheckCircle2, color: "text-green-600" },
  fail: { box: "border-rose-600/40 bg-rose-600/5", icon: XCircle, color: "text-rose-600" },
  warn: { box: "border-amber-500/40 bg-amber-500/5", icon: AlertTriangle, color: "text-amber-600" },
  skipped: { box: "border-muted bg-muted/30", icon: MinusCircle, color: "text-muted-foreground" },
};

function summarize(results: ProbeResult[]): ProbeResponse["summary"] {
  return {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
    warn: results.filter((r) => r.status === "warn").length,
    skipped: results.filter((r) => r.status === "skipped").length,
  };
}

export default function IntegrationHealth() {
  const [probing, setProbing] = useState(false);
  const [probingOne, setProbingOne] = useState<string | null>(null);
  const [report, setReport] = useState<ProbeResponse | null>(null);

  async function runProbes(only?: string[]) {
    if (only?.length === 1) setProbingOne(only[0]);
    else setProbing(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-integration-secrets", {
        body: only?.length ? { only } : {},
      });
      if (error) throw error;
      const res = data as ProbeResponse;
      let next = res;
      if (only?.length && report) {
        const results = report.results.map((r) => res.results.find((n) => n.id === r.id) ?? r);
        for (const n of res.results) {
          if (!results.some((r) => r.id === n.id)) results.push(n);
        }
        next = { ...res, results, summary: summarize(results) };
      }
      setReport(next);
      const s = res.summary;
      if (s.fail > 0) {
        toast.warning(`${s.fail} failed · ${s.pass} passed · ${s.skipped} skipped`);
      } else {
        toast.success(`${s.pass} passed · ${s.skipped} skipped`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "The integration check could not run");
    } finally {
      setProbing(false);
      setProbingOne(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy flex items-center gap-3">
            <PlugZap className="h-8 w-8" /> Integration Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Checks that each connected service still accepts the site's key: GoHighLevel, Stripe,
            YouTube, Lovable AI, Firecrawl and the database service key. Each check is one read-only
            call made from the server. Key values are never shown.
          </p>
        </div>
        <Button onClick={() => runProbes()} disabled={probing}>
          {probing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlugZap className="h-4 w-4 mr-2" />}
          Run all checks
        </Button>
      </div>

      {!report && !probing && (
        <Card className="p-6 text-sm text-muted-foreground">
          No checks run yet. Run them after changing a key, or when a form, import or payment stops working.
        </Card>
      )}

      {report && (
        <Card className="p-4 space-y-3">
          <div className="text-xs text-muted-foreground">
            Last run {new Date(report.checked_at).toLocaleString()} ·{" "}
            <span className="text-green-700 font-medium">{report.summary.pass} pass</span> ·{" "}
            <span className={report.summary.fail ? "text-rose-700 font-medium" : ""}>
              {report.summary.fail} fail
            </span>{" "}
            · {report.summary.skipped} skipped
          </div>
          <div className="grid gap-2">
            {report.results.map((r) => {
              const style = STATUS_STYLE[r.status] ?? STATUS_STYLE.skipped;
              const Icon = style.icon;
              return (
                <div key={r.id} className={`rounded border p-3 text-xs ${style.box}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon className={`h-4 w-4 ${style.color}`} />
                      <span className="font-semibold text-sm">{r.label}</span>
                      <Badge variant="outline">{r.category}</Badge>
                      <code className="text-[10px] text-muted-foreground">{r.required_secret}</code>
                      {r.http_status !== undefined && (
                        <Badge variant="outline" className="text-[10px]">HTTP {r.http_status}</Badge>
                      )}
                      {r.latency_ms !== undefined && (
                        <span className="text-[10px] text-muted-foreground">{r.latency_ms}ms</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => runProbes([r.id])}
                      disabled={probingOne === r.id || probing}
                      title={`Run the ${r.label} check again`}
                    >
                      {probingOne === r.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {r.detail && <div className="mt-1 text-muted-foreground break-words">{r.detail}</div>}
                  {r.hint && (r.status === "fail" || r.status === "warn") && (
                    <div className={`mt-1 ${r.status === "warn" ? "text-amber-700" : "text-rose-700"}`}>
                      Hint: {r.hint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
