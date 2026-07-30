import type { Metadata } from "next";
import { BeautyPageShell } from "@/components/portal-components";
import { AboutExperience } from "./about-experience";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "О проекте | Красавица",
  description:
    "Зачем существует Красавица и как контекст, проверка и объяснение превращают beauty-запрос в понятный персональный сценарий.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <BeautyPageShell className={styles.root}>
      <AboutExperience />
    </BeautyPageShell>
  );
}
