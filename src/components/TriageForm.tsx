
import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Loader2, Upload, FileText, Mic, MicOff } from "lucide-react"; 
import { PatientInput } from "@/hooks/useTriage";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { parseVoiceInput } from "@/utils/voiceParser";

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
  Chief_Complaint: "",
};

export default function TriageForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({ ...INITIAL });
  const [isUploading, setIsUploading] = useState(false);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // --- Voice Handler ---
  const handleVoiceResult = (text: string) => {
    // 1. Append to Chief Complaint
    setForm(prev => ({
      ...prev,
      Chief_Complaint: prev.Chief_Complaint ? `${prev.Chief_Complaint} ${text}` : text
    }));

    // 2. Parse & Auto-fill
    const { extracted } = parseVoiceInput(text);
    if (Object.keys(extracted).length > 0) {
      setForm(prev => ({ ...prev, ...extracted }));
    }
  };

  const { isListening, toggleListening, hasSupport } = useSpeechToText({
    onResult: handleVoiceResult,
    continuous: true
  });

  // --- Document Upload Handler ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/parse-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extracted = response.data.data;
      const mappedData = { ...extracted };
      if (mappedData.Temp) {
        mappedData.Temperature = mappedData.Temp;
        delete mappedData.Temp;
      }

      setForm((prev) => ({
        ...prev,
        ...mappedData,
      }));

      alert(`✅ Scanned successfully!`);
    } catch (error) {
      console.error("Upload failed", error);
      alert("❌ Failed to parse document.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* --- Auto-Fill Upload Box --- */}
        <div className="mb-2 rounded-lg border border-dashed border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/20 p-2 text-primary">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Auto-Fill from EHR</h3>
                <p className="text-[10px] text-muted-foreground">Upload PDF medical report</p>
              </div>
            </div>

            <label className="cursor-pointer">
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              <div
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isUploading
                    ? "cursor-wait bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload PDF
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
        
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Patient Name</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="border-border bg-secondary text-foreground"
          />
        </div>

        {/* Chief Complaint WITH VOICE */}
        <div className="space-y-1 relative">
          <div className="flex justify-between items-center">
             <Label className="text-xs text-muted-foreground">Chief Complaint / Symptoms (Optional)</Label>
             {hasSupport && (
               <button
                 type="button"
                 onClick={toggleListening}
                 className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full transition-all ${
                    isListening ? "bg-red-500 text-white animate-pulse" : "bg-primary/10 text-primary hover:bg-primary/20"
                 }`}
               >
                 {isListening ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                 {isListening ? "Listening" : "Voice Input"}
               </button>
             )}
          </div>
          <div className={`relative transition-all ${isListening ? "ring-2 ring-primary/50 rounded-md" : ""}`}>
            <Textarea 
              value={form.Chief_Complaint || ""} 
              onChange={(e) => set("Chief_Complaint", e.target.value)} 
              placeholder="e.g. Chest pain radiating to left arm..."
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground/50 min-h-[80px]" 
            />
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Age</Label>
            <Input
              type="number"
              value={form.Age}
              onChange={(e) => set("Age", +e.target.value)}
              min={0}
              max={120}
              className="border-border bg-secondary text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Gender</Label>
            <Select value={form.Gender} onValueChange={(v) => set("Gender", v)}>
              <SelectTrigger className="border-border bg-secondary text-foreground">
                <SelectValue />
              </SelectTrigger>
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
            <Input
              type="number"
              value={form.Pain_Score}
              onChange={(e) => set("Pain_Score", +e.target.value)}
              min={0}
              max={10}
              className="border-border bg-secondary text-foreground"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">GCS Score (3-15)</Label>
            <Input
              type="number"
              value={form.GCS_Score}
              onChange={(e) => set("GCS_Score", +e.target.value)}
              min={3}
              max={15}
              className="border-border bg-secondary text-foreground"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Arrival Mode</Label>
          <Select value={form.Arrival_Mode} onValueChange={(v) => set("Arrival_Mode", v)}>
            <SelectTrigger className="border-border bg-secondary text-foreground">
              <SelectValue />
            </SelectTrigger>
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
            {loading ? "ANALYZING..." : " ANALYZE"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}