"use client";

interface ViccariLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 32, textHeight: 14 },
  md: { icon: 48, textHeight: 20 },
  lg: { icon: 64, textHeight: 28 },
};

export function ViccariLogo({ className = "", showText = true, size = "md" }: ViccariLogoProps) {
  const { icon } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Símbolo: espiral de 4 pétalas */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#771FE3" />
            <stop offset="100%" stopColor="#8F68C1" />
          </linearGradient>
        </defs>
        {/* Pétala superior */}
        <ellipse
          cx="32"
          cy="18"
          rx="10"
          ry="16"
          fill="url(#logoGrad)"
          transform="rotate(0 32 32)"
        />
        {/* Pétala direita */}
        <ellipse
          cx="46"
          cy="32"
          rx="10"
          ry="16"
          fill="url(#logoGrad)"
          transform="rotate(90 32 32)"
        />
        {/* Pétala inferior */}
        <ellipse
          cx="32"
          cy="46"
          rx="10"
          ry="16"
          fill="url(#logoGrad)"
          transform="rotate(180 32 32)"
        />
        {/* Pétala esquerda */}
        <ellipse
          cx="18"
          cy="32"
          rx="10"
          ry="16"
          fill="url(#logoGrad)"
          transform="rotate(270 32 32)"
        />
        {/* Centro */}
        <circle cx="32" cy="32" r="8" fill="#000000" />
        <circle cx="32" cy="32" r="4" fill="url(#logoGrad)" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-black tracking-widest text-white uppercase"
            style={{ fontSize: sizes[size].textHeight, letterSpacing: "0.15em" }}
          >
            VICCARI
          </span>
          <span
            className="text-[#8F68C1] font-light tracking-[0.25em] uppercase"
            style={{ fontSize: sizes[size].textHeight * 0.55 }}
          >
            ADS LTDA.
          </span>
        </div>
      )}
    </div>
  );
}
