import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Login() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  // New state for Login Mode: 'selection' | 'hospital'
  const [loginMode, setLoginMode] = useState<"selection" | "hospital">("selection");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage(t('login.verification_sent'));
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">

      {/* Login Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: "brightness(0.5)" }} // Darken slightly for text readability
      >
        <source src="/login-vid.mp4" type="video/mp4" />
      </video>

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-30">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
            <Globe className="h-4 w-4 text-white/70 ml-2" />
            <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
                <SelectTrigger className="w-[100px] h-8 bg-transparent border-none text-xs text-white focus:ring-0">
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="ta">தமிழ்</SelectItem>
                    <SelectItem value="te">తెలుగు</SelectItem>
                    <SelectItem value="bn">বাংলা</SelectItem>
                    <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                    <SelectItem value="mr">मराठी</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* main content */}
      <div className="relative z-20 grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* LEFT SIDE */}
        <div className="flex flex-col items-center justify-center px-6 md:px-10 py-12 lg:py-0">

          <motion.img
            src="/logo.png"
            alt="PARS Logo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="h-24 md:h-36 w-auto mb-6 md:mb-8 drop-shadow-[0_0_25px_rgba(255,0,0,0.25)]"
          />

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="max-w-md text-left"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {t('login.operation', 'Operation')}{" "}
              <span className="text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]">
                {t('app.title', 'PARS')}
              </span>
            </h1>

            <p className="mt-4 text-red-400 font-medium text-sm md:text-base">
              {t('login.pars_full', 'Patient Assessment & Risk Stratification System')}
            </p>

            <p className="mt-3 text-gray-400 text-xs md:text-sm leading-relaxed">
              {t('login.desc', 'A real-time clinical support interface engineered for high-pressure environments. Leverages predictive analytics to facilitate rapid acuity scoring, patient prioritization, and care coordination.')}
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
              border border-red-500
              backdrop-blur-xl
              shadow-[0_0_50px_rgba(0,255,100,0.15)]
              text-white
              rounded-xl
              overflow-hidden
              "
            >
              {loginMode === "selection" ? (
                // --- SELECTION MODE ---
                <div className="p-8 flex flex-col gap-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">{t('login.welcome')}</h2>
                    <p className="text-gray-400 text-sm">{t('login.select_portal')}</p>
                  </div>

                  <div className="grid gap-4">
                    {/* HOSPITAL ATTENDANT */}
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLoginMode("hospital")}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border border-red-500/30 bg-red-950/10 transition-all hover:border-red-500 group"
                    >
                       <div className="p-3 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 0 0 9-9c0-4.97-4.03-9-9-9a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9Z"/><path d="M12 7v10"/><path d="M7 12h10"/></svg>
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-white">{t('login.hospital_attendant')}</h3>
                         <p className="text-xs text-red-300/70">{t('login.staff_access')}</p>
                       </div>
                    </motion.button>

                    {/* PATIENT */}
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/patient")}
                      className="flex flex-col items-center gap-3 p-6 rounded-xl border border-blue-500/30 bg-blue-950/10 transition-all hover:border-blue-500 group"
                    >
                       <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                       </div>
                       <div>
                         <h3 className="text-lg font-bold text-white">{t('login.patient_login')}</h3>
                         <p className="text-xs text-blue-300/70">{t('login.patient_desc')}</p>
                       </div>
                    </motion.button>
                  </div>
                </div>
              ) : (
                // --- HOSPITAL FORM MODE ---
                <>
                  <CardHeader className="text-center pb-2 relative">
                    <button 
                      onClick={() => setLoginMode("selection")}
                      className="absolute left-6 top-6 text-gray-500 hover:text-white transition-colors text-xs uppercase font-bold flex items-center gap-1"
                    >
                      ← {t('login.back')}
                    </button>
                    <CardTitle className="text-3xl font-bold text-white">
                      {isSignUp ? t('login.create_account') : t('login.secure_login')}
                    </CardTitle>

                    <CardDescription className="text-red-400">
                      {isSignUp
                        ? t('login.register_access')
                        : t('login.sign_in_continue')}
                    </CardDescription>

                  </CardHeader>

                  <CardContent>

                    <form onSubmit={handleSubmit} className="space-y-5">

                      {/* EMAIL */}
                      <div>
                        <Label className="text-gray-300 mb-1 block">
                          {t('login.email')}
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
                          focus:border-red-500
                          focus:ring-red-500/30
                          text-white
                          "
                        />
                      </div>

                      {/* PASSWORD */}
                      <div>
                        <Label className="text-gray-300 mb-1 block">
                          {t('login.password')}
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
                          focus:border-red-500
                          focus:ring-red-500/30
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
                        <div className="bg-red-900/30 border border-red-700 text-red-400 p-3 rounded">
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
                          text-black
                          font-semibold
                          border border-red-400
                          shadow-[0_0_20px_rgba(0,255,100,0.35)]
                          "
                        >
                          {loading
                            ? t('login.authenticating')
                            : isSignUp
                            ? t('login.create_account')
                            : t('login.login_btn')}
                        </Button>
                      </motion.div>

                      {/* TOGGLE */}
                      <div className="text-center text-gray-400 text-sm pt-2">

                        {isSignUp
                          ? t('login.already_registered')
                          : t('login.new_to_pars')}

                        <button
                          type="button"
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError("");
                            setMessage("");
                          }}
                          className="
                          ml-2
                          text-red-400
                          hover:text-red-300
                          font-semibold
                          "
                        >
                          {isSignUp ? t('login.login_btn') : t('login.register_btn')}
                        </button>

                      </div>

                    </form>

                  </CardContent>
                </>
              )}

            </Card>

          </motion.div>

        </div>

      </div>

      {/* ECG animation style */}
      <style>
        {`
        @keyframes ecgMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-ecg {
          animation: ecgMove 8s linear infinite;
        }
        `}
      </style>

    </div>
  );
}