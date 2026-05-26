import Image from "next/image";

interface ViccariLogoProps {
  variant?: "gradient" | "solid";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const heights: Record<string, number> = { sm: 32, md: 44, lg: 56 };

export function ViccariLogo({ variant = "gradient", size = "md", className = "" }: ViccariLogoProps) {
  const h = heights[size];
  const src = variant === "gradient" ? "/logo-gradient.png" : "/logo-solid.png";

  return (
    <Image
      src={src}
      alt="Viccari Ads"
      height={h}
      width={200}
      style={{ height: h, width: "auto" }}
      className={`object-contain object-left ${className}`}
      priority
    />
  );
}
