// src/components/layout/SidebarFooterBrand.jsx
//
// Sprint 2.1 Message 7: compact "Powered by AjiX Technologies" footer
// for the Sidebar. Theme-aware via BrandLogo (company brand, icon variant —
// uses the cropped AjiX "N" mark files from Message 3).
//
// Collapses to icon-only when the sidebar itself is collapsed, matching
// the same sidebarOpen-driven pattern the rest of Sidebar.jsx already uses.

import BrandLogo from "../branding/BrandLogo";
import useAppStore from "../../store/useAppStore";

function SidebarFooterBrand() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="py-3 flex justify-center items-center flex-shrink-0 ">
      {sidebarOpen ? (
        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
          <BrandLogo
            brand="company"
            variant="icon"
            className="w-5 h-5 flex-shrink-0 object-contain"
          />
          <p className="text-[9px] text-text-subtle leading-tight truncate">
            Powered by{" "}
            <span className="font-semibold text-text-muted">
              AjiX Technologies
            </span>
          </p>
        </div>
      ) : (
        <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
          <BrandLogo
            brand="company"
            variant="icon"
            className="w-3.5 h-3.5 object-contain"
            alt="Powered by AjiX Technologies"
          />
        </div>
      )}
    </div>
  );
}

export default SidebarFooterBrand;
