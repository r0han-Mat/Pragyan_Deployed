import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock } from "lucide-react";
import { Patient } from "@/hooks/usePatients";

interface Props {
  patients: Patient[];
  selectedId: string | null;
  onSelect: (p: Patient) => void;
}

function riskColor(label: string | null) {
  switch (label) {
    case "HIGH": return "border-risk-high bg-risk-high/10 text-risk-high";
    case "MEDIUM": return "border-risk-medium bg-risk-medium/10 text-risk-medium";
    case "LOW": return "border-risk-low bg-risk-low/10 text-risk-low";
    default: return "border-border bg-secondary text-muted-foreground";
  }
}

export default function PatientQueue({ patients, selectedId, onSelect }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {patients.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelect(p)}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selectedId === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.age}y • {p.gender} • {p.arrival_mode}
                  </p>
                </div>
                <div className={`rounded-full border px-2 py-0.5 text-xs font-bold ${riskColor(p.risk_label)} ${
                  p.risk_label === "HIGH" ? "animate-pulse" : ""
                }`}>
                  {p.risk_label || "PENDING"}
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>HR {p.heart_rate}</span>
                <span>BP {p.systolic_bp}/{p.diastolic_bp}</span>
                <span>O₂ {p.o2_saturation}%</span>
                <span className="ml-auto flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {patients.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="mb-2 h-8 w-8" />
            <p className="text-sm">No patients in queue</p>
            <p className="text-xs">Submit a triage form or enable Live Sim</p>
          </div>
        )}
      </div>
    </div>
  );
}