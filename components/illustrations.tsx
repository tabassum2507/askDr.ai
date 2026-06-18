interface IllustrationProps {
  className?: string;
}

export function HeroIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Background circle */}
      <circle cx="100" cy="90" r="72" fill="#CCFBF1" />
      {/* Stethoscope body */}
      <path d="M70 60 Q68 90 80 105 Q92 118 100 118 Q108 118 120 105 Q132 90 130 60" stroke="#0D9488" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Stethoscope head */}
      <circle cx="100" cy="124" r="10" fill="#0D9488" />
      <circle cx="100" cy="124" r="6" fill="#5EEAD4" />
      {/* Ear pieces */}
      <circle cx="70" cy="58" r="5" fill="#0D9488" />
      <circle cx="130" cy="58" r="5" fill="#0D9488" />
      {/* Pulse line */}
      <polyline points="54,90 66,90 72,75 80,108 88,82 96,90 146,90" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Sparkles */}
      <circle cx="150" cy="55" r="3" fill="#5EEAD4" />
      <circle cx="160" cy="70" r="2" fill="#A7F3D0" />
      <circle cx="45" cy="110" r="2.5" fill="#5EEAD4" />
      <circle cx="38" cy="72" r="2" fill="#A7F3D0" />
    </svg>
  );
}

export function HomeRemediesIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Cup body */}
      <path d="M68 72 L72 130 Q72 136 80 136 L120 136 Q128 136 128 130 L132 72 Z" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="2" />
      {/* Cup handle */}
      <path d="M132 85 Q148 85 148 100 Q148 115 132 115" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Saucer */}
      <ellipse cx="100" cy="138" rx="44" ry="7" fill="#A7F3D0" />
      {/* Steam */}
      <path d="M88 62 Q84 52 88 42 Q92 32 88 22" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M100 58 Q96 48 100 38 Q104 28 100 18" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M112 62 Q108 52 112 42 Q116 32 112 22" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Leaf decorations */}
      <ellipse cx="62" cy="100" rx="10" ry="5" transform="rotate(-40 62 100)" fill="#34D399" />
      <ellipse cx="140" cy="95" rx="9" ry="4" transform="rotate(40 140 95)" fill="#34D399" />
      <ellipse cx="60" cy="112" rx="8" ry="4" transform="rotate(-20 60 112)" fill="#6EE7B7" />
    </svg>
  );
}

export function MentalHealthIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Head silhouette */}
      <ellipse cx="100" cy="82" rx="50" ry="56" fill="#CCFBF1" />
      {/* Neck */}
      <rect x="88" y="130" width="24" height="18" rx="6" fill="#CCFBF1" />
      {/* Inner glow */}
      <ellipse cx="100" cy="78" rx="34" ry="38" fill="#F0FDFA" />
      {/* Brain curves */}
      <path d="M80 72 Q82 62 90 65 Q95 60 100 65 Q106 60 112 65 Q118 62 120 72" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M76 85 Q76 75 80 72" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M124 85 Q124 75 120 72" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M76 85 Q74 96 82 100 Q90 104 100 102 Q110 104 118 100 Q126 96 124 85" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M100 65 L100 102" stroke="#5EEAD4" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="3 3" />
      {/* Stars */}
      <circle cx="88" cy="50" r="3" fill="#5EEAD4" />
      <circle cx="112" cy="46" r="2.5" fill="#5EEAD4" />
      <circle cx="145" cy="68" r="3" fill="#A7F3D0" />
      <circle cx="150" cy="84" r="2" fill="#5EEAD4" />
      <circle cx="55" cy="72" r="2.5" fill="#A7F3D0" />
      <circle cx="50" cy="90" r="2" fill="#5EEAD4" />
    </svg>
  );
}

