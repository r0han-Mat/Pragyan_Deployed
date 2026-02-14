import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Loader2 } from "lucide-react";
import { PatientInput } from "@/hooks/useTriage";

interface Props {
  onSubmit: (data: PatientInput & { name: string }) => void;
  loading: boolean;
}

const INITIAL: PatientInput & { name: string } = {
  name: "Patient",
  Age: 30,
  Gender: "Male",
  Heart_Rate: 80,
  Systolic_BP: 120,
  Diastolic_BP: 80,
  O2_Saturation: 98,
  Temperature: 37,
  Respiratory_Rate: 16,
  Pain_Score: 3,
  GCS_Score: 15,
  Arrival_Mode: "Walk-in",
  Diabetes: false,
  Hypertension: false,
  Heart_Disease: false,
};

export default function TriageForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({ ...INITIAL });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Stethoscope className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Intake & Vitals</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Patient Name</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="border-border bg-secondary text-foreground" />
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Age</Label>
            <Input type="number" value={form.Age} onChange={(e) => set("Age", +e.target.value)} min={0} max={120} className="border-border bg-secondary text-foreground" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gender</Label>
            <Select value={form.Gender} onValueChange={(v) => set("Gender", v)}>
              <SelectTrigger className="border-border bg-secondary text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vitals */}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Vitals</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Heart_Rate", "Heart Rate (bpm)", 0, 300],
            ["Systolic_BP", "Systolic BP (mmHg)", 0, 300],
            ["Diastolic_BP", "Diastolic BP (mmHg)", 0, 200],
            ["O2_Saturation", "O₂ Saturation (%)", 0, 100],
            ["Temperature", "Temperature (°C)", 30, 45],
            ["Respiratory_Rate", "Resp Rate", 0, 60],
          ].map(([key, label, min, max]) => (
            <div key={key as string} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label as string}</Label>
              <Input
                type="number"
                step={key === "Temperature" ? 0.1 : 1}
                value={(form as any)[key as string]}
                onChange={(e) => set(key as string, +e.target.value)}
                min={min as number}
                max={max as number}
                className="border-border bg-secondary text-foreground"
              />
            </div>
          ))}
        </div>

        {/* Clinical */}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Clinical</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Pain Score (0-10)</Label>
            <Input type="number" value={form.Pain_Score} onChange={(e) => set("Pain_Score", +e.target.value)} min={0} max={10} className="border-border bg-secondary text-foreground" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">GCS Score (3-15)</Label>
            <Input type="number" value={form.GCS_Score} onChange={(e) => set("GCS_Score", +e.target.value)} min={3} max={15} className="border-border bg-secondary text-foreground" />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Arrival Mode</Label>
          <Select value={form.Arrival_Mode} onValueChange={(v) => set("Arrival_Mode", v)}>
            <SelectTrigger className="border-border bg-secondary text-foreground"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Walk-in">Walk-in</SelectItem>
              <SelectItem value="Ambulance">Ambulance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* History */}
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Medical History</p>
        <div className="flex flex-wrap gap-4">
          {(["Diabetes", "Hypertension", "Heart_Disease"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={(form as any)[key]}
                onCheckedChange={(v) => set(key, !!v)}
              />
              {key.replace("_", " ")}
            </label>
          ))}
        </div>

        {/* Submit */}
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            type="submit"
            disabled={loading}
            className="w-full animate-pulse-glow bg-primary py-6 text-lg font-bold text-primary-foreground hover:bg-primary/80"
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {loading ? "ANALYZING..." : "⚡ ANALYZE RISK"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
