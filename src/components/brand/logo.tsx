import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "symbol";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
}

const VARIANT_CONFIG: Record<LogoVariant, { src: string; width: number; height: number; alt: string }> = {
  full: {
    src: "/brand/mesmer-logo.png",
    width: 2531,
    height: 925,
    alt: "MESMER Mesleki Yeterlilik Belgelendirme Merkezi A.Ş.",
  },
  symbol: {
    src: "/brand/mesmer-symbol.png",
    width: 1114,
    height: 1114,
    alt: "MESMER MYM",
  },
};

/**
 * MESMER logosu şu an yalnızca beyaz zeminli orijinal dosyadan üretildi (bkz.
 * CLAUDE.md "Kurumsal Kimlik / Bilinen Kısıtlar"). Gerçek beyaz/SVG varyant
 * sağlanana kadar koyu zeminlerde okunabilirlik için beyaz bir kart içine
 * yerleştiriyoruz; logo piksellerine dokunmuyoruz.
 */
export function Logo({ variant = "full", className, priority }: LogoProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-white p-1.5 dark:shadow-sm",
        className,
      )}
    >
      <Image
        src={config.src}
        alt={config.alt}
        width={config.width}
        height={config.height}
        priority={priority}
        className={cn(variant === "full" ? "h-8 w-auto" : "h-8 w-8", "object-contain")}
      />
    </span>
  );
}
