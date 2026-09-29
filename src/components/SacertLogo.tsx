import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  inverted?: boolean;
  customLogoUrl?: string;
}

export const SacertLogo: React.FC<LogoProps> = ({
  size = 48,
  className = '',
  showText = false,
  inverted = false,
  customLogoUrl,
}) => {
  const [logoSrc, setLogoSrc] = useState<string | undefined>(customLogoUrl);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (customLogoUrl !== undefined) {
      setLogoSrc(customLogoUrl);
      setImgError(false);
      return;
    }

    const checkLogo = () => {
      const settings = db.getSettings();
      setLogoSrc(settings.organizationLogo);
      setImgError(false);
    };

    checkLogo();
    const unsub = db.subscribe(checkLogo);
    return () => unsub();
  }, [customLogoUrl]);

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {logoSrc && !imgError ? (
        <img
          src={logoSrc}
          alt="SACERT Official Logo"
          width={size}
          height={size}
          onError={() => setImgError(true)}
          className="rounded-full object-contain shrink-0 shadow-xs border border-amber-400/40 bg-white"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Outer Circular Ring */}
          <circle cx="60" cy="60" r="58" fill="#1565C0" stroke="#C62828" strokeWidth="4" />
          <circle cx="60" cy="60" r="52" fill="#0D1B2A" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Central Shield */}
          <path
            d="M60 16 L88 28 C88 56 76 86 60 98 C44 86 32 56 32 28 Z"
            fill="#C62828"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />

          {/* Shield Half-tone for Depth */}
          <path d="M60 16 L88 28 C88 56 76 86 60 98 Z" fill="#B71C1C" />

          {/* Blue inner crest */}
          <path
            d="M60 26 L80 34 C80 54 70 76 60 84 C50 76 40 54 40 34 Z"
            fill="#1565C0"
            stroke="#FFD54F"
            strokeWidth="1.5"
          />

          {/* Star of Life (EMS / Rescue) */}
          <rect x="56" y="38" width="8" height="34" rx="2" fill="#FFFFFF" />
          <rect x="56" y="38" width="8" height="34" rx="2" fill="#FFFFFF" transform="rotate(60 60 55)" />
          <rect x="56" y="38" width="8" height="34" rx="2" fill="#FFFFFF" transform="rotate(-60 60 55)" />

          {/* Center Rod of Asclepius & Rescue Flame */}
          <circle cx="60" cy="55" r="4.5" fill="#FFC107" />
          <path
            d="M60 48 Q63 52 60 55 Q57 58 60 62"
            stroke="#C62828"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Laurel Wreath base */}
          <path
            d="M36 84 C42 96 52 102 60 103 C68 102 78 96 84 84"
            fill="none"
            stroke="#FFD54F"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Bottom Banner Ribbon */}
          <rect x="30" y="94" width="60" height="15" rx="3" fill="#B71C1C" stroke="#FFFFFF" strokeWidth="1" />
          <text
            x="60"
            y="105"
            fill="#FFFFFF"
            fontSize="8.5"
            fontWeight="800"
            letterSpacing="0.8px"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            SACERT
          </text>
        </svg>
      )}

      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-black tracking-tight text-sm sm:text-base leading-tight font-serif uppercase ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
          </span>
          <span
            className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
              inverted ? 'text-red-400' : 'text-red-700'
            }`}
          >
            Official First Responder Command
          </span>
        </div>
      )}
    </div>
  );
};
