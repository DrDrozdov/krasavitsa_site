import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonTone = "primary" | "secondary" | "ghost";

const tones: Record<ButtonTone, string> = {
  primary:
    "brand-action bg-[var(--color-bordeaux)] text-white shadow-[var(--shadow-card)]",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-glass-strong)] text-[var(--color-text)] shadow-[var(--shadow-card)] backdrop-blur-2xl hover:border-[var(--color-border-strong)] hover:bg-white/86",
  ghost: "text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
};

const base =
  "apple-glass-button inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-strong)]";

type CommonProps = {
  children: ReactNode;
  className?: string;
  tone?: ButtonTone;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({ children, className, tone = "primary", ...props }: ButtonProps) {
  return (
    <button className={cn(base, tones[tone], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  tone = "primary",
  href,
  ...props
}: LinkButtonProps) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        className={cn(base, tones[tone], className)}
        href={href}
        rel="noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={cn(base, tones[tone], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
