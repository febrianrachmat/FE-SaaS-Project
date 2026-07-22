import Link from "next/link";
import { cn } from "@/shared/lib/utils";
import { APP_NAME } from "@/config/env";

type BrandLogoProps = {
  variant?: "full" | "icon";
  href?: string | null;
  className?: string;
  /** Pixel height of the rendered logo */
  height?: number;
  priority?: boolean;
};

const LOGO_VERSION = "20260722b";

/** Native aspect of cropped logo-full.png (787×254) */
const FULL_ASPECT = 787 / 254;

export function BrandLogo({
  variant = "full",
  href = "/",
  className,
  height = 28,
  priority = false,
}: BrandLogoProps) {
  const isIcon = variant === "icon";
  const width = isIcon ? height : Math.round(height * FULL_ASPECT);
  const src = isIcon
    ? `/brand/logo-icon.png?v=${LOGO_VERSION}`
    : `/brand/logo-full.png?v=${LOGO_VERSION}`;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={APP_NAME}
      width={width}
      height={height}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      className={cn("block object-contain", className)}
      style={{ height, width: "auto" }}
    />
  );

  if (href === null) return image;

  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label={APP_NAME}
    >
      {image}
    </Link>
  );
}