export function ReportAssistanceIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Document */}
      <rect x="42" y="20" width="96" height="122" rx="8" fill="white" stroke="#5EEAD4" strokeWidth="2" />
      {/* Dog ear */}
      <path d="M122 20 L138 36 L122 36 Z" fill="#CCFBF1" />
      {/* Lines */}
      <line x1="58" y1="55" x2="122" y2="55" stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="68" x2="118" y2="68" stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="81" x2="104" y2="81" stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round" />
      {/* Bar chart */}
      <rect x="58" y="102" width="12" height="28" rx="2" fill="#5EEAD4" />
      <rect x="76" y="90" width="12" height="40" rx="2" fill="#0D9488" />
      <rect x="94" y="96" width="12" height="34" rx="2" fill="#5EEAD4" />
      <rect x="112" y="84" width="12" height="46" rx="2" fill="#14B8A6" />
      {/* Magnifying glass */}
      <circle cx="148" cy="108" r="20" fill="#F0FDFA" stroke="#0D9488" strokeWidth="3" />
      <circle cx="148" cy="108" r="13" fill="white" stroke="#5EEAD4" strokeWidth="2" />
      <line x1="162" y1="122" x2="172" y2="132" stroke="#0D9488" strokeWidth="4" strokeLinecap="round" />
      {/* Checkmark in magnifier */}
      <polyline points="141,108 146,114 156,102" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function MedicinesIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Pill bottle */}
      <rect x="62" y="50" width="52" height="88" rx="8" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="2" />
      {/* Bottle cap */}
      <rect x="56" y="36" width="64" height="22" rx="6" fill="#0D9488" />
      <rect x="62" y="50" width="52" height="16" fill="#5EEAD4" />
      {/* Label */}
      <rect x="68" y="76" width="40" height="44" rx="4" fill="white" stroke="#A7F3D0" strokeWidth="1.5" />
      {/* Cross on label */}
      <line x1="88" y1="86" x2="88" y2="110" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
      <line x1="76" y1="98" x2="100" y2="98" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
      {/* Capsule pills floating */}
      <rect x="128" y="58" width="36" height="16" rx="8" fill="#5EEAD4" />
      <rect x="146" y="58" width="18" height="16" rx="8" fill="#0D9488" />
      <rect x="130" y="90" width="32" height="14" rx="7" fill="#A7F3D0" />
      <rect x="146" y="90" width="16" height="14" rx="7" fill="#34D399" />
      {/* Small round pills */}
      <circle cx="138" cy="120" r="7" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="1.5" />
      <circle cx="152" cy="120" r="7" fill="#F0FDFA" stroke="#5EEAD4" strokeWidth="1.5" />
    </svg>
  );
}

export function FemaleHealthIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Heart */}
      <path d="M100 128 L46 80 Q32 60 50 46 Q66 32 82 48 L100 66 L118 48 Q134 32 150 46 Q168 60 154 80 Z" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
      {/* Inner heart glow */}
      <path d="M100 116 L60 84 Q50 70 62 60 Q72 50 84 62 L100 78 L116 62 Q128 50 138 60 Q150 70 140 84 Z" fill="#FDF2F8" />
      {/* Flower center */}
      <circle cx="100" cy="90" r="12" fill="#F9A8D4" />
      <circle cx="100" cy="90" r="7" fill="#EC4899" opacity="0.7" />
      {/* Petal accents */}
      <circle cx="100" cy="55" r="5" fill="#FBCFE8" />
      <circle cx="100" cy="125" r="4" fill="#FBCFE8" />
      <circle cx="66" cy="90" r="4" fill="#FBCFE8" />
      <circle cx="134" cy="90" r="4" fill="#FBCFE8" />
      {/* Sparkles */}
      <circle cx="54" cy="54" r="3" fill="#5EEAD4" />
      <circle cx="148" cy="52" r="2.5" fill="#5EEAD4" />
      <circle cx="44" cy="100" r="2" fill="#A7F3D0" />
      <circle cx="156" cy="106" r="2" fill="#A7F3D0" />
    </svg>
  );
}

