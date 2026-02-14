import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

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
      else setMessage("Verification email sent.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    }

    setLoading(false);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/login-bg.avif')" }}
    >
      {/* Dark + Red Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Grid */}
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex flex-col items-center justify-center px-10">

          {/* Centered Logo */}
          <motion.img
            src="/logo.png"
            alt="PARS Logo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="h-36 w-auto mb-8 drop-shadow-[0_0_25px_rgba(255,215,0,0.25)]"
          />

          {/* Left aligned text below */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-md text-left"
          >
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Operation{" "}
              <span className="text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
                PARS
              </span>
            </h1>

            <p className="mt-4 text-red-400 font-medium">
              Patient Assessment & Risk Stratification System
            </p>

            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
              AI-powered real-time medical triage platform designed to assist healthcare
              professionals in rapid risk evaluation, emergency prioritization,
              and intelligent clinical decision support.
            </p>
          </motion.div>

        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center px-6 lg:justify-start lg:px-16">

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card
              className="
              bg-black/60
              border border-yellow-500
              backdrop-blur-xl
              shadow-[0_0_50px_rgba(255,0,0,0.15)]
              text-white
              rounded-xl
              "
            >

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-bold text-white">
                  {isSignUp ? "Create Account" : "Secure Login"}
                </CardTitle>

                <CardDescription className="text-red-400">
                  {isSignUp
                    ? "Register to access PARS"
                    : "Sign in to continue"}
                </CardDescription>
              </CardHeader>

              <CardContent>

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* EMAIL */}
                  <div>
                    <Label className="text-gray-300 mb-1 block">
                      Email
                    </Label>

                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="doctor@hospital.com"
                      className="
                      bg-black/70
                      border border-red-900
                      focus:border-yellow-500
                      focus:ring-yellow-500/30
                      text-white
                      placeholder:text-gray-500
                      "
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <Label className="text-gray-300 mb-1 block">
                      Password
                    </Label>

                    <Input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="
                      bg-black/70
                      border border-red-900
                      focus:border-yellow-500
                      focus:ring-yellow-500/30
                      text-white
                      "
                    />
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-950/40 border border-red-700 text-red-400 p-3 rounded">
                      <AlertTriangle size={16} />
                      {error}
                    </div>
                  )}

                  {/* SUCCESS */}
                  {message && (
                    <div className="bg-green-900/30 border border-green-700 text-green-400 p-3 rounded">
                      {message}
                    </div>
                  )}

                  {/* BUTTON */}
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="
                      w-full
                      bg-red-600
                      hover:bg-red-500
                      text-white
                      font-semibold
                      border border-yellow-500
                      shadow-[0_0_20px_rgba(255,0,0,0.35)]
                      transition-all
                      "
                    >
                      {loading
                        ? "Authenticating..."
                        : isSignUp
                        ? "Create Account"
                        : "Login"}
                    </Button>
                  </motion.div>

                  {/* TOGGLE */}
                  <div className="text-center text-gray-400 text-sm pt-2">
                    {isSignUp
                      ? "Already registered?"
                      : "New to PARS?"}

                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                        setMessage("");
                      }}
                      className="
                      ml-2
                      text-red-500
                      hover:text-red-400
                      font-semibold
                      "
                    >
                      {isSignUp ? "Login" : "Register"}
                    </button>
                  </div>

                </form>

              </CardContent>

            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}