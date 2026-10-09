import React from 'react';
import { useApp } from '../context/AppContext';

interface NoorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const NoorLogo: React.FC<NoorLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const { businessProfile } = useApp();

  // If user uploaded or specified an external custom logo image URL, display it
  if (businessProfile?.logoUrl) {
    return (
      <div className={`relative flex items-center gap-2.5 ${className}`}>
        <img
          src={businessProfile.logoUrl}
          alt={businessProfile.businessName}
          className={`object-contain rounded-xl ${
            size === 'sm'
              ? 'w-8 h-8'
              : size === 'md'
              ? 'w-10 h-10'
              : size === 'lg'
              ? 'w-14 h-14'
              : 'w-20 h-20'
          }`}
        />
        {showText && (
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
              {businessProfile.businessName}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Tours & Bike Rentals Kandy
            </span>
          </div>
        )}
      </div>
    );
  }

  // Size styling for the vector emblem
  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 52, height: 52 },
    lg: { width: 76, height: 76 },
    xl: { width: 104, height: 104 },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* High-Fidelity Vector Emblem of the Uploaded Tuk-Tuk & Sri Lanka Badge with NOOR TOURS KANDY */}
      <div
        className="relative shrink-0 rounded-2xl overflow-hidden shadow-xl border border-amber-500/30 bg-gradient-to-b from-[#141b26] to-[#090d14] p-1 flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Badge Dark Background */}
          <rect width="200" height="200" rx="30" fill="#0A0F17" />
          
          {/* Sunset Sky Circular Gradient */}
          <circle cx="100" cy="80" r="54" fill="url(#sunsetGrad)" />
          
          {/* Sunset Horizon Stripes */}
          <g opacity="0.35" stroke="#FFF59D" strokeWidth="2.5">
            <line x1="55" y1="58" x2="145" y2="58" />
            <line x1="50" y1="68" x2="150" y2="68" />
            <line x1="48" y1="78" x2="152" y2="78" />
            <line x1="50" y1="88" x2="150" y2="88" />
          </g>

          {/* Golden Sun Disk */}
          <circle cx="100" cy="65" r="24" fill="#FFCA28" />

          {/* Tropical Palm Tree (Left) */}
          <path
            d="M62 92 C 60 72, 45 68, 36 66 C 46 66, 56 70, 60 75 C 56 63, 47 58, 38 56 C 48 58, 58 64, 62 70 C 65 58, 68 53, 76 50 C 71 56, 68 64, 66 71 C 74 63, 84 62, 90 64 C 82 68, 73 72, 66 76 C 65 83, 63 90, 64 94 Z"
            fill="#1B5E20"
          />
          {/* Palm Trunk */}
          <path d="M63 74 Q 67 84 64 96" stroke="#4E342E" strokeWidth="3.5" strokeLinecap="round" />

          {/* Historic Kandy Temple & Pagoda Stupa Silhouettes (Right) */}
          <path
            d="M136 94 L 140 74 L 142 58 L 144 46 L 145 46 L 147 58 L 149 74 L 153 94 Z"
            fill="#880E4F"
            opacity="0.85"
          />
          <path
            d="M152 94 L 155 78 L 157 66 L 158 66 L 160 78 L 163 94 Z"
            fill="#4A148C"
            opacity="0.75"
          />

          {/* Sri Lankan Green & Yellow Tuk-Tuk Auto-Rickshaw (Centerpiece) */}
          <g id="tuktuk">
            {/* Tuk-Tuk Cast Shadow */}
            <ellipse cx="100" cy="118" rx="36" ry="5.5" fill="#000000" opacity="0.65" />

            {/* Black Curved Roof Canopy */}
            <path
              d="M74 84 C 74 76, 84 72, 100 72 C 116 72, 126 76, 126 84 L 124 90 L 76 90 Z"
              fill="#1E232A"
            />
            {/* Canopy Highlights */}
            <path d="M78 78 Q 100 73 122 78" stroke="#455A64" strokeWidth="1.5" fill="none" />

            {/* Windshield */}
            <path
              d="M77 90 L 81 101 L 119 101 L 123 90 Z"
              fill="#81D4FA"
              stroke="#212121"
              strokeWidth="1.8"
            />
            <path d="M84 92 L 81 99 L 94 92 Z" fill="#E1F5FE" opacity="0.6" />

            {/* Yellow / Golden Mid Panel */}
            <rect x="75" y="101" width="50" height="6.5" fill="#FFC107" stroke="#212121" strokeWidth="1.5" />

            {/* Green Main Body Shell */}
            <path
              d="M73 107.5 L 75 119 C 75 122, 82 123, 100 123 C 118 123, 125 122, 125 119 L 127 107.5 Z"
              fill="#2E7D32"
              stroke="#1B5E20"
              strokeWidth="2"
            />

            {/* Chrome Round Headlight */}
            <circle cx="100" cy="112" r="5" fill="#FFF9C4" stroke="#37474F" strokeWidth="1.5" />
            <circle cx="100" cy="112" r="2.5" fill="#FFFFFF" />

            {/* Front Wheel & Mudguard */}
            <rect x="96.5" y="119" width="7" height="6" rx="2" fill="#212121" />
            {/* Rear Wheels */}
            <circle cx="78" cy="118" r="4.5" fill="#212121" />
            <circle cx="78" cy="118" r="1.8" fill="#B0BEC5" />
            <circle cx="122" cy="118" r="4.5" fill="#212121" />
            <circle cx="122" cy="118" r="1.8" fill="#B0BEC5" />
          </g>

          {/* Vintage Bicycle Silhouette (Right of Tuk-Tuk) */}
          <circle cx="140" cy="115" r="4" stroke="#FFA726" strokeWidth="1" fill="none" opacity="0.8" />
          <circle cx="149" cy="115" r="4" stroke="#FFA726" strokeWidth="1" fill="none" opacity="0.8" />
          <path d="M140 115 L 145 110 L 149 115 M 145 110 L 143 106 M 145 110 L 147 110" stroke="#FFA726" strokeWidth="1" opacity="0.8" />

          {/* "SRI LANKA" Ribbon Emblem Badge */}
          <path
            d="M48 130 L 152 130 L 145 142 L 100 144 L 55 142 Z"
            fill="#B71C1C"
            stroke="#FFE082"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="139.5"
            textAnchor="middle"
            fill="#FFFDE7"
            fontFamily="Arial Black, Impact, sans-serif"
            fontWeight="900"
            fontSize="9"
            letterSpacing="2"
          >
            SRI LANKA
          </text>

          {/* NOOR Bold Typography with Palm Icon Silhouette */}
          <g>
            <text
              x="100"
              y="172"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="Impact, Arial Black, sans-serif"
              fontWeight="900"
              fontSize="28"
              letterSpacing="3"
            >
              NOOR
            </text>
            {/* Little palm overlay on NOOR */}
            <path
              d="M124 158 C 122 153, 118 152, 115 152 C 119 154, 122 156, 124 161 C 125 154, 128 152, 131 151 C 128 154, 126 157, 125 161 Z"
              fill="#00E676"
            />
          </g>

          {/* Subtitle: TOURS KANDY matching uploaded logo */}
          <text
            x="100"
            y="188"
            textAnchor="middle"
            fill="#FFCA28"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="8"
            letterSpacing="3.5"
          >
            TOURS KANDY
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="sunsetGrad" x1="100" y1="26" x2="100" y2="134" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E64A19" />
              <stop offset="0.45" stopColor="#FB8C00" />
              <stop offset="1" stopColor="#FDD835" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white font-mono">
              NOOR
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60 uppercase">
              Kandy
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Bike Rentals &amp; Tours Kandy
          </span>
        </div>
      )}
    </div>
  );
};
