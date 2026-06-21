import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "../branding/BrandLogo";

const SplashScreen = ({ onComplete }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-base flex flex-col items-center justify-center"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      // useEffect inside: auto-call onComplete after delay
      // We use onAnimationComplete on the inner logo instead
    >
      {/* ── Animated Logo Container ── */}
      <motion.div
        className="flex flex-col items-center gap-4"
        // ENTRY animation: scale up from small, fade in, slide up slightly
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        // When the entry animation completes, wait then trigger onComplete
        onAnimationComplete={() => {
          setTimeout(onComplete, 1800);
        }}
      >
        {/* ── Diamond Logo Shape ── */}
        {/*  clip-path: polygon turns a square div into a diamond shape      */}
        {/*  We use a CSS utility class for this — defined in index.css below */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <BrandLogo
            brand="product"
            variant="full"
            className="h-14 sm:h-16 object-contain"
          />
        </motion.div>

        {/* ── Brand Name ── */}
        {/* <motion.h1
          className="text-3xl font-black tracking-[0.3em] text-gold-gradient uppercase"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Apex DriveOS
        </motion.h1> */}

        {/* ── Tagline ── */}
        <motion.p
          className="text-[10px] tracking-[0.3em] text-text-subtle uppercase mt-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Luxury Automotive Management
        </motion.p>
      </motion.div>

      {/* ── Loading Progress Bar ── */}
      <motion.div
        className="mt-14 w-48 h-[2px] bg-border rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {/* Inner bar: animates from 0% to 100% width */}
        <motion.div
          className="h-full bg-gradient-to-r from-gold-dark via-gold to-gold-light"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
