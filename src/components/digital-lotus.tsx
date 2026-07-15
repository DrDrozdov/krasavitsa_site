import { cn } from "@/lib/utils";

export function DigitalLotus({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("digital-lotus", compact && "is-compact", className)} aria-hidden="true">
      <div className="digital-lotus-grid" />
      <div className="digital-lotus-halo halo-one" />
      <div className="digital-lotus-halo halo-two" />
      <div className="digital-lotus-bloom">
        <i className="lotus-petal petal-back-left" />
        <i className="lotus-petal petal-back-right" />
        <i className="lotus-petal petal-left" />
        <i className="lotus-petal petal-right" />
        <i className="lotus-petal petal-front-left" />
        <i className="lotus-petal petal-front-right" />
        <i className="lotus-petal petal-center" />
        <span className="digital-lotus-core"><b /></span>
      </div>
      <div className="digital-lotus-scan" />
      <span className="digital-lotus-index">K / 01</span>
      <span className="digital-lotus-status">BEAUTY INTELLIGENCE · LIVE</span>
    </div>
  );
}
