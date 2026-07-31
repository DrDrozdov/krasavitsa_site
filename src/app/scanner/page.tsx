import type { Metadata } from "next";
import { InciScanner } from "@/components/inci-scanner";
import { BeautyPageShell } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "Сканер состава | Красавица",
  description: "Разберите список ингредиентов по функциям и активам, проверьте сочетания с текущим уходом и сохраните результат в Beauty ID.",
  alternates: { canonical: "/scanner" },
};

export default function ScannerPage() {
  return (
    <BeautyPageShell>
      <InciScanner />
    </BeautyPageShell>
  );
}
