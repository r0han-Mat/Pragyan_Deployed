import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Heart, AlertTriangle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage("Check your email for verification link.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] border-border bg-card">
          <CardHeader className="text-center">
            <motion.div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              animate={{ scale: [1, 1.08, 1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-foreground">PARS</CardTitle>
            <CardDescription className="text-muted-foreground">
              Patient Assessment & Risk Stratification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-md bg-risk-low/10 p-3 text-sm text-risk-low">
                  {message}
                </div>
              )}

              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full animate-heartbeat bg-primary text-primary-foreground hover:bg-primary/80"
                >
                  {loading ? "..." : isSignUp ? "Create Account" : "Login"}
                </Button>
              </motion.div>

              <p className="text-center text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
                  className="text-primary hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
