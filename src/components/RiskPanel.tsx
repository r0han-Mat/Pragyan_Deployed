import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, TrendingUp, Info } from "lucide-react";
import { TriageResult } from "@/hooks/useTriage";
import { Patient } from "@/hooks/usePatients";

interface Props {
  result: TriageResult | null;
  patients: Patient[];
  apiError: string | null;
}

function gaugeColor(label: string) {
  switch (label) {
    case "HIGH": return "hsl(0, 72%, 51%)";
    case "MEDIUM": return "hsl(45, 96%, 58%)";
    case "LOW": return "hsl(142, 71%, 45%)";
    default: return "hsl(0, 0%, 40%)";
  }
}

export default function RiskPanel({ result, patients, apiError }: Props) {
  const high = patients.filter((p) => p.risk_label === "HIGH").length;
  const medium = patients.filter((p) => p.risk_label === "MEDIUM").length;
  const low = patients.filter((p) => p.risk_label === "LOW").length;

  const chartData = [
    { name: "High", count: high, color: "hsl(0, 72%, 51%)" },
    { name: "Medium", count: medium, color: "hsl(45, 96%, 58%)" },
    { name: "Low", count: low, color: "hsl(142, 71%, 45%)" },
  ];

  const scorePercent = result ? Math.round(result.risk_score * 100) : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Risk Analysis</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md border border-risk-medium/30 bg-risk-medium/5 p-3 text-sm text-risk-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>API offline — using fallback scoring. {apiError}</span>
          </div>
        )}

        {/* Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(0,0%,15%)" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke={result ? gaugeColor(result.risk_label) : "hsl(0,0%,25%)"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * scorePercent) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute text-center">
              <motion.span
                className="text-3xl font-bold"
                style={{ color: result ? gaugeColor(result.risk_label) : "hsl(0,0%,64%)" }}
                key={scorePercent}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {scorePercent}%
              </motion.span>
              <p className="text-xs text-muted-foreground">Risk Score</p>
            </div>
          </div>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-2 rounded-full border px-4 py-1 text-sm font-bold ${
                result.risk_label === "HIGH"
                  ? "border-risk-high bg-risk-high/10 text-risk-high"
                  : result.risk_label === "MEDIUM"
                  ? "border-risk-medium bg-risk-medium/10 text-risk-medium"
                  : "border-risk-low bg-risk-low/10 text-risk-low"
              }`}
            >
              {result.risk_label} RISK
            </motion.div>
          )}
        </div>

        {/* Explanation */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-secondary p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Info className="h-4 w-4 text-primary" />
              Why this score?
            </div>
            <p className="text-sm text-muted-foreground">{result.details}</p>
          </motion.div>
        )}

        {/* ER Distribution Chart */}
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">ER Distribution</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="name" tick={{ fill: "hsl(0,0%,64%)", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(0,0%,64%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0,0%,7%)", border: "1px solid hsl(0,30%,15%)", color: "hsl(0,0%,93%)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {!result && (
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <AlertTriangle className="mb-2 h-8 w-8" />
            <p className="text-sm">No analysis yet</p>
            <p className="text-xs">Submit patient vitals to see risk assessment</p>
          </div>
        )}
      </div>
    </div>
  );
}
