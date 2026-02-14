import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Activity, 
  Info, 
  UserRound, 
  ClipboardList, 
  Stethoscope, 
  Clock,
  ShieldAlert,
  Star,
  Siren,
  CheckCircle2,
  ChevronRight,
  Users
} from "lucide-react";
import { TriageResult } from "@/hooks/useTriage";
import { Patient } from "@/hooks/usePatients";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Props {
  result: TriageResult | null;
  patients: Patient[];
  apiError: string | null;
}

// 🎨 DYNAMIC THEME CONFIGURATION
const THEME = {
  HIGH: {
    primary: "#ef4444", 
    hex: "#ef4444",
    bg: "bg-red-950/40",
    border: "border-red-500/50",
    text: "text-red-500",
    textBright: "text-red-400",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.3)]",
    badge: "bg-red-500/10 text-red-500 border-red-500/20",
    iconBg: "bg-red-500/10",
  },
  MEDIUM: {
    primary: "#f59e0b", 
    hex: "#f59e0b",
    bg: "bg-amber-950/40",
    border: "border-amber-500/50",
    text: "text-amber-500",
    textBright: "text-amber-400",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    iconBg: "bg-amber-500/10",
  },
  LOW: {
    primary: "#10b981", 
    hex: "#10b981",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/50",
    text: "text-emerald-500",
    textBright: "text-emerald-400",
    glow: "shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
  }
};

const PROTOCOLS = {
  HIGH: [
    { text: "Immediate Bed Assignment (Zone A)", icon: Stethoscope, urgent: true },
    { text: "Continuous Cardiac Monitoring", icon: Activity, urgent: true },
    { text: "Notify Senior Resident / Attending", icon: ShieldAlert, urgent: true },
  ],
  MEDIUM: [
    { text: "Assign to Urgent Care (Zone B)", icon: Stethoscope, urgent: false },
    { text: "Full Vitals Panel Required", icon: Activity, urgent: true },
    { text: "Pain Management Assessment", icon: UserRound, urgent: false },
  ],
  LOW: [
    { text: "Move to Waiting Area (Zone C)", icon: UserRound, urgent: false },
    { text: "Standard Intake Interview", icon: ClipboardList, urgent: false },
    { text: "Re-assess if symptoms worsen", icon: Clock, urgent: false },
  ]
};

