import type { Metadata } from "next";
import { BeautyFinder } from "@/components/beauty-finder";
import { BeautyPageShell } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "AI-подбор — Красавица",
  description: "Единый AI-подбор ухода за кожей, волосами и парфюмерии с отдельными правилами для каждого направления.",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  return (
    <BeautyPageShell>
      <div className="pb-10 pt-8 md:pt-14">
        <BeautyFinder />
        <p className="mx-auto max-w-3xl px-6 text-center text-xs font-semibold leading-6 text-[var(--color-text-soft)]">
          Рекомендации носят информационный характер. При заболеваниях кожи, кожи головы, выраженном выпадении волос или аллергических реакциях обратитесь к врачу.
        </p>
      </div>
    </BeautyPageShell>
  );
}
