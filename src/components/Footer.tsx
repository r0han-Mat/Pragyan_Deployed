
import { Heart, Activity, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/80 px-4 py-1 backdrop-blur-md">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-primary" />
            PARS v1.2
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-green-500" />
            System Operational
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <span>Built for</span>
          <span className="font-bold text-foreground">Critical Care</span>
          <span>with</span>
          <Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
        </div>
      </div>
    </footer>
  );
}