export default function RiskPanel({ result, patients, apiError }: Props) {
  const [randomProtocol, setRandomProtocol] = useState<any>(null);
  const [showFullList, setShowFullList] = useState(false);
  
  // Resolve theme based on risk label
  const riskKey = result?.risk_label as keyof typeof THEME || "LOW";
  const currentTheme = THEME[riskKey];

  const scorePercent = result ? Math.round(result.risk_score * 100) : 0;

  // Logic to find best available doctor
  const availableSpecialists = result?.referral?.doctors.filter(d => d.available) || [];
  const bestSpecialist = availableSpecialists.length > 0 
    ? availableSpecialists.reduce((max, doc) => doc.experience > max.experience ? doc : max, availableSpecialists[0])
    : null;

  useEffect(() => {
    if (result) {
      const protocols = PROTOCOLS[result.risk_label as keyof typeof PROTOCOLS] || PROTOCOLS.LOW;
      const random = protocols[Math.floor(Math.random() * protocols.length)];
      setRandomProtocol(random);
    }
  }, [result]);

  return (
    <div className="flex h-full flex-col bg-zinc-950 border-l border-zinc-800 relative overflow-hidden transition-colors duration-500">
      {/* Background Grid Pattern - Dynamic Color */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05] transition-all duration-500" 
        style={{ 
          backgroundImage: `radial-gradient(${currentTheme.hex} 1px, transparent 1px)`, 
          backgroundSize: "20px 20px" 
        }} 
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 p-5 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`rounded-md p-2 border border-zinc-800 bg-zinc-900 transition-colors duration-300 ${result ? currentTheme.text : 'text-zinc-600'}`}>
            <Activity className={`h-5 w-5 ${result?.risk_label === 'HIGH' ? 'animate-pulse' : ''}`} />
          </div>
        </div>
        {result && (
           <Badge variant="outline" className={`${currentTheme.border} ${currentTheme.text} ${currentTheme.bg} transition-all duration-500`}>
             LIVE
           </Badge>
        )}
      </div>

      <ScrollArea className="relative z-10 flex-1 px-5 py-6">
        <div className="space-y-8">
          
          {/* Error State */}
          {apiError && (
            <div className="flex items-center gap-3 rounded border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">ERR_API_OFFLINE: FALLBACK_MODE_ACTIVE</span>
            </div>
          )}

          {/* 1. DYNAMIC GAUGE */}
          <div className="relative flex flex-col items-center justify-center py-4">
            <div className="relative h-60 w-60">
              <div 
                className="absolute inset-0 rounded-full blur-[60px] opacity-20 transition-colors duration-700"
                style={{ backgroundColor: currentTheme.hex }}
              />
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#27272a" strokeWidth="4" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={currentTheme.hex}
                  strokeWidth="4"
                  strokeLinecap="square"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * scorePercent) / 100 }}
                  transition={{ duration: 1.2, type: "spring", bounce: 0 }}
                  className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                  key={scorePercent}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <span className={`text-6xl font-black tracking-tighter drop-shadow-md font-mono transition-colors duration-500 ${currentTheme.text}`}>
                    {scorePercent}%
                  </span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mt-2">Risk Index</span>
                </motion.div>
              </div>
            </div>

            {result && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`mt-[-10px] flex flex-col items-center gap-1`}
              >
                <div className={`px-8 py-2 rounded border bg-black transition-all duration-500 ${currentTheme.border} ${currentTheme.glow}`}>
                  <span className={`text-sm font-bold tracking-widest uppercase ${currentTheme.text}`}>
                    {result.risk_label} PRIORITY
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 2. CLINICAL REASONING */}
          {result && (
            <div className="rounded border border-zinc-800 bg-zinc-900/50 p-5 relative overflow-hidden group">
              <div 
                className="absolute left-0 top-0 h-full w-[2px] transition-colors duration-500"
                style={{ backgroundColor: currentTheme.hex }}
              />
              <div className="mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-zinc-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI Assessment</h3>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300 font-mono">
                {">"} {result.details}
              </p>
            </div>
          )}

          {/* 3. PRIORITY ACTION PROTOCOL */}
          {result && randomProtocol && (
            <div className="space-y-4">
               <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-100 uppercase tracking-wide">
                    <ClipboardList className={`h-4 w-4 ${currentTheme.text}`} />
                    Priority Action
                  </h3>
               </div>
               
               <motion.div
                  key={randomProtocol.text}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-4 rounded-lg border bg-zinc-900/50 p-4 transition-colors 
                    ${randomProtocol.urgent ? `border-l-[4px] ${currentTheme.text.replace("text", "border-l")} ${currentTheme.border}` : 'border-zinc-800'}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 
                    ${randomProtocol.urgent ? currentTheme.text : 'text-zinc-600'}`}>
                    <randomProtocol.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">RECOMMENDED STEP</p>
                    <p className={`text-sm font-bold font-mono ${randomProtocol.urgent ? 'text-white' : 'text-zinc-300'}`}>
                      {randomProtocol.text.toUpperCase()}
                    </p>
                  </div>
                </motion.div>
            </div>
          )}

          {/* 4. SPECIALIST REFERRAL */}
          {result?.referral && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
               <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-100 uppercase tracking-wide">
                    <ShieldAlert className={`h-4 w-4 ${currentTheme.text}`} />
                    Specialist Match
                  </h3>
                  
                  {/* VIEW FULL LIST BUTTON */}
                  <button 
                    onClick={() => setShowFullList(true)}
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider hover:underline ${currentTheme.textBright}`}
                  >
                    View Full List <ChevronRight size={10} />
                  </button>
               </div>

               {/* Embedded Preview (Top Match only) */}
               <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Department</span>
                    <span className="text-sm font-black text-white uppercase tracking-wider font-mono">
                      {result.referral.department.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {availableSpecialists.length > 0 ? (
                       availableSpecialists.map((doc, idx) => {
                         const isRecommended = doc.name === bestSpecialist?.name;
                         // Show only top 2 doctors to save space in preview
                         if (!isRecommended && idx > 0) return null; 

                         return (
                           <div 
                             key={idx} 
                             className={`group relative flex items-center justify-between rounded border p-3 transition-all 
                               ${isRecommended 
                                 ? `${currentTheme.border} ${currentTheme.bg.replace('/40', '/10')}` 
                                 : 'border-zinc-800 bg-zinc-900/50 opacity-60'
                               }`}
                           >
                              {isRecommended && (
                                <div className="absolute -top-2 -right-2">
                                  <span className={`flex items-center gap-1 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider`}
                                    style={{ backgroundColor: currentTheme.hex }}>
                                    <Star size={8} fill="white" /> Top Match
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-3">
                                 <div className={`flex h-8 w-8 items-center justify-center rounded font-bold text-[10px] 
                                   ${isRecommended ? 'text-white' : 'bg-zinc-800 text-zinc-400'}`}
                                   style={{ backgroundColor: isRecommended ? currentTheme.hex : undefined }}>
                                   {doc.name.split(" ")[1]?.[0] || doc.name.charAt(0)}
                                 </div>
                                 
                                 <div>
                                    <div className={`font-bold text-xs ${isRecommended ? 'text-white' : 'text-zinc-300'}`}>
                                      {doc.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500">
                                      {doc.experience}Y EXP
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Ready</span>
                              </div>
                           </div>
                         );
                       })
                    ) : (
                      <div className="rounded border border-dashed border-zinc-800 p-4 text-center">
                        <UserRound className="mx-auto h-5 w-5 text-zinc-700 mb-1" />
                        <p className="text-[10px] text-zinc-500 font-mono">NO SPECIALISTS AVAILABLE</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}

          {!result && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
              <Siren className="mb-4 h-12 w-12 text-zinc-500" />
              <p className="text-sm font-mono text-zinc-500">AWAITING PATIENT DATA...</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* FULL LIST DIALOG */}
      <Dialog open={showFullList} onOpenChange={setShowFullList}>
        <DialogContent className="sm:max-w-md border border-zinc-800 bg-zinc-950 p-0 gap-0 shadow-2xl">
          <div className={`bg-opacity-20 border-b p-6 ${currentTheme.bg} ${currentTheme.border}`}>
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white uppercase tracking-tight">
                  <Users className={`h-5 w-5 ${currentTheme.text}`} />
                  Full Specialist List
                </DialogTitle>
                <div className={`px-2 py-1 border rounded text-[10px] font-mono ${currentTheme.badge}`}>
                  {availableSpecialists.length} AVAILABLE
                </div>
              </div>
              <DialogDescription className="text-zinc-400 font-mono text-xs">
                ALL ON-CALL DOCTORS FOR: <span className="text-white font-bold">{result?.referral?.department.replace("_", " ")}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <ScrollArea className="max-h-[60vh] p-4">
             <div className="space-y-3">
                {availableSpecialists.map((doc, idx) => {
                   const isRecommended = doc.name === bestSpecialist?.name;
                   
                   return (
                     <div 
                       key={idx} 
                       className={`flex items-center justify-between rounded border p-4 transition-all hover:bg-zinc-900/50
                         ${isRecommended 
                           ? `border-zinc-700 bg-zinc-900/20` 
                           : 'border-zinc-800 bg-transparent'
                         }`}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`flex h-10 w-10 items-center justify-center rounded font-bold text-sm 
                             ${isRecommended ? 'text-white' : 'bg-zinc-800 text-zinc-400'}`}
                             style={{ backgroundColor: isRecommended ? currentTheme.hex : undefined }}>
                             {doc.name.split(" ")[1]?.[0] || doc.name.charAt(0)}
                           </div>
                           
                           <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-sm ${isRecommended ? 'text-white' : 'text-zinc-300'}`}>
                                  {doc.name}
                                </span>
                                {isRecommended && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold text-black uppercase tracking-wider`}
                                    style={{ backgroundColor: currentTheme.hex }}>
                                    Best Match
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 mt-1">
                                <span>SENIOR RESIDENT</span>
                                <span className="text-zinc-700">|</span>
                                <span className={isRecommended ? currentTheme.textBright : ""}>
                                  {doc.experience} YEARS EXPERIENCE
                                </span>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              Available
                           </span>
                        </div>
                     </div>
                   );
                })}
             </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}