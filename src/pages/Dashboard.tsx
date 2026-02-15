import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePatients, Patient } from "@/hooks/usePatients";
import { useTriage, PatientInput } from "@/hooks/useTriage";
import PatientQueue from "@/components/PatientQueue";
import TriageForm from "@/components/TriageForm";
import RiskPanel from "@/components/RiskPanel";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import AdminStats from "@/components/AdminStats";
import { 
  LogOut, 
  Shield, 
  LayoutDashboard, 
  Stethoscope,
  Plus,
  Zap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { activePatients, patients, addPatient } = usePatients();
  const { predict, loading, error, result, setResult } = useTriage();
  
  const [activeTab, setActiveTab] = useState("intake");
  const [simActive, setSimActive] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Refs for logic
  const simActiveRef = useRef(false);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevActivePatients = useRef<Patient[]>([]); // Track queue state

  // Sync sim state to ref
  useEffect(() => {
    simActiveRef.current = simActive;
  }, [simActive]);

  // ------------------------------------------------------------------
  // 1. QUEUE MONITORING EFFECT (Handles Exit Toasts)
  // ------------------------------------------------------------------
  useEffect(() => {
    // Detect who left the queue since the last render
    const removedPatients = prevActivePatients.current.filter(
      (prev) => !activePatients.some((curr) => curr.id === prev.id)
    );

    removedPatients.forEach((patient) => {
      // Safety Check: Sometimes an ID changes from 'temp' to 'real' during sync.
      // We check if a patient with the same name exists to avoid a false "Exit" toast.
      const isJustIdSwap = activePatients.some((curr) => curr.name === patient.name);

      if (!isJustIdSwap) {
        // ACTUAL DISCHARGE EVENT
        const departmentName = patient.department?.replace(/_/g, " ") || "General Medicine";
        
        console.log("[Queue] Patient Discharged:", patient.name);
        
        toast.success(`Patient ${patient.name} Processed`, {
          description: `successfully got treated & Removed from Queue`,
          duration: 4000,
          icon: <div className="bg-green-500 rounded-full p-1"><Stethoscope size={12} className="text-white" /></div>
        });
      }
    });

    // Update ref for next comparison
    prevActivePatients.current = activePatients;
  }, [activePatients]);


  // ------------------------------------------------------------------
  // 2. SUBMISSION LOGIC
  // ------------------------------------------------------------------
  const handleSubmit = useCallback(async (data: PatientInput & { name: string }, isAuto: boolean = false) => {
    
    // Guard: Stop if sim was toggled off during an async cycle
    if (isAuto && !simActiveRef.current) return;

    const triageResult = await predict(data);
    
    if (isAuto && !simActiveRef.current) return;

    if (triageResult) {
      // Add to Queue (Hook handles logic)
      const newPatient = await addPatient({
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
        department: triageResult.referral?.department,
        chief_complaint: data.Chief_Complaint,
      });

      // Entry Toast
      toast.success(`${isAuto ? '🤖 [SIM]' : '✅'} Patient ${data.name} Triaged`, {
        description: `Risk: ${triageResult.risk_label} | Assigned to Queue`,
        duration: 3000,
      });

      if (!isAuto) {
        setActiveTab("analysis");
        // We'll set the selected patient after we get the newPatient object
      }

      // Immediate Analytics Record (For Graph)
      if (newPatient) {
        if (!isAuto) setSelectedPatient(newPatient); // Set selected patient for PDF export
        const rawDept = triageResult.referral?.department || "General Medicine";
        try {
           await supabase.from("patient_assignments").insert({
             patient_id: newPatient.id,
             patient_name: data.name,
             department: rawDept,
             doctor_name: "Assigned via Triage", 
           });
        } catch (err) {
           console.error("Analytics Error:", err);
        }
        // Removed the setTimeout here. The useEffect above handles the exit toast now.
      }
    }
  }, [predict, addPatient]);

  // ------------------------------------------------------------------
  // 3. SIMULATION LOOP
  // ------------------------------------------------------------------
  useEffect(() => {
    if (simActive) {
      handleSubmit(randomPatientInput(), true);
      simRef.current = setInterval(() => {
        if (simActiveRef.current) {
            handleSubmit(randomPatientInput(), true);
        }
      }, 5000);
    } else {
      if (simRef.current) {
        clearInterval(simRef.current);
        simRef.current = null;
      }
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [simActive, handleSubmit]);

  const handleSelectPatient = (p: Patient) => {
    if (p.risk_score != null && p.risk_label) {
      setResult({
        risk_score: Number(p.risk_score),
        risk_label: p.risk_label,
        details: p.explanation || "",
      });
      setSelectedPatient(p);
      setActiveTab("analysis"); 
    }
  };

  return (
    <div className="flex h-screen flex-col text-foreground font-sans selection:bg-primary/20 p-4 gap-4 overflow-hidden">
      
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between rounded-2xl border border-[#D4AF37]/50 bg-card/30 px-6 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-inner">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-serif-display">PARS</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Clinical Command Center</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end border-r border-border pr-4">
            <span className="text-sm font-semibold">{user?.email?.split('@')[0]}</span>
            <span className="text-[10px] text-muted-foreground uppercase">On Duty</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdmin(true)}
            className="hidden md:flex gap-2 border-primary/20 text-primary hover:bg-primary/10"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* LEFT COLUMN: Queue */}
        <aside className="w-full md:w-[320px] lg:w-[380px] flex flex-col shrink-0 rounded-2xl border border-[#D4AF37]/50 bg-card/30 backdrop-blur-md shadow-lg overflow-hidden h-[300px] md:h-auto transition-all">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/40">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Patient Record</h2>
              <Badge variant="outline" className="ml-1 border-white/10 text-muted-foreground px-2 py-[2px] bg-black/20">
                {activePatients.length}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5">
                <Label htmlFor="sim-mode" className="text-[10px] font-bold uppercase text-muted-foreground cursor-pointer hidden sm:block">
                  Live Sim
                </Label>
                <Switch
                  id="sim-mode"
                  checked={simActive}
                  onCheckedChange={setSimActive}
                  className="scale-75 data-[state=checked]:bg-green-500"
                />
                {simActive && <Zap className="h-3 w-3 animate-pulse text-green-500" />}
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setActiveTab("intake")}
                className="hover:bg-primary/20 hover:text-primary rounded-lg"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <PatientQueue
              patients={activePatients}
              selectedId={null}
              onSelect={handleSelectPatient}
            />
          </div>
        </aside>

        {/* RIGHT COLUMN: Workbench */}
        <main className="flex-1 flex flex-col min-w-0 relative rounded-2xl overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <div className="pb-4 shrink-0">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-card/30 border border-[#D4AF37]/50 backdrop-blur-md rounded-xl p-1">
                <TabsTrigger value="intake" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                 Triage Intake
                </TabsTrigger>
                <TabsTrigger value="analysis" disabled={!result} className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                  Patient Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                <TabsContent value="intake" className="h-full mt-0 border-0 focus-visible:ring-0 data-[state=active]:flex flex-col">
                  <div className="flex flex-col h-full rounded-2xl border border-[#D4AF37]/50 bg-card/30 shadow-xl backdrop-blur-md transition-all">
                      <div className="flex-1 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent rounded-2xl">
                        <TriageForm onSubmit={(data) => handleSubmit(data, false)} loading={loading} />
                      </div>
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="h-full mt-0 border-0 focus-visible:ring-0 data-[state=active]:flex flex-col">
                  <div className="flex flex-col h-full rounded-2xl border border-[#D4AF37]/50 bg-card/30 shadow-xl overflow-hidden backdrop-blur-md transition-all">
                      <div className="flex-1 overflow-hidden relative rounded-2xl">
                        <div className="absolute inset-0">
                           <RiskPanel result={result} patients={patients} apiError={error} selectedPatient={selectedPatient} />
                        </div>
                      </div>
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </main>
      </div>

      <Footer />
      {showAdmin && (
        <AdminStats patients={patients} onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
}