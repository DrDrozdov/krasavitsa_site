import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, Brain, CheckCircle2, Globe2, MessageCircle, Music2, Rocket, Send, Sparkles, Star, UserRound } from "lucide-react";
import { BeautyPageShell, BeautyPortalGrid, PortalPanel, TelegramCTA } from "@/components/portal-components";

export const metadata: Metadata = {
  title: "О проекте - Красавица",
  description: "Красавица - AI-платформа для персонального подбора ухода за кожей, волосами и ароматов в одном интерфейсе.",
  alternates: { canonical: "/about" },
};

const socials = [
  { title: "Telegram-бот", href: "https://t.me/krasavitsa_ai_bot", Icon: Bot },
  { title: "Telegram-канал", href: "https://t.me/krasavitsa_ai", Icon: Send },
  { title: "TikTok", href: "https://www.tiktok.com/@krasavitsa_ai", Icon: Music2 },
  { title: "MAX", href: "https://max.ru/", Icon: MessageCircle },
];

const doneItems = [
  { title: "AI-подбор в Telegram", text: "Пользователь описывает задачу, бюджет и ограничения, а бот собирает понятную подборку.", Icon: Bot },
  { title: "Персональная логика", text: "Рекомендации учитывают тип кожи, цель ухода, формат средства и реальный запрос.", Icon: Brain },
  { title: "Оценка качества", text: "Реакции пользователей помогают постепенно отличать удачные рекомендации от случайных.", Icon: Star },
  { title: "Маркетплейсы", text: "В карточках появляются ссылки на крупные российские площадки, чтобы выбор был практичным.", Icon: Globe2 },
  { title: "Beauty Profile", text: "Профиль хранит предпочтения, историю, реакции и помогает не начинать подбор с нуля.", Icon: UserRound },
  { title: "Веб-платформа", text: "Сайт объединяет три режима AI-подбора, защищённый профиль, блог и аналитику.", Icon: Sparkles },
];

const focusItems = [
  "AI-анализ составов косметики",
  "Подбор парфюмерии по нотам, настроению и контексту",
  "Персональный рейтинг средств",
  "Единая экосистема для ухода, профиля и рекомендаций",
  "Интерфейс уровня современных AI-продуктов",
];

const timeline = [
  { date: "Апрель 2026", title: "Появилась идея", text: "Сделать подбор ухода личным, спокойным и независимым от рекламной витрины." },
  { date: "Май 2026", title: "Первый Telegram-бот", text: "Появился рабочий сценарий: запрос, уточнение, подбор и объяснение." },
  { date: "Июнь 2026", title: "Профиль и реакции", text: "Добавили оценку рекомендаций, основу beauty-профиля и логику доверия." },
  { date: "Лето 2026", title: "Веб-платформа", text: "Красавица выходит в формат сайта с поиском, блогом, профилем и roadmap." },
  { date: "Далее", title: "Полный AI-консультант", text: "Анализ составов, парфюм-модуль, мобильный продукт и единая система рекомендаций." },
];

