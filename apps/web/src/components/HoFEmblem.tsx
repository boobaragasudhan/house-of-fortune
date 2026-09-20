import React from 'react';

interface HoFEmblemProps {
  size?: number;
  className?: string;
  animate?: boolean;
  glowIntensity?: number; // 0-1
}

export const HoFEmblem: React.FC<HoFEmblemProps> = ({
  size = 120,
  className = '',
  animate = false,
  glowIntensity = 0.6,
}) => {
  const id = React.useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Gold gradient */}
        <linearGradient id={`gold-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6A3" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="60%" stopColor="#B8860B" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        {/* Dark gold for depth */}
        <linearGradient id={`darkgold-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8B6914" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={4 * glowIntensity} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Outer glow */}
        <filter id={`outerGlow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={8 * glowIntensity} result="blur" />
          <feFlood floodColor="#D4AF37" floodOpacity={0.4 * glowIntensity} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Animated stroke dash for reveal */}
        {animate && (
          <style>{`
            .emblem-stroke-animate-${id} {
              stroke-dasharray: 1200;
              stroke-dashoffset: 1200;
              animation: emblemDraw-${id} 2.5s ease-out forwards;
            }
            @keyframes emblemDraw-${id} {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        )}
      </defs>

      {/* Outer circle — fortune wheel border */}
      <circle
        cx="100"
        cy="100"
        r="92"
        stroke={`url(#gold-${id})`}
        strokeWidth="3"
        fill="none"
        filter={`url(#outerGlow-${id})`}
        className={animate ? `emblem-stroke-animate-${id}` : ''}
      />

      {/* Inner decorative circle */}
      <circle
        cx="100"
        cy="100"
        r="84"
        stroke={`url(#darkgold-${id})`}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />

      {/* Tick marks around the circle — fortune wheel feel */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const inner = 85;
        const outer = 91;
        return (
          <line
            key={i}
            x1={100 + inner * Math.cos(angle)}
            y1={100 + inner * Math.sin(angle)}
            x2={100 + outer * Math.cos(angle)}
            y2={100 + outer * Math.sin(angle)}
            stroke="#D4AF37"
            strokeWidth={i % 4 === 0 ? 2 : 0.8}
            opacity={i % 4 === 0 ? 0.9 : 0.4}
          />
        );
      })}

      {/* Crown — three points above the spade */}
      <g filter={`url(#glow-${id})`}>
        {/* Crown base */}
        <path
          d="M72 68 L80 50 L90 62 L100 42 L110 62 L120 50 L128 68 Z"
          fill={`url(#gold-${id})`}
          stroke="#8B6914"
          strokeWidth="0.5"
        />
        {/* Crown band */}
        <rect x="72" y="68" width="56" height="6" rx="1"
          fill={`url(#darkgold-${id})`}
          stroke="#8B6914"
          strokeWidth="0.5"
        />
        {/* Crown jewels */}
        <circle cx="88" cy="58" r="2.5" fill="#064D3A" stroke="#D4AF37" strokeWidth="0.5" />
        <circle cx="100" cy="48" r="3" fill="#8B1E1E" stroke="#D4AF37" strokeWidth="0.5" />
        <circle cx="112" cy="58" r="2.5" fill="#064D3A" stroke="#D4AF37" strokeWidth="0.5" />
      </g>

      {/* Spade shape */}
      <g filter={`url(#glow-${id})`}>
        <path
          d="M100 78
             C100 78, 62 100, 62 120
             C62 134, 74 142, 86 138
             C92 136, 96 130, 98 124
             L94 156 L106 156 L102 124
             C104 130, 108 136, 114 138
             C126 142, 138 134, 138 120
             C138 100, 100 78, 100 78Z"
          fill={`url(#gold-${id})`}
          stroke="#8B6914"
          strokeWidth="1"
        />
        {/* Inner spade detail — darker inset */}
        <path
          d="M100 86
             C100 86, 72 104, 72 119
             C72 129, 80 134, 88 131
             C93 129, 96 124, 98 118
             L96 146 L104 146 L102 118
             C104 124, 107 129, 112 131
             C120 134, 128 129, 128 119
             C128 104, 100 86, 100 86Z"
          fill="none"
          stroke="#F5E6A3"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </g>

      {/* HF monogram inside spade */}
      <text
        x="100"
        y="124"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Cinzel', serif"
        fontSize="18"
        fontWeight="700"
        fill="#090909"
        opacity="0.7"
      >
        HF
      </text>

      {/* Four corner suit symbols */}
      <text x="100" y="176" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#D4AF37" opacity="0.5">
        ♠ ♥ ♦ ♣
      </text>
    </svg>
  );
};
