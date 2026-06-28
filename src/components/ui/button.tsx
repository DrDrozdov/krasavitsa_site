import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonTone = "primary" | "secondary" | "ghost";

const tones: Record<ButtonTone, string> = {
  primary:
    "bg-[#1D1D1F] text-white shadow-[0_18px_45px_rgba(29,29,31,0.16)] hover:bg-[#333337]",
  secondary:
    "border border-[#ECECEC] bg-white text-[#1D1D1F] shadow-[0_14px_34px_rgba(29,29,31,0.06)] hover:border-[#FBC9D6] hover:bg-[#FCFAFB]",
  ghost: "text-[#1D1D1F] hover:bg-[#F6F2F4]",
};

const base =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F58CA8]";

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
