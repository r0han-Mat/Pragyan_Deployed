import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Thermometer, Wind, Play, AlertTriangle } from 'lucide-react';
import { useVitalSigns, PatientCondition } from '@/hooks/useVitalSigns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

const CONDITIONS: { value: PatientCondition; label: string; color: string }[] = [
  { value: 'NORMAL', label: 'Normal Sinus Rhythm', color: 'text-emerald-500' },
  { value: 'TACHYCARDIA', label: 'Tachycardia (High HR)', color: 'text-red-500' },
  { value: 'BRADYCARDIA', label: 'Bradycardia (Low HR)', color: 'text-blue-500' },
  { value: 'HYPOXIA', label: 'Hypoxia (Low SpO2)', color: 'text-purple-500' },
  { value: 'HYPERTENSIVE_CRISIS', label: 'Hypertensive Crisis', color: 'text-orange-500' },
  { value: 'SHOCK', label: 'Shock / Hypotension', color: 'text-red-600' },
];

export default function VitalsMonitor() {
  const { current, history, condition, setCondition } = useVitalSigns();
  const [activeTab, setActiveTab] = useState('all');

  // Helper to format chart data
  const formatData = (data: any[]) => data.map((d, i) => ({ ...d, index: i }));

  return (
    <div className="w-full space-y-4">
      
      {/* Simulation Controls Header */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 animate-pulse">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Live Telemetry</h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-muted-foreground font-mono">DEVICE_ID: WBL-2026-XJ</span>
               <Badge variant="outline" className="text-[9px] h-4 px-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">CONNECTED</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest mr-2">
            <span>Simulate Condition:</span>
          </div>
          <Select 
            value={condition} 
            onValueChange={(v) => setCondition(v as PatientCondition)}
          >
            <SelectTrigger className="w-[200px] h-8 text-xs border-white/10 bg-black/20 focus:ring-0">
               <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
               {CONDITIONS.map(c => (
                 <SelectItem key={c.value} value={c.value} className="text-xs">
                    <span className={c.color}>{c.label}</span>
                 </SelectItem>
               ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Heart Rate */}
        <VitalsCard 
           title="Heart Rate" 
           value={current.heartRate} 
           unit="bpm" 
           icon={Heart}
           color="#ef4444" 
           data={history.heartRate}
           condition={condition}
           alert={condition === 'TACHYCARDIA' || condition === 'BRADYCARDIA'}
        />

        {/* Card 2: SpO2 */}
        <VitalsCard 
           title="SpO2 Saturation" 
           value={current.spo2} 
           unit="%" 
           icon={Wind}
           color="#3b82f6" 
           data={history.spo2}
           condition={condition}
           alert={condition === 'HYPOXIA'}
        />

        {/* Card 3: Blood Pressure (Systolic Focus) */}
        <VitalsCard 
           title="Blood Pressure" 
           value={current.systolic} 
           subValue={`/ ${current.diastolic}`}
           unit="mmHg" 
           icon={Activity}
           color="#f59e0b" 
           data={history.systolic}
           condition={condition}
           alert={condition === 'HYPERTENSIVE_CRISIS' || condition === 'SHOCK'}
        />

      </div>
    </div>
  );
}

function VitalsCard({ title, value, subValue, unit, icon: Icon, color, data, condition, alert }: any) {
  return (
    <motion.div 
      layout
      className={`relative overflow-hidden rounded-xl border bg-black/20 backdrop-blur-sm transition-colors duration-500
        ${alert ? 'border-red-500/50 bg-red-950/20' : 'border-white/5'}`}
    >
        {/* Animated Background Pulse for Alerts */}
        {alert && (
            <motion.div 
               animate={{ opacity: [0.1, 0.3, 0.1] }}
               transition={{ duration: 1, repeat: Infinity }}
               className="absolute inset-0 bg-red-500/10 pointer-events-none"
            />
        )}

        <div className="p-4 flex flex-col h-[180px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon size={14} className={alert ? 'text-red-400' : ''} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">{title}</span>
                </div>
                {alert && <AlertTriangle size={14} className="text-red-500 animate-bounce" />}
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-4xl font-black tracking-tighter ${alert ? 'text-red-500' : 'text-white'}`}>
                    {value}
                </span>
                {subValue && (
                    <span className="text-xl font-bold text-muted-foreground">
                        {subValue}
                    </span>
                )}
                <span className="text-xs font-bold text-muted-foreground uppercase">{unit}</span>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={color} 
                            strokeWidth={2}
                            fill={`url(#gradient-${title})`} 
                            isAnimationActive={false} // Disable initial animation for smooth real-time updates
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </motion.div>
  );
}
