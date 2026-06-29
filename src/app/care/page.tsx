import type { Metadata } from "next";
import { BeautyPageShell, PageHero, PortalPanel, BeautyPortalGrid, SectionIntro, SoftCards, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "Подбор ухода — Красавица",
  description: "Подбор ухода без хаоса и случайных покупок: кожа, бюджет, задача и понятное объяснение каждого средства.",
  alternates: { canonical: "/care" },
};

export default function CarePage() {
  const categories = ["Лицо", "Волосы", "Тело", "Акне", "Anti-age", "Чувствительная кожа", "Восстановление барьера", "SPF и защита"];
  const examples = [
    ["Жирный блеск", "Мягкое очищение, легкий крем-гель, SPF с матовым финишем."],
    ["Сухость", "Крем с липидами, бережное умывание и пауза в активных средствах."],
    ["Покраснения", "Минимальный уход без отдушек и поддержка защитного барьера."],
  ];
  const faq = [
    ["Это заменяет косметолога?", "Нет. Красавица помогает ориентироваться в уходе, но не ставит диагнозы и не заменяет врача."],
    ["Можно указать бюджет?", "Да. Бюджет — один из главных параметров, чтобы подбор не превращался в лишние покупки."],
    ["Можно исключить ингредиенты?", "Да. В запросе можно указать отдушки, кислоты, ретиноиды, бренды или текстуры, которые не подходят."],
  ];

  return (
    <BeautyPageShell>
      <PageHero
        eyebrow="Подбор ухода"
        title="Подбор ухода без хаоса и случайных покупок"
        subtitle="Расскажите о коже, бюджете и задаче — Красавица поможет собрать понятный уход и объяснит, зачем нужен каждый шаг."
        tiles={["Лицо", "Бюджет", "Состав", "Объяснение"]}
      />
      <SectionIntro kicker="Категории" title="Выберите задачу, с которой хотите начать" text="Подбор можно собрать для базового ухода, восстановления барьера, SPF, акне, волос и тела." />
      <div className="mx-auto grid max-w-[1480px] gap-2 px-3 pb-2 md:grid-cols-4 md:px-5">
        {categories.map((item) => (
          <div key={item} className="apple-glass-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-glass)] p-5 text-xl font-black shadow-[var(--shadow-card)] backdrop-blur-2xl">
            {item}
          </div>
        ))}
      </div>
      <div className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Мини-форма</p>
            <h2 className="mt-4 text-[clamp(2.4rem,4.6vw,4.8rem)] font-black leading-none">Запрос для Красавицы</h2>
            <p className="mt-5 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
              Чтобы получить персональный подбор, продолжите в Telegram — там Красавица задаст пару уточняющих вопросов и сохранит рекомендации.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid gap-3 md:grid-cols-2">
              {["Что вас беспокоит?", "Тип кожи", "Бюджет", "Что уже используете?", "Нежелательные бренды / ингредиенты"].map((field) => (
                <div key={field} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/56 p-4 font-semibold text-[var(--color-text-muted)]">
                  {field}
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </div>
      <SoftCards
        items={[
          { title: "Пример рекомендации", text: "Очищение, базовый крем, SPF и точечный актив собираются в понятную последовательность." },
          { title: "Как формируется подбор", text: "Красавица учитывает бюджет, чувствительность, текущий уход и цель, а затем объясняет каждую карточку." },
          { title: "Без лишнего давления", text: "Сервис не заставляет покупать все сразу и помогает понять приоритеты." },
        ]}
      />
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5" image="/beauty-products-portal.png">
            <div className="flex min-h-[420px] flex-col justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Примеры</p>
                <h2 className="mt-4 text-[clamp(2.25rem,4vw,4.4rem)] font-black leading-none">Один запрос — понятная схема</h2>
              </div>
              <p className="max-w-lg text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                Результат должен объяснять не только что купить, но и почему это место в уходе важно именно сейчас.
              </p>
            </div>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid h-full gap-3">
              {examples.map(([title, text], index) => (
                <div key={title} className="apple-glass-card rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-5 backdrop-blur-2xl">
                  <p className="text-xs font-black text-[var(--color-text-soft)]">0{index + 1}</p>
                  <h3 className="mt-2 text-2xl font-black">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-4">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">FAQ</p>
            <h2 className="mt-4 text-[clamp(2.2rem,3.8vw,4rem)] font-black leading-none">Перед первым подбором</h2>
          </PortalPanel>
          <PortalPanel className="md:col-span-8">
            <div className="grid gap-2">
              {faq.map(([question, answer]) => (
                <details key={question} className="group rounded-[var(--radius-md)] border border-white/60 bg-white/42 p-4 backdrop-blur-2xl">
                  <summary className="cursor-pointer text-lg font-black">{question}</summary>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{answer}</p>
                </details>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>
      <TelegramCTA />
    </BeautyPageShell>
  );
}
