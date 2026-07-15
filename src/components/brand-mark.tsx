import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  priority = false,
  label,
}: {
  className?: string;
  priority?: boolean;
  label?: string;
}) {
  return (
    <span className={cn("krasavitsa-brand-mark", className)}>
      <Image
        src="/krasavitsa-lotus-logo.png"
        alt={label ?? ""}
        fill
        priority={priority}
        sizes="(min-width: 768px) 96px, 72px"
      />
    </span>
  );
}
