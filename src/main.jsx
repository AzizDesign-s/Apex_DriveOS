import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ── Apply saved theme before first render ──────────────────────────────────
// Without this, there's a flash of dark theme even if the user saved 'light'
const savedStore = localStorage.getItem("apex-driveos-store");
if (savedStore) {
  try {
    const { state } = JSON.parse(savedStore);
    if (state?.theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  } catch {
    document.documentElement.classList.add("dark");
  }
} else {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
