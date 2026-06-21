// src/components/ui/ToastConfig.jsx
//
// ─── WHY THIS FILE EXISTS ─────────────────────────────────────────────────────
// react-hot-toast lets us override the default white toast with our own styles.
// We create a <Toaster> component here with Apex DriveOS luxury dark styling.
// This file is imported ONCE in App.jsx so toasts work everywhere in the app.
// ─────────────────────────────────────────────────────────────────────────────

import { Toaster } from "react-hot-toast";

function ToastConfig() {
  return (
    <Toaster
      // Where toasts appear on screen
      position="top-right"
      // Gap between multiple stacked toasts
      gutter={10}
      toastOptions={{
        // How long each toast stays (ms)
        duration: 3500,

        // Base style applied to ALL toasts
        // This overrides react-hot-toast's default white box
        style: {
          background: "rgba(17, 24, 39, 0.95)", // card bg with slight transparency
          color: "#F9FAFB", // text-primary
          border: "1px solid #1E2D40", // our border color
          borderRadius: "14px",
          backdropFilter: "blur(16px)",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "13px",
          fontWeight: "500",
          padding: "14px 16px",
          maxWidth: "380px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
      }}
    />
  );
}

export default ToastConfig;
