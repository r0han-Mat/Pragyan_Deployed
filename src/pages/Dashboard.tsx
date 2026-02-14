
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useTriage, PatientInput } from "@/hooks/useTriage";
import PatientQueue from "@/components/PatientQueue";
import TriageForm from "@/components/TriageForm";
import RiskPanel from "@/components/RiskPanel";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

const RANDOM_NAMES = ["J. Smith", "M. Garcia", "A. Chen", "R. Patel", "K. Williams", "S. Johnson", "D. Brown", "L. Martinez", "T. Anderson", "N. Taylor"];

function randomPatientInput(): PatientInput & { name: string } {
  return {
    name: RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)],
    Age: Math.floor(Math.random() * 70) + 18,
    Gender: Math.random() > 0.5 ? "Male" : "Female",
    Heart_Rate: Math.floor(Math.random() * 100) + 50,
    Systolic_BP: Math.floor(Math.random() * 100) + 80,
    Diastolic_BP: Math.floor(Math.random() * 50) + 50,
    O2_Saturation: Math.floor(Math.random() * 15) + 85,
    Temperature: +(35 + Math.random() * 5).toFixed(1),
    Respiratory_Rate: Math.floor(Math.random() * 25) + 8,
    Pain_Score: Math.floor(Math.random() * 11),
    GCS_Score: Math.floor(Math.random() * 13) + 3,
    Arrival_Mode: Math.random() > 0.7 ? "Ambulance" : "Walk-in",
    Diabetes: Math.random() > 0.8,
    Hypertension: Math.random() > 0.7,
    Heart_Disease: Math.random() > 0.85,
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { patients, addPatient } = usePatients();
  const { predict, loading, error, result, setResult } = useTriage();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [simActive, setSimActive] = useState(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = useCallback(async (data: PatientInput & { name: string }) => {
    const triageResult = await predict(data);
    if (triageResult) {
      await addPatient({
        name: data.name,
        age: data.Age,
        gender: data.Gender,
        heart_rate: data.Heart_Rate,
        systolic_bp: data.Systolic_BP,
        diastolic_bp: data.Diastolic_BP,
        o2_saturation: data.O2_Saturation,
        temperature: data.Temperature,
        respiratory_rate: data.Respiratory_Rate,
        pain_score: data.Pain_Score,
        gcs_score: data.GCS_Score,
        arrival_mode: data.Arrival_Mode,
        diabetes: data.Diabetes,
        hypertension: data.Hypertension,
        heart_disease: data.Heart_Disease,
        risk_score: triageResult.risk_score,
        risk_label: triageResult.risk_label,
        explanation: triageResult.details,
      });
    }
  }, [predict, addPatient]);

  // Live sim
  useEffect(() => {
    if (simActive) {
      simRef.current = setInterval(() => {
        handleSubmit(randomPatientInput());
      }, 5000);
    } else {
      if (simRef.current) clearInterval(simRef.current);
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [simActive, handleSubmit]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p.id);
    if (p.risk_score != null && p.risk_label) {
      setResult({
        risk_score: Number(p.risk_score),
        risk_label: p.risk_label,
        details: p.explanation || "",
      });
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card/50 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">PARS <span className="text-xs font-normal text-muted-foreground ml-2">Patient Acuity & Risk System</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end text-right">
             <span className="text-xs font-bold text-foreground">Command Center</span>
             <span className="text-[10px] text-muted-foreground">{user?.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="border-border bg-secondary/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all">
            <LogOut className="mr-1 h-3 w-3" />
            Logout
          </Button>
        </div>
      </header>

      {/* 3-Column Layout */}
      <div className="grid flex-1 grid-cols-[320px_1fr_380px] overflow-hidden">
        <div className="h-full min-h-0 border-r border-border bg-card/20 pb-2">
          <PatientQueue
            patients={patients}
            selectedId={selectedPatient}
            onSelect={handleSelectPatient}
            simActive={simActive}
            onToggleSim={setSimActive}
          />
        </div>
        <div className="h-full min-h-0 border-r border-border bg-background/50 pb-2">
          <TriageForm onSubmit={handleSubmit} loading={loading} />
        </div>
        <div className="h-full min-h-0 bg-card/20 pb-2">
          <RiskPanel result={result} patients={patients} apiError={error} />
        </div>
      </div>
        <Footer />
    </div>
  );
}