export default function AboutPage() {
  return (
    <BeautyPageShell>
      <section className="px-3 pb-2 pt-5 md:px-5">
        <div className="about-hero liquid-glass relative overflow-hidden rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-white/28 p-3 shadow-[var(--shadow-soft)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.86),transparent_26rem),radial-gradient(circle_at_78%_12%,rgba(245,198,207,.34),transparent_24rem)]" />
          <div className="relative z-10 grid min-h-[720px] gap-3 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-white/55 bg-white/34 p-6 text-[var(--color-text)] shadow-[var(--shadow-card)] backdrop-blur-2xl md:p-8">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">О проекте</p>
                <h1 className="mt-6 max-w-4xl text-[clamp(3.1rem,7.2vw,7.4rem)] font-black leading-[0.88] tracking-tight">
                  Выбор ухода без шума
                </h1>
                <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[var(--color-text-muted)]">
                  Красавица - единая AI-платформа для персонального подбора ухода за кожей, волосами и ароматов.
                  Мы строим не магазин, а спокойный маршрут выбора: от задачи и бюджета до объяснимой рекомендации.
                </p>
              </div>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                <Link href="/care" className="apple-glass-button rounded-full bg-black px-5 py-4 text-center text-sm font-black text-white">
                  Попробовать подбор <ArrowUpRight className="ml-2 inline size-4" />
                </Link>
                <Link href="/profile" className="apple-glass-button rounded-full border border-[var(--color-border)] bg-white/40 px-5 py-4 text-center text-sm font-black text-[var(--color-text)] backdrop-blur-2xl">
                  Собрать профиль
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(({ title, href, Icon }) => (
                  <a key={title} href={href} target="_blank" rel="noreferrer" aria-label={title} className="apple-glass-button grid size-12 place-items-center rounded-full border border-[var(--color-border)] bg-white/36 text-[var(--color-text)] backdrop-blur-2xl">
                    <Icon className="size-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="about-visual relative min-h-[560px] overflow-hidden rounded-[var(--radius-xl)] border border-white/55 bg-white/22 shadow-[var(--shadow-card)] backdrop-blur-2xl">
              <Image src="/about-ai-hero.svg" alt="" fill priority sizes="(min-width: 1024px) 54vw, 100vw" className="about-visual-image object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.72),transparent_42%,rgba(255,255,255,.12))]" />
              <div className="about-float-card left-5 top-6">
                <span>04.2026</span>
                <b>старт идеи</b>
              </div>
              <div className="about-float-card right-5 top-20 animation-delay-2">
                <span>AI</span>
                <b>личный подбор</b>
              </div>
              <div className="about-float-card bottom-24 left-8 animation-delay-3">
                <span>Profile</span>
                <b>контекст кожи</b>
              </div>
              <div className="absolute bottom-6 right-6 max-w-sm rounded-[2rem] border border-white/60 bg-white/44 p-5 text-[var(--color-text)] shadow-[var(--shadow-card)] backdrop-blur-2xl">
                <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">Beauty-платформа</p>
                <p className="mt-2 text-2xl font-black leading-tight">Запрос, подбор, объяснение, профиль и доверие в одном сценарии.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-3 py-2 md:px-5">
        <div className="grid gap-2 lg:grid-cols-[0.9fr_1.1fr]">
          <PortalPanel className="min-h-[430px]" image="/beauty-bg-02.svg">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Цель</p>
            <h2 className="mt-4 text-[clamp(2.5rem,5vw,5.5rem)] font-black leading-[0.92]">
              Достаточно описать задачу
            </h2>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-[var(--color-text-muted)]">
              Мы хотим убрать из выбора ухода лишнее напряжение: часы отзывов, случайные обзоры, конфликтующие советы и непонятные составы.
              Красавица переводит запрос в понятный план и показывает, зачем в нем каждое средство.
            </p>
          </PortalPanel>
          <div className="grid gap-2 sm:grid-cols-2">
            {doneItems.map(({ title, text, Icon }, index) => (
              <article key={title} className={`about-proof-card apple-glass-card rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/30 p-5 backdrop-blur-2xl ${index === 0 || index === 5 ? "sm:col-span-2" : ""}`}>
                <Icon className="size-7 text-[var(--color-text)]" />
                <h3 className="mt-5 text-2xl font-black leading-tight">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 py-2 md:px-5">
        <BeautyPortalGrid>
          <PortalPanel className="md:col-span-5" image="/beauty-bg-05.svg">
            <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Сейчас в работе</p>
            <h2 className="mt-4 text-[clamp(2.3rem,4.4vw,4.9rem)] font-black leading-none">Следующий уровень персональности</h2>
            <p className="mt-5 text-base font-semibold leading-7 text-[var(--color-text-muted)]">
              Внутри проекта работает единая beauty-среда: бот, сайт, три режима подбора, профиль и обезличенная аналитика.
            </p>
          </PortalPanel>
          <PortalPanel className="md:col-span-7">
            <div className="grid gap-2">
              {focusItems.map((item, index) => (
                <div key={item} className="about-focus-row rounded-full border border-[var(--color-border)] bg-white/28 px-5 py-4 text-base font-black text-[var(--color-text)] backdrop-blur-2xl">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                  <CheckCircle2 className="size-5" />
                </div>
              ))}
            </div>
          </PortalPanel>
        </BeautyPortalGrid>
      </section>

      <section className="px-3 py-2 md:px-5">
        <div className="liquid-glass relative overflow-hidden rounded-[var(--radius-xxl)] border border-[var(--color-border)] bg-white/26 p-4 shadow-[var(--shadow-soft)] backdrop-blur-2xl md:p-6">
          <div className="absolute inset-0 bg-[url('/about-ai-hero.svg')] bg-cover bg-center opacity-[0.18]" />
          <div className="relative z-10 grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
            <div className="flex flex-col justify-between rounded-[var(--radius-xl)] border border-white/48 bg-white/26 p-6 backdrop-blur-2xl">
              <div>
                <p className="text-sm font-black uppercase text-[var(--color-text-soft)]">Путь развития</p>
                <h2 className="mt-4 text-[clamp(2.8rem,5vw,5.8rem)] font-black leading-[0.9]">От идеи к AI-консультанту</h2>
              </div>
              <p className="mt-8 max-w-xl text-base font-semibold leading-7 text-[var(--color-text-muted)]">
                Этот таймлайн показывает не просто даты, а то, как Красавица собирает доверие: сначала сценарий, потом профиль, затем рейтинг и персональные модули.
              </p>
            </div>
            <div className="about-timeline">
              {timeline.map((item, index) => (
                <article key={item.date} className="about-timeline-item">
                  <span className="about-timeline-index">{index + 1}</span>
                  <div>
                    <p className="text-xs font-black uppercase text-[var(--color-text-soft)]">{item.date}</p>
                    <h3 className="mt-1 text-2xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">{item.text}</p>
                  </div>
                  {index === 0 ? <Rocket className="size-5" /> : <ArrowUpRight className="size-5" />}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TelegramCTA
        title="Следить за развитием Красавицы"
        text="В Telegram-канале будут новости о запуске профиля, рейтинге доверия, парфюм-модуле и новых возможностях AI-подбора."
        href="https://t.me/krasavitsa_ai"
      />
    </BeautyPageShell>
  );
}