export function BasicHealthIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Shield */}
      <path d="M100 20 L152 42 L152 90 Q152 130 100 148 Q48 130 48 90 L48 42 Z" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="2.5" />
      {/* Shield inner */}
      <path d="M100 34 L140 52 L140 90 Q140 122 100 136 Q60 122 60 90 L60 52 Z" fill="#F0FDFA" />
      {/* Heartbeat line */}
      <polyline points="66,88 78,88 86,68 94,108 102,80 110,88 134,88" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Stars */}
      <circle cx="152" cy="28" r="3" fill="#5EEAD4" />
      <circle cx="164" cy="44" r="2" fill="#A7F3D0" />
      <circle cx="46" cy="32" r="2.5" fill="#5EEAD4" />
      <circle cx="38" cy="52" r="2" fill="#A7F3D0" />
    </svg>
  );
}

export function DietIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Bowl */}
      <path d="M44 90 Q44 140 100 140 Q156 140 156 90 Z" fill="#CCFBF1" stroke="#5EEAD4" strokeWidth="2" />
      {/* Bowl rim */}
      <ellipse cx="100" cy="90" rx="56" ry="12" fill="white" stroke="#5EEAD4" strokeWidth="2" />
      {/* Food items */}
      {/* Broccoli */}
      <circle cx="80" cy="82" r="10" fill="#34D399" />
      <circle cx="72" cy="76" r="8" fill="#10B981" />
      <circle cx="88" cy="75" r="9" fill="#34D399" />
      <rect x="78" y="86" width="4" height="10" rx="2" fill="#6EE7B7" />
      {/* Carrot */}
      <path d="M106 88 L118 72 L122 76 L110 90 Z" fill="#FB923C" />
      <path d="M118 72 Q122 66 120 68 Q124 62 122 66 Q126 60 124 64" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Tomato */}
      <circle cx="130" cy="84" r="10" fill="#F87171" />
      <path d="M128 74 Q130 70 132 74" stroke="#34D399" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Fork */}
      <line x1="170" y1="40" x2="170" y2="110" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round" />
      <line x1="164" y1="40" x2="164" y2="62" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="170" y1="40" x2="170" y2="62" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="176" y1="40" x2="176" y2="62" stroke="#5EEAD4" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M164 62 Q168 70 170 72 Q172 70 176 62" stroke="#5EEAD4" strokeWidth="2" fill="none" />
      {/* Small sparkle */}
      <circle cx="40" cy="68" r="3" fill="#5EEAD4" />
      <circle cx="32" cy="82" r="2" fill="#A7F3D0" />
    </svg>
  );
}

export function CancerHealthIllustration({ className }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Ribbon loop top-left */}
      <path d="M100 52 Q72 32 56 50 Q44 66 64 80 L100 104" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
      {/* Ribbon loop top-right */}
      <path d="M100 52 Q128 32 144 50 Q156 66 136 80 L100 104" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
      {/* Ribbon tail left */}
      <path d="M100 104 L82 132 Q78 138 74 134 L88 110" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
      {/* Ribbon tail right */}
      <path d="M100 104 L118 132 Q122 138 126 134 L112 110" fill="#FBCFE8" stroke="#F472B6" strokeWidth="2" />
      {/* Center knot */}
      <ellipse cx="100" cy="104" rx="10" ry="8" fill="#F9A8D4" stroke="#EC4899" strokeWidth="1.5" />
      {/* Hope text area */}
      <circle cx="100" cy="78" r="16" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="1.5" />
      {/* Heart inside */}
      <path d="M100 86 L92 79 Q88 74 92 70 Q96 66 100 72 Q104 66 108 70 Q112 74 108 79 Z" fill="#F472B6" />
      {/* Stars */}
      <circle cx="50" cy="50" r="3" fill="#5EEAD4" />
      <circle cx="40" cy="70" r="2" fill="#A7F3D0" />
      <circle cx="150" cy="48" r="3" fill="#5EEAD4" />
      <circle cx="162" cy="66" r="2" fill="#A7F3D0" />
      <circle cx="44" cy="110" r="2.5" fill="#5EEAD4" />
      <circle cx="156" cy="112" r="2" fill="#A7F3D0" />
    </svg>
  );
}
