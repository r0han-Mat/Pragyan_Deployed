
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Stethoscope, 
  Activity, 
  User, 
  FileText, 
  CheckCircle2,
  Mic,
  MicOff,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTriage, PatientInput } from "@/hooks/useTriage";
import RiskPanel from "@/components/RiskPanel";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { parseVoiceInput } from "@/utils/voiceParser";

// Simplified form state
interface SimpleFormState {
  name: string;
  age: string;
  gender: string;
  symptoms: string;
}

export default function PatientIntake() {
  const { predict, loading, result, setResult, error } = useTriage();
  const [step, setStep] = useState<"form" | "result">("form");
  
  const [form, setForm] = useState<SimpleFormState>({
    name: "",
    age: "",
    gender: "",
    symptoms: "",
  });

  // Store extracted vitals/history that might be spoken but not visible in the simple form
  const [extractedData, setExtractedData] = useState<Partial<PatientInput>>({});

  // Voice Handler
  const handleVoiceResult = (text: string) => {
    // 1. Update text area for feedback
    setForm(prev => ({ 
      ...prev, 
      symptoms: prev.symptoms ? `${prev.symptoms} ${text}` : text 
    }));

    // 2. Parse for entities
    const { extracted } = parseVoiceInput(text);
    
    // 3. Auto-fill visible form fields if detected
    if (extracted.name) setForm(prev => ({ ...prev, name: extracted.name! }));
    if (extracted.Age) setForm(prev => ({ ...prev, age: extracted.Age!.toString() }));
    if (extracted.Gender) setForm(prev => ({ ...prev, gender: extracted.Gender! }));

    // 4. Store other extracted medical data (vitals, history)
    const { name, Age, Gender, ...others } = extracted as any;
    setExtractedData(prev => ({ ...prev, ...others }));
  };

  const { isListening, toggleListening, hasSupport } = useSpeechToText({ 
    onResult: handleVoiceResult, 
    continuous: true 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct full payload: Form Data + Extracted Vitals + Defaults
    const payload: PatientInput & { name: string } = {
      name: form.name,
      Age: parseInt(form.age) || 30,
      Gender: form.gender || "Male",
      Chief_Complaint: form.symptoms,
      
      // Defaults first
      Heart_Rate: 75,
      Systolic_BP: 120,
      Diastolic_BP: 80,
      O2_Saturation: 98,
      Temperature: 37.0,
      Respiratory_Rate: 16,
      Pain_Score: 0,
      GCS_Score: 15,
      Arrival_Mode: "Walk-in",
      Diabetes: false,
      Hypertension: false,
      Heart_Disease: false,

      // Overwrite with any extracted voice data
      ...extractedData
    };

    await predict(payload);
    setStep("result");
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground font-sans selection:bg-primary/20 overflow-hidden relative">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
      />

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-serif-display">PARS</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Self Check-In Kiosk</p>
          </div>
        </div>

        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Staff Login
          </Button>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10 overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {/* --- VIEW 1: INTAKE FORM --- */}
          {step === "form" && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl"
            >
              <div className="rounded-2xl border border-border bg-card/40 shadow-2xl backdrop-blur-xl overflow-hidden">
                
                {/* Card Header */}
                <div className="border-b border-border bg-white/5 p-6 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold font-serif-display">Patient Intake</h2>
                    </div>
                    <p className="text-sm text-muted-foreground ml-1">
                      Please provide your details below.
                    </p>
                  </div>

                  {/* VOICE INDICATOR */}
                  {hasSupport && (
                    <Button 
                      variant="outline" 
                      onClick={toggleListening}
                      className={`gap-2 transition-all duration-500 ${
                        isListening 
                          ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                          : "border-primary/30 hover:bg-primary/5 text-muted-foreground"
                      }`}
                    >
                      {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      {isListening ? "Listening..." : "Voice Input"}
                    </Button>
                  )}
                </div>

                {/* Form Body */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Demographics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="name"
                            required
                            placeholder="e.g. Jane Doe"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            className="bg-background/50 border-border focus:ring-primary/20 pl-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Age</Label>
                          <Input 
                            id="age"
                            required
                            type="number"
                            placeholder="30"
                            value={form.age}
                            onChange={e => setForm({...form, age: e.target.value})}
                            className="bg-background/50 border-border focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Gender</Label>
                          <Select required value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                            <SelectTrigger className="bg-background/50 border-border">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Symptoms Area */}
                    <div className="space-y-2 relative">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="symptoms" className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                          <Stethoscope className="h-3 w-3" /> Chief Complaint / Symptoms
                        </Label>
                        
                        {/* Extracted Data Badges */}
                        <div className="flex gap-2">
                           {extractedData.Heart_Rate && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">HR: {extractedData.Heart_Rate}</span>}
                           {extractedData.Temperature && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Temp: {extractedData.Temperature}°</span>}
                           {extractedData.Systolic_BP && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">BP: {extractedData.Systolic_BP}/{extractedData.Diastolic_BP}</span>}
                        </div>
                      </div>

                      <div className={`relative transition-all ${isListening ? "ring-2 ring-primary/50 rounded-md" : ""}`}>
                        <Textarea 
                          id="symptoms"
                          required
                          rows={8}
                          placeholder={isListening ? "Listening... Speak naturally." : "Describe what you are feeling OR click 'Voice Input' to speak..."}
                          value={form.symptoms}
                          onChange={e => setForm({...form, symptoms: e.target.value})}
                          className="bg-background/50 border-border focus:ring-primary/20 resize-none text-base pr-12"
                        />
                        
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                             isListening 
                             ? "bg-red-500 text-white animate-pulse shadow-lg" 
                             : "bg-primary/10 text-primary hover:bg-primary/20"
                          }`}
                        >
                          {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground text-right">*You can dictate symptoms, age, and vitals.</p>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-primary/25 transition-all"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Activity className="h-4 w-4 animate-spin" /> Analyzing Vitals...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Submit for Assessment <CheckCircle2 className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </div>

                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* --- VIEW 2: RESULTS --- */}
          {step === "result" && result && (
             <motion.div 
               key="result"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-5xl h-[85vh] flex flex-col"
             >
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <h2 className="text-2xl font-bold font-serif-display text-foreground">Assessment Complete</h2>
                   <p className="text-sm text-muted-foreground">AI Analysis based on reported symptoms.</p>
                 </div>
                 <Button 
                   variant="outline" 
                   onClick={() => { setStep("form"); setResult(null); setForm({name:"", age:"", gender:"", symptoms:""}); setExtractedData({}); }}
                   className="gap-2"
                 >
                   <ChevronLeft className="h-4 w-4" /> New Check-In
                 </Button>
               </div>

               <div className="flex-1 flex flex-col rounded-2xl border border-border bg-card/40 shadow-2xl overflow-hidden backdrop-blur-xl relative">
                  <div className="absolute inset-0 overflow-hidden">
                     <RiskPanel result={result} patients={[]} apiError={error} />
                  </div>
               </div>
             </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
