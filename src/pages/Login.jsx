import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
// import CarIllustration from "../assets/CarIllustration";
import bmw from "../assets/bmw.png";
import useAppStore from "../store/useAppStore";
import SplashScreen from "../components/ui/SplashScreen";
import apexToast from "../utils/toast";
import BrandLogo from "../components/branding/BrandLogo";
// ─── DUMMY CREDENTIALS ───────────────────────────────────────────────────────
// In a real app this would be an API call. For portfolio, hardcoded is fine.
const ADMIN_EMAIL = "admin@apexgt.ae";
const ADMIN_PASSWORD = "admin123";
// ─────────────────────────────────────────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate(); // For redirecting after login
  const { login } = useAppStore(); // Zustand action to set auth state

  // ── Local state ────────────────────────────────────────────────────────────
  // useState returns [value, setterFunction]
  // Each piece of state here controls something on screen
  const [showSplash, setShowSplash] = useState(true); // Is splash visible?
  const [email, setEmail] = useState(""); // Email input value
  const [password, setPassword] = useState(""); // Password input value
  const [showPassword, setShowPassword] = useState(false); // Eye toggle
  const [rememberMe, setRememberMe] = useState(false); // Checkbox
  const [isLoading, setIsLoading] = useState(false); // Button loading state
  const [error, setError] = useState(""); // Error message string
  const [success, setSuccess] = useState(false); // Success overlay

  // ── Handle splash completion ────────────────────────────────────────────────
  // SplashScreen calls this when its animation finishes
  const handleSplashDone = () => setShowSplash(false);

  // ---- Handle login submit ------------------------------

  const handleLogin = async () => {
    // Clear previous error state
    setError("");
    setIsLoading(true);

    // Simulated API delay — replace with real fetch() in production
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // ✅ 1. Tell Zustand the user is authenticated
      login({ name: "Admin", email, role: "Admin" });

      // ✅ 2. Show success toast
      apexToast.success(
        "Login Successful",
        "Welcome back, Admin. Redirecting to dashboard...",
      );

      // ✅ 3. Show the success overlay animation on the page
      setSuccess(true);

      // ✅ 4. Navigate to dashboard after the overlay plays
      //    useNavigate('/dashboard') is what was MISSING before —
      //    the success overlay was showing but never actually redirecting.
      setTimeout(() => {
        navigate("/dashboard"); // ← THIS was the missing fix
      }, 1800);
    } else {
      // ❌ Wrong credentials
      setIsLoading(false);

      // Show error toast
      apexToast.error(
        "Authentication Failed",
        "Invalid email or password. Please check your credentials.",
      );

      // Also show inline error for the form (double feedback)
      setError("Invalid credentials. Use the demo account below.");
    }
  };

  // Allow Enter Key to submit

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };
  return (
    <div
      className="relative min-h-screen bg-base overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* ── 1. SPLASH SCREEN ────────────────────────────────────────────── */}
      {/*  AnimatePresence lets Framer Motion animate the EXIT of a component */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashDone} />}
      </AnimatePresence>

      {/* ── 2. SUCCESS OVERLAY ──────────────────────────────────────────── */}

      <AnimatePresence>
        {success && (
          <motion.div
            className="fixed inset-0 z-40 bg-base flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full border-2 border-gold bg-gold/10
                         flex items-center justify-center mb-5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-9 h-9 text-gold" />
            </motion.div>
            <motion.p
              className="text-2xl font-bold text-text-primary mb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back, Admin
            </motion.p>
            <motion.p
              className="text-sm text-text-subtle tracking-widest"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting to Dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. MAIN LOGIN LAYOUT ────────────────────────────────────────── */}

      <motion.div
        className="flex min-h-screen" // Fades in after splash is gone
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* ── LEFT PANEL: Car Visual ────────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 relative bg-[#080C10] overflow-hidden">
          {/* Corner accent brackets */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t border-1 border-gold/30" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-gold/30" />
          {/* Scanning line effect */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r
                       from-transparent via-sky-accent/30 to-transparent"
            animate={{ top: ["20%", "80%", "20%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* Gold glow orb behind car */}
          <motion.div
            className="absolute w-96 h-64 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                       bg-gradient-radial from-gold/10 to-transparent"
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Car SVG — floating animation */}
          <motion.div
            className="absolute w-full max-w-3xl top-1/2 left-1/2 -translate-x-1/2"
            animate={{ y: ["-54%", "-58%", "-54%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* 
              Paste the same SVG car markup from the preview here.
              (See the full SVG code in the widget above)
              In your real project, save it as src/assets/CarIllustration.jsx
            */}
            {/* <CarIllustration /> */}
            <img
              src={bmw}
              alt="BMW GT"
              className="object-center h-auto w-full"
            />
          </motion.div>

          {/* Spec badges — top right */}
          <div className="absolute top-10 right-10 flex flex-col gap-2 items-end">
            {[
              { label: "Model", value: "BMW GT" },
              { label: "Power", value: "585 HP" },
              { label: "0–100", value: "3.2s" },
            ].map((spec, i) => (
              <motion.div
                key={spec.label}
                className="glass-card px-3 py-1.5 text-[10px] tracking-widest text-text-muted uppercase"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: showSplash ? 0 : 1,
                  x: showSplash ? 20 : 0,
                }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                {spec.label}
                <span className="text-gold ml-2">{spec.value}</span>
              </motion.div>
            ))}
          </div>

          {/* Brand info — bottom left */}
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex flex-col items-start mb-8">
              <BrandLogo
                brand="product"
                variant="full"
                className="h-12 sm:h-14 object-contain mb-2"
              />
            </div>
            <div className="w-14 h-px bg-gradient-to-r from-gold to-transparent mb-4" />
            <p className="text-sm text-text-muted leading-relaxed">
              Premium Automotive Experience
              <br />
              in the Heart of the UAE
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL: Login Form ───────────────────────────────────── */}
        <motion.div
          className="w-full lg:w-[460px] flex-shrink-0 bg-[#0D1117] border-l border-border
                     flex flex-col justify-center px-8 lg:px-12 py-16 relative"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: showSplash ? 40 : 0, opacity: showSplash ? 0 : 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {/* Gold shimmer line at top */}
          <div
            className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-gold/25 to-transparent"
          />

          {/* ── Form Header ── */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-[0.3em] text-gold uppercase mb-3">
              Admin Portal
            </p>
            <h1 className="text-[2rem] font-extrabold text-text-primary leading-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-text-subtle leading-relaxed">
              Sign in to access your dealership dashboard
            </p>
          </div>

          {/* ── Error Message ── */}
          {/*  AnimatePresence + motion.div makes the error slide in/out smoothly */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-center gap-3 bg-red-500/8 border border-red-500/20
                           rounded-xl px-4 py-3 mb-6"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Email Input ── */}
          <div className="mb-5">
            <label
              className="block text-[10px] font-semibold tracking-[0.2em]
                              text-text-muted uppercase mb-2"
            >
              Email Address
            </label>
            {/*  Input wrapper with icon inside — position:relative on parent  */}
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                               text-text-subtle pointer-events-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@apexgt.ae"
                className="input-luxury pl-11"
                // input-luxury is our custom Tailwind component class from index.css
              />
            </div>
          </div>

          {/* ── Password Input ── */}
          <div className="mb-6">
            <label
              className="block text-[10px] font-semibold tracking-[0.2em]
                              text-text-muted uppercase mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                               text-text-subtle pointer-events-none"
              />
              {/*  type switches between 'password' and 'text' via showPassword state  */}
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-luxury pl-11 pr-12"
              />
              {/*  Eye toggle button  */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2
                           text-text-subtle hover:text-text-muted transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* ── Remember Me + Forgot Password ── */}
          <div className="flex items-center justify-between mb-8">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-card border-border
                           accent-gold cursor-pointer"
              />
              <span className="text-xs text-text-muted">Remember me</span>
            </label>
            <button className="text-xs text-gold/70 hover:text-gold transition-colors">
              Forgot password?
            </button>
          </div>

          {/* ── Login Button ── */}
          <motion.button
            onClick={handleLogin}
            disabled={isLoading}
            className="btn-gold w-full py-4 text-sm tracking-[0.2em] uppercase
                       disabled:opacity-60 disabled:cursor-not-allowed"
            // Button press animation using Framer Motion
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.01 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                {/* Spinning loader */}
                <motion.span
                  className="w-4 h-4 border-2 border-base/30 border-t-base
                             rounded-full inline-block"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Authenticating...
              </span>
            ) : (
              "Access Dashboard"
            )}
          </motion.button>

          {/* ── Demo hint ── */}
          <p
            className="mt-8 pt-6 border-t border-border text-[11px] text-text-subtle
                        text-center tracking-wide"
          >
            Demo ·
            <span
              className="text-gold/40 cursor-pointer hover:text-gold/70 transition-colors"
              onClick={() => {
                setEmail(ADMIN_EMAIL);
                setPassword(ADMIN_PASSWORD);
              }}
            >
              Click to autofill credentials
            </span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
