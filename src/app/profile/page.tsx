import type { Metadata } from "next";
import { ProfileDemo } from "@/components/profile-demo";
import { BeautyPageShell } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "Профиль — Красавица",
  description: "Защищённый профиль Красавицы с регистрацией и аватаром.",
  alternates: { canonical: "/profile" },
};

export default function ProfilePage() {
  return <BeautyPageShell className="profile-motion-page"><ProfileDemo /></BeautyPageShell>;
}
