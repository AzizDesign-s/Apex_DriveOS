const CarIllustration = () => {
  return (
    <svg
      width="800"
      height="300"
      viewBox="0 0 800 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="400" cy="240" rx="260" ry="20" fill="#D1D5DB" />

      {/* Car Body */}
      <path
        d="M180 180
           L250 120
           C280 95 330 80 400 80
           L520 80
           C580 80 620 100 650 140
           L700 180
           L700 210
           L180 210
           Z"
        fill="#FFD500"
        stroke="#111827"
        strokeWidth="4"
      />

      {/* Hood */}
      <path
        d="M180 180
           L240 130
           L300 130
           L280 180
           Z"
        fill="#F4C400"
      />

      {/* Windows */}
      <path
        d="M290 120
           C320 100 350 95 400 95
           L510 95
           C545 95 575 110 600 140
           L320 140
           Z"
        fill="#1E293B"
      />

      {/* Window Divider */}
      <line
        x1="430"
        y1="95"
        x2="430"
        y2="140"
        stroke="#94A3B8"
        strokeWidth="3"
      />

      {/* BMW Kidney Grille */}
      <rect x="190" y="150" width="16" height="28" rx="6" fill="#111827" />
      <rect x="210" y="150" width="16" height="28" rx="6" fill="#111827" />

      {/* Headlight */}
      <path d="M225 145 L255 145 L245 160 L220 160 Z" fill="#E5E7EB" />

      {/* Tail Light */}
      <rect x="665" y="150" width="18" height="10" rx="3" fill="#EF4444" />

      {/* Door Line */}
      <line
        x1="420"
        y1="140"
        x2="420"
        y2="210"
        stroke="#111827"
        strokeWidth="2"
      />

      {/* Door Handle */}
      <rect x="450" y="150" width="22" height="4" rx="2" fill="#111827" />

      {/* Front Wheel */}
      <circle cx="280" cy="210" r="45" fill="#111827" />
      <circle cx="280" cy="210" r="28" fill="#9CA3AF" />
      <circle cx="280" cy="210" r="12" fill="#E5E7EB" />

      {/* Rear Wheel */}
      <circle cx="600" cy="210" r="45" fill="#111827" />
      <circle cx="600" cy="210" r="28" fill="#9CA3AF" />
      <circle cx="600" cy="210" r="12" fill="#E5E7EB" />

      {/* BMW Badge */}
      <circle cx="340" cy="110" r="10" fill="#2563EB" />
      <circle
        cx="340"
        cy="110"
        r="10"
        stroke="#111827"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
};

export default CarIllustration;
