"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  Fingerprint,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import styles from "./about.module.css";

const method = [
  {
    number: "01",
    title: "Контекст",
    text: "Учитываем задачу, чувствительность, привычки, бюджет и то, что уже пробовали.",
    Icon: Fingerprint,
  },
  {
    number: "02",
    title: "Проверка",
    text: "Сверяем составы, назначение и доступные источники — без гонки за самым громким продуктом.",
    Icon: ScanSearch,
  },
  {
    number: "03",
    title: "Сценарий",
    text: "Собираем короткий план и объясняем роль каждого шага, чтобы выбор оставался вашим.",
    Icon: Sparkles,
  },
];

const boundaries = [
  "Не ставим диагнозы и не заменяем врача.",
  "Не маскируем рекламу под персональную рекомендацию.",
  "Не просим чувствительные данные, которые не нужны для подбора.",
];

const systemSignals = [
  { title: "Контекст", text: "Задача, привычки и бюджет", Icon: Fingerprint },
  { title: "Проверка", text: "Состав, назначение и источник", Icon: ScanSearch },
  { title: "Прозрачность", text: "Понятное объяснение выбора", Icon: Eye },
  { title: "Границы", text: "Без диагнозов и обещаний", Icon: ShieldCheck },
  { title: "Сценарий", text: "Короткая последовательность шагов", Icon: Sparkles },
  { title: "Ваш выбор", text: "Решение остаётся за вами", Icon: Check },
];

export function AboutExperience() {
  const experienceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = experienceRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    root.dataset.enhanced = "true";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.13, rootMargin: "0px 0px -7% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  function trackLight(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <div className={styles.experience} ref={experienceRef}>
      <section className={`${styles.hero} ${styles.frame}`} data-reveal>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>О проекте · beauty intelligence</p>
          <h1>
            Не больше средств.
            <span>Больше ясности.</span>
          </h1>
          <p className={styles.lead}>
            Красавица переводит обычный запрос о коже, волосах или ароматах в
            понятный сценарий — с аргументами, ограничениями и без лишнего шума.
          </p>
          <Link className={styles.heroAction} href="/care">
            Собрать свой сценарий
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div
          className={`${styles.decisionSurface} ${styles.spotlight}`}
          onPointerMove={trackLight}
          aria-label="От контекста к понятному сценарию"
        >
          <div className={styles.surfaceMeta}>
            <span>Beauty signal</span>
            <span>01—03</span>
          </div>
          <div className={styles.surfaceCore}>
            <div className={styles.input}>
              <small>Вход</small>
              <strong>Ваш контекст</strong>
              <div className={styles.chips}>
                <span>задача</span>
                <span>ритм</span>
                <span>бюджет</span>
              </div>
            </div>
            <div className={styles.signal} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className={styles.output}>
              <small>Результат</small>
              <strong>Ясный сценарий</strong>
              <span>
                <Check aria-hidden="true" />
                объяснён каждый шаг
              </span>
            </div>
          </div>
          <p className={styles.surfaceFoot}>Контекст → проверка → решение</p>
        </div>
      </section>

      <section className={`${styles.missionSystem} ${styles.frame}`} data-reveal>
        <div className={styles.missionCopy}>
          <p className={styles.kicker}>Система, а не случайный совет</p>
          <h2>В центре всегда остаётся ваша реальная задача.</h2>
          <p>
            Красавица соединяет шесть сигналов в один спокойный маршрут. Каждый
            сегмент можно проверить — и ни один не подменяет ваше решение.
          </p>
        </div>
        <div className={styles.missionPortal} aria-label="Шесть принципов Красавицы">
          <div className={styles.portalCore}>
            <span>Beauty ID</span>
            <strong>Ваш контекст</strong>
            <small>в центре системы</small>
          </div>
          {systemSignals.map(({ title, text, Icon }, index) => (
            <article
              key={title}
              className={styles.portalSegment}
              data-reveal
              style={{ "--segment": index, "--delay": `${120 + index * 85}ms` } as React.CSSProperties}
            >
              <Icon aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </article>
          ))}
          <span className={styles.portalOrbit} aria-hidden="true" />
        </div>
      </section>

      <section className={`${styles.methodSection} ${styles.frame}`} data-reveal>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Как работает подбор</p>
            <h2>Три шага. Один понятный ответ.</h2>
          </div>
          <p>
            Не просто список продуктов, а логика выбора, которую можно проверить
            и применить в реальной жизни.
          </p>
        </div>
        <div className={styles.methodGrid}>
          {method.map(({ number, title, text, Icon }, index) => (
            <article
              className={`${styles.methodCard} ${styles.spotlight}`}
              key={title}
              onPointerMove={trackLight}
              data-reveal
              style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}
            >
              <div>
                <span>{number}</span>
                <Icon aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.trustSection} ${styles.frame}`} data-reveal>
        <article className={styles.boundaries}>
          <div className={styles.trustTitle}>
            <ShieldCheck aria-hidden="true" />
            <p className={styles.kicker}>Наши границы</p>
          </div>
          <h2>Честно о том, чем сервис не является.</h2>
          <ul>
            {boundaries.map((item) => (
              <li key={item}>
                <Check aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article
          className={`${styles.privacy} ${styles.spotlight}`}
          onPointerMove={trackLight}
        >
          <p className={styles.kicker}>Приватность</p>
          <h2>Личное остаётся личным.</h2>
          <p>
            Для базового подбора не нужен публичный профиль. Историю и избранное
            вы сохраняете осознанно — только когда хотите вернуться к результату.
          </p>
          <div className={styles.privacyMeter} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <small>Вы управляете тем, что сохраняется в профиле</small>
        </article>
      </section>

      <section className={`${styles.cta} ${styles.frame}`} data-reveal>
        <div>
          <p className={styles.kicker}>Начните с одного запроса</p>
          <h2>Опишите задачу своими словами. Остальное соберём вместе.</h2>
        </div>
        <Link className={styles.ctaAction} href="/care">
          Начать AI-подбор
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
