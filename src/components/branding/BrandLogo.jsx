// src/components/branding/BrandLogo.jsx
//
// Theme-aware logo resolver. Reads the current theme from useAppStore
// and renders the correct asset automatically — no manual switching
// required anywhere it's used.
//
// Props:
//   brand:   'product' (Apex DriveOS, static default) |
//            'company' (AjiX Technologies, static) |
//            'product-current' (dynamic — checks for admin-uploaded
//             custom company logo first, falls back to 'product' if none
//             exists; wired up in Message 5, safe to use now since it
//             gracefully falls through when company.isCustomBranding
//             doesn't exist yet)
//   variant: 'icon' (compact mark, e.g. Sidebar/Navbar) |
//            'full' (full lockup with wordmark, e.g. Login/Splash)
//   className: standard className passthrough
//   alt: optional alt text override

import useAppStore from "../../store/useAppStore";
import apexIconLight from "../../assets/branding/apex-driveos-icon-light.svg";
import apexIconDark from "../../assets/branding/apex-driveos-icon-dark.svg";
import apexFullLight from "../../assets/branding/apex-driveos-full-light.svg";
import apexFullDark from "../../assets/branding/apex-driveos-full-dark.svg";
import ajixFullDark from "../../assets/branding/ajix-full-dark.svg";
import ajixFullLight from "../../assets/branding/ajix-full-light.svg";
import ajixIconLight from "../../assets/branding/ajix-icon-light.svg";
import ajixIconDark from "../../assets/branding/ajix-icon-dark.svg";

const LOGO_MAP = {
  product: {
    icon: {
      light: apexIconLight,
      dark: apexIconDark,
    },
    full: {
      light: apexFullLight,
      dark: apexFullDark,
    },
  },
  company: {
    icon: {
      dark: ajixIconDark,
      light: ajixIconLight,
    },
    full: {
      dark: ajixFullDark,
      light: ajixFullLight,
    },
  },
};

function BrandLogo({
  brand = "product",
  variant = "icon",
  className = "",
  alt,
}) {
  const theme = useAppStore((s) => s.theme);
  const company = useAppStore((s) => s.company); // undefined until Message 5 — handled safely below
  const mode = theme === "dark" ? "dark" : "light";

  // 'product-current' = dynamic resolution: custom logo if one is set,
  // otherwise falls through to the static 'product' (Apex DriveOS) asset.
  // Safe to use before Message 5 lands, since `company` will simply be
  // undefined and the condition below short-circuits to the static path.
  let resolvedBrand = brand;
  if (brand === "product-current") {
    if (company?.isCustomBranding && company?.logo) {
      return (
        <img
          src={company.logo}
          alt={alt || company.name || "Company Logo"}
          className={className}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      );
    }
    resolvedBrand = "product";
  }

  const src = LOGO_MAP[resolvedBrand]?.[variant]?.[mode];
  if (!src) return null;

  return (
    <img
      src={src}
      alt={
        alt ||
        (resolvedBrand === "product" ? "Apex DriveOS" : "AjiX Technologies")
      }
      className={className}
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
}

export default BrandLogo;
