import type { SVGProps } from "react";
import Image from "next/image";

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/icono-indrhi.png"
        alt="INDRHI"
        width={32}
        height={32}
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
}
