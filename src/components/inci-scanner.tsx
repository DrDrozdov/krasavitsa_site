"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  Camera,
  Check,
  ChevronDown,
  FileText,
  ImagePlus,
  Info,
  Layers3,
  LockKeyhole,
  RotateCcw,
  Save,
  ScanLine,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type DragEvent,
  type FormEvent,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  INCI_IMAGE_LIMIT_BYTES,
  INCI_ROUTINE_LIMIT,
  INCI_TEXT_LIMIT,
  type InciAnalysis,
} from "@/lib/inci-types";
import styles from "./inci-scanner.module.css";

type InputMode = "text" | "photo";
type CapabilityState = {
  authenticated: boolean;
  photoRecognitionAvailable: boolean;
  savedCount: number;
};
type SaveState = "idle" | "saving" | "saved" | "error";

const EXAMPLE_INCI = "Aqua, Glycerin, Niacinamide, Propanediol, Panthenol, Squalane, Ceramide NP, Sodium Hyaluronate, Allantoin, Phenoxyethanol, Ethylhexylglycerin";
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const TEXT_STAGES = [
  "Проверяем структуру списка",
  "Сопоставляем названия со словарём ингредиентов",
  "Группируем активы и функции",
  "Сверяем с текущим уходом",
];

const PHOTO_STAGES = [
  "Проверяем файл и удаляем метаданные",
  "Читаем этикетку",
  "Сопоставляем названия со словарём ингредиентов",
  "Сверяем с текущим уходом",
];

export function InciScanner() {
  const reduceMotion = useReducedMotion();
  const inputId = useId();
  const resultRef = useRef<HTMLElement>(null);
  const previewUrlRef = useRef("");
  const [mode, setMode] = useState<InputMode>("text");
  const [inciText, setInciText] = useState("");
  const [routineText, setRoutineText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [capabilities, setCapabilities] = useState<CapabilityState | null>(null);
  const [analysis, setAnalysis] = useState<InciAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [saveLabel, setSaveLabel] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/inci", { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data: CapabilityState | null) => {
        if (data) setCapabilities(data);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearImageSelection = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
    setPreviewUrl("");
    setImageFile(null);
  };

  const selectMode = (nextMode: InputMode) => {
    if (busy) return;
    setMode(nextMode);
    setError("");
  };

  const chooseImage = (file?: File | null) => {
    setError("");
    if (!file) return;
    const mime = file.type.split(";")[0].toLocaleLowerCase("en-US");
    if (!SUPPORTED_IMAGE_TYPES.has(mime)) {
      clearImageSelection();
      setError("Выберите JPG, PNG или WebP.");
      return;
    }
    if (file.size < 1_000 || file.size > INCI_IMAGE_LIMIT_BYTES) {
      clearImageSelection();
      setError("Фото должно быть не больше 5 МБ.");
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setImageFile(file);
    setPreviewUrl(nextPreviewUrl);
  };

  const dropImage = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseImage(event.dataTransfer.files?.[0]);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSaveState("idle");
    setSaveMessage("");

    if (mode === "text" && inciText.trim().length < 10) {
      setError("Вставьте список из нескольких компонентов, разделённых запятыми.");
      return;
    }
    if (mode === "photo" && capabilities?.photoRecognitionAvailable === false) {
      setError("Распознавание фото пока не подключено. Переключитесь на текстовый ввод.");
      return;
    }
    if (mode === "photo" && !imageFile) {
      setError("Добавьте фото этикетки.");
      return;
    }

    setAnalysis(null);
    setBusy(true);
    setStage(0);
    const stages = mode === "photo" ? PHOTO_STAGES : TEXT_STAGES;
    const progressTimer = window.setInterval(() => {
      setStage((current) => Math.min(current + 1, stages.length - 1));
    }, mode === "photo" ? 2_200 : 700);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 58_000);

    try {
      let response: Response;
      if (mode === "photo") {
        const form = new FormData();
        form.set("image", imageFile!);
        form.set("routineText", routineText);
        response = await fetch("/api/inci", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
      } else {
        response = await fetch("/api/inci", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inciText, routineText }),
          signal: controller.signal,
        });
      }
      const data = await response.json().catch(() => ({})) as { analysis?: InciAnalysis; error?: string };
      if (!response.ok || !data.analysis) throw new Error(data.error || "Не удалось разобрать состав.");
      setStage(stages.length - 1);
      setAnalysis(data.analysis);
      setSaveLabel("");
      window.requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    } catch (requestError) {
      setError(
        requestError instanceof DOMException && requestError.name === "AbortError"
          ? "Анализ занял слишком много времени. Попробуйте ещё раз или вставьте состав текстом."
          : requestError instanceof Error
            ? requestError.message
            : "Не удалось разобрать состав.",
      );
    } finally {
      window.clearInterval(progressTimer);
      window.clearTimeout(timeout);
      setBusy(false);
    }
  };

  const saveAnalysis = async () => {
    if (!analysis || saveState === "saving") return;
    setSaveState("saving");
    setSaveMessage("");
    try {
      const response = await fetch("/api/inci/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inciText: analysis.extractedText,
          routineText,
          source: analysis.source,
          label: saveLabel,
        }),
      });
      const data = await response.json().catch(() => ({})) as { savedCount?: number; error?: string };
      if (!response.ok) {
        if (response.status === 401) {
          setCapabilities((current) => current ? { ...current, authenticated: false } : current);
        }
        throw new Error(data.error || "Не удалось сохранить разбор.");
      }
      setCapabilities((current) => current
        ? { ...current, authenticated: true, savedCount: data.savedCount ?? current.savedCount + 1 }
        : current);
      setSaveState("saved");
      setSaveMessage("Разбор сохранён в Beauty ID.");
    } catch (saveError) {
      setSaveState("error");
      setSaveMessage(saveError instanceof Error ? saveError.message : "Не удалось сохранить разбор.");
    }
  };

  const editRecognizedText = () => {
    if (!analysis) return;
    setInciText(analysis.extractedText);
    setMode("text");
    setAnalysis(null);
    setSaveState("idle");
    setError("");
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const reset = () => {
    setAnalysis(null);
    setError("");
    setSaveMessage("");
    setSaveState("idle");
    if (mode === "photo") clearImageSelection();
  };

  const stages = mode === "photo" ? PHOTO_STAGES : TEXT_STAGES;
  const photoUnavailable = capabilities?.photoRecognitionAvailable === false;

  return (
    <div className={styles.page}>
      <div className={styles.ambient} aria-hidden="true"><span /><span /></div>
      <section className={styles.workspace} aria-labelledby="scanner-title">
        <motion.div
          className={styles.heroCopy}
          initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className={styles.eyebrow}>Сканер состава</p>
          <h1 id="scanner-title">Состав без догадок</h1>
          <p className={styles.lead}>Вставьте список ингредиентов или сфотографируйте этикетку. Мы разложим формулу по функциям и сверим её с вашим уходом.</p>
          <div className={styles.trustList} aria-label="Принципы анализа">
            <div><ShieldCheck aria-hidden="true" /><span>Без выдуманных процентов и оценок безопасности</span></div>
            <div><LockKeyhole aria-hidden="true" /><span>Фото обрабатывается в памяти и не сохраняется</span></div>
            <div><Beaker aria-hidden="true" /><span>Текстовый анализ работает локально и детерминированно</span></div>
          </div>
          {capabilities?.authenticated ? (
            <Link href="/profile" className={styles.beautyIdLink}>
              <span>Beauty ID</span>
              <strong>{capabilities.savedCount} сохранено</strong>
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </motion.div>

        <motion.form
          className={styles.scannerPanel}
          onSubmit={submit}
          initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.985, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.panelHeader}>
            <div>
              <span>Новый разбор</span>
              <h2>Добавьте список компонентов</h2>
            </div>
            <ScanLine aria-hidden="true" />
          </div>

          <div className={styles.modeSwitch} role="tablist" aria-label="Способ ввода состава">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "text"}
              aria-controls="inci-text-panel"
              onClick={() => selectMode("text")}
              className={`${mode === "text" ? styles.activeMode : ""} apple-glass-button`}
            >
              <FileText aria-hidden="true" />
              Вставить состав
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "photo"}
              aria-controls="inci-photo-panel"
              onClick={() => selectMode("photo")}
              className={`${mode === "photo" ? styles.activeMode : ""} apple-glass-button`}
            >
              <Camera aria-hidden="true" />
              Фото этикетки
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === "text" ? (
              <motion.div
                id="inci-text-panel"
                role="tabpanel"
                key="text"
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 10 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.inputPanel}
              >
                <div className={styles.labelRow}>
                  <label htmlFor={`${inputId}-inci`}>Список ингредиентов</label>
                  <button type="button" onClick={() => setInciText(EXAMPLE_INCI)}>Вставить пример</button>
                </div>
                <textarea
                  id={`${inputId}-inci`}
                  value={inciText}
                  onChange={(event) => setInciText(event.target.value.slice(0, INCI_TEXT_LIMIT))}
                  placeholder="Aqua, Glycerin, Niacinamide, Panthenol..."
                  spellCheck={false}
                  rows={8}
                  maxLength={INCI_TEXT_LIMIT}
                  aria-describedby={`${inputId}-inci-help`}
                />
                <div className={styles.fieldMeta} id={`${inputId}-inci-help`}>
                  <span>Сохраняйте порядок с этикетки</span>
                  <span>{inciText.length} / {INCI_TEXT_LIMIT}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                id="inci-photo-panel"
                role="tabpanel"
                key="photo"
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -10 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={styles.inputPanel}
              >
                {photoUnavailable ? (
                  <div className={styles.unavailableNotice} role="status">
                    <Info aria-hidden="true" />
                    <div><strong>Фото пока недоступно</strong><span>Vision-модель не настроена на сервере. Текстовый анализ работает без неё.</span></div>
                    <button type="button" onClick={() => selectMode("text")}>Вставить текст</button>
                  </div>
                ) : (
                  <>
                    <div
                      className={`${styles.dropZone} ${dragging ? styles.dragging : ""} ${previewUrl ? styles.hasPreview : ""}`}
                      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
                      }}
                      onDrop={dropImage}
                    >
                      {previewUrl ? (
                        <div className={styles.preview}>
                          <Image
                            src={previewUrl}
                            alt="Предпросмотр выбранной этикетки"
                            fill
                            unoptimized
                            sizes="(min-width: 900px) 560px, 100vw"
                          />
                        </div>
                      ) : (
                        <label htmlFor={`${inputId}-image`} className={styles.dropLabel}>
                          <ImagePlus aria-hidden="true" />
                          <strong>Добавить фото этикетки</strong>
                          <span>Снимите список ровно и без бликов</span>
                        </label>
                      )}
                      <input
                        id={`${inputId}-image`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className={styles.srOnly}
                        onClick={(event) => { event.currentTarget.value = ""; }}
                        onChange={(event) => chooseImage(event.target.files?.[0])}
                      />
                    </div>
                    {imageFile ? (
                      <div className={styles.fileRow}>
                        <div><strong>{imageFile.name}</strong><span>{formatFileSize(imageFile.size)}</span></div>
                        <label htmlFor={`${inputId}-image`}>Заменить</label>
                        <button type="button" aria-label="Удалить выбранное фото" onClick={clearImageSelection}><X aria-hidden="true" /></button>
                      </div>
                    ) : null}
                    <p className={styles.privacyNote}><LockKeyhole aria-hidden="true" />JPG, PNG или WebP до 5 МБ. После ответа исходное фото серверу больше не нужно.</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.routineField}>
            <div className={styles.labelRow}>
              <label htmlFor={`${inputId}-routine`}>Что уже есть в уходе</label>
              <span>Необязательно</span>
            </div>
            <textarea
              id={`${inputId}-routine`}
              value={routineText}
              onChange={(event) => setRoutineText(event.target.value.slice(0, INCI_ROUTINE_LIMIT))}
              placeholder="Например: утром витамин C, вечером ретинол 2 раза в неделю, BHA-тоник по пятницам"
              rows={3}
              maxLength={INCI_ROUTINE_LIMIT}
            />
            <div className={styles.fieldMeta}>
              <span>Достаточно названий активов или средств</span>
              <span>{routineText.length} / {INCI_ROUTINE_LIMIT}</span>
            </div>
          </div>

          {error ? <div className={styles.error} role="alert"><AlertTriangle aria-hidden="true" /><span>{error}</span></div> : null}

          <AnimatePresence initial={false}>
            {busy ? (
              <motion.div
                className={styles.progress}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                aria-live="polite"
              >
                <div className={styles.progressTop}>
                  <ScanLine aria-hidden="true" />
                  <div><strong>{stages[stage]}</strong><span>{mode === "photo" ? "Фото не сохраняется" : "Анализируем локально"}</span></div>
                </div>
                <ol aria-label="Этапы анализа">
                  {stages.map((item, index) => (
                    <li key={item} className={index <= stage ? styles.stageDone : ""} aria-current={index === stage ? "step" : undefined}>
                      <span>{index < stage ? <Check aria-hidden="true" /> : index + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            type="submit"
            className={`${styles.submit} apple-glass-button`}
            disabled={busy || (mode === "photo" && photoUnavailable)}
          >
            {busy ? "Разбираем состав" : "Разобрать состав"}
            {busy ? <ScanLine aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </button>
          <p className={styles.disclaimerShort}>Результат носит информационный характер и не заменяет консультацию врача.</p>
        </motion.form>
      </section>

      <AnimatePresence initial={false}>
        {analysis ? (
          <AnalysisResult
            ref={resultRef}
            analysis={analysis}
            authenticated={Boolean(capabilities?.authenticated)}
            saveLabel={saveLabel}
            saveState={saveState}
            saveMessage={saveMessage}
            onLabelChange={setSaveLabel}
            onSave={() => void saveAnalysis()}
            onEditText={editRecognizedText}
            onReset={reset}
            reduceMotion={Boolean(reduceMotion)}
          />
        ) : null}
      </AnimatePresence>

      <motion.section
        className={styles.method}
        aria-labelledby="method-title"
        initial={reduceMotion ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: reduceMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div initial={reduceMotion ? false : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p>Как читать результат</p>
          <h2 id="method-title">Контекст важнее одного ингредиента</h2>
        </motion.div>
        <div className={styles.methodRows}>
          {[
            ["Порядок, не проценты", "Список на этикетке показывает последовательность компонентов, но не раскрывает точную концентрацию и pH."],
            ["Формула, не чёрный список", "Консерванты, силиконы и жирные спирты выполняют задачи. Их наличие само по себе не делает средство плохим."],
            ["Переносимость индивидуальна", "Патч-тест, состояние барьера и схема нанесения часто важнее модного статуса актива."],
          ].map(([title, copy], index) => (
            <motion.article key={title} initial={reduceMotion ? false : { opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: reduceMotion ? 0 : 0.48, delay: reduceMotion ? 0 : index * 0.07, ease: [0.16, 1, 0.3, 1] }}>
              <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{copy}</p></div>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

const AnalysisResult = forwardRef<HTMLElement, {
  analysis: InciAnalysis;
  authenticated: boolean;
  saveLabel: string;
  saveState: SaveState;
  saveMessage: string;
  onLabelChange: (value: string) => void;
  onSave: () => void;
  onEditText: () => void;
  onReset: () => void;
  reduceMotion: boolean;
}>(function AnalysisResultInner({
    analysis,
    authenticated,
    saveLabel,
    saveState,
    saveMessage,
    onLabelChange,
    onSave,
    onEditText,
    onReset,
    reduceMotion,
  }, forwardedRef) {
    const recognitionRate = analysis.ingredientCount
      ? Math.round((analysis.recognizedCount / analysis.ingredientCount) * 100)
      : 0;
    const ocrQuality = analysis.ocr?.quality === "high"
      ? "Высокая"
      : analysis.ocr?.quality === "medium"
        ? "Средняя"
        : "Нужна проверка";

    return (
      <motion.section
        ref={forwardedRef}
        className={styles.result}
        aria-labelledby="analysis-title"
        initial={reduceMotion ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className={styles.resultHeader}>
          <div className={styles.resultIcon}><Sparkles aria-hidden="true" /></div>
          <div>
            <p>{analysis.source === "photo" ? "Этикетка распознана" : "Локальный разбор готов"}</p>
            <h2 id="analysis-title">{analysis.headline}</h2>
            <span>{analysis.overview}</span>
          </div>
          <button type="button" onClick={onReset}><RotateCcw aria-hidden="true" />Новый разбор</button>
        </header>

        <div className={styles.metrics} aria-label="Сводка анализа">
          <div><strong>{analysis.ingredientCount}</strong><span>компонентов</span></div>
          <div><strong>{analysis.actives.length}</strong><span>заметных активов</span></div>
          <div><strong>{recognitionRate}%</strong><span>покрыто словарём</span></div>
          {analysis.ocr ? <div><strong>{ocrQuality}</strong><span>точность OCR</span></div> : null}
        </div>

        {analysis.ocr && analysis.ocr.quality !== "high" ? (
          <div className={styles.ocrReview}>
            <Info aria-hidden="true" />
            <div><strong>Проверьте распознанный текст</strong><p>{analysis.ocr.note || "Часть символов могла считаться неточно. Перед сохранением сравните список с этикеткой."}</p></div>
            <button type="button" onClick={onEditText}>Исправить текст</button>
          </div>
        ) : null}

        <div className={styles.resultGrid}>
          <div className={styles.mainFindings}>
            <section className={styles.resultSection} aria-labelledby="actives-title">
              <div className={styles.sectionHeading}>
                <div><Beaker aria-hidden="true" /><h3 id="actives-title">Активы и заметные компоненты</h3></div>
                <span>{analysis.actives.length || "Нет"}</span>
              </div>
              {analysis.actives.length ? (
                <div className={styles.activeList}>
                  {analysis.actives.map((active) => (
                    <article key={`${active.name}-${active.inciName}`}>
                      <div><h4>{active.name}</h4><span>{active.inciName}</span></div>
                      <p>{active.note}</p>
                      <div className={styles.roleList}>
                        <span>{active.positionHint}</span>
                        {active.roles.map((role) => <span key={role}>{role}</span>)}
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className={styles.emptyText}>Локальный словарь не нашёл выраженных активов. Это не означает, что формула не работает.</p>}
            </section>

            <section className={styles.resultSection} aria-labelledby="functions-title">
              <div className={styles.sectionHeading}>
                <div><Layers3 aria-hidden="true" /><h3 id="functions-title">Что делает формула</h3></div>
              </div>
              <div className={styles.functionGrid}>
                {analysis.functionalGroups.map((group) => (
                  <article key={group.id}>
                    <span>{group.count}</span>
                    <h4>{group.label}</h4>
                    <p>{group.ingredients.join(", ")}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.contextColumn} aria-label="Контекст и совместимость">
            <section className={styles.contextBlock}>
              <div className={styles.sectionHeading}>
                <div><ShieldCheck aria-hidden="true" /><h3>Сочетание с уходом</h3></div>
              </div>
              {analysis.routineSignals.length ? (
                <p className={styles.signalText}>Учтено: {analysis.routineSignals.join(", ")}.</p>
              ) : (
                <p className={styles.signalText}>Текущий уход не указан. Мы проверили только сам список компонентов.</p>
              )}
              {analysis.conflicts.length ? (
                <div className={styles.conflictList}>
                  {analysis.conflicts.map((conflict) => (
                    <article key={conflict.id} data-level={conflict.level}>
                      <AlertTriangle aria-hidden="true" />
                      <div><h4>{conflict.title}</h4><p>{conflict.description}</p><strong>{conflict.suggestion}</strong></div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={styles.clearContext}><Check aria-hidden="true" /><span>Явных проблем с указанными активами не найдено. Начинайте постепенно и следите за реакцией кожи.</span></div>
              )}
            </section>

            {analysis.positives.length ? (
              <section className={styles.contextBlock}>
                <div className={styles.sectionHeading}>
                  <div><Sparkles aria-hidden="true" /><h3>Поддержка формулы</h3></div>
                </div>
                <ul className={styles.positiveList}>
                  {analysis.positives.map((positive) => <li key={positive}><Check aria-hidden="true" />{positive}</li>)}
                </ul>
              </section>
            ) : null}

            {analysis.flags.length ? (
              <section className={styles.contextBlock}>
                <div className={styles.sectionHeading}>
                  <div><Info aria-hidden="true" /><h3>Что учесть</h3></div>
                </div>
                <div className={styles.flagList}>
                  {analysis.flags.map((flag) => (
                    <article key={flag.id}><h4>{flag.title}</h4><p>{flag.description}</p><span>{flag.ingredients.join(", ")}</span></article>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <details className={styles.ingredients}>
          <summary><span><FileText aria-hidden="true" />Все компоненты по порядку</span><ChevronDown aria-hidden="true" /></summary>
          <ol>
            {analysis.ingredients.map((ingredient) => (
              <li key={`${ingredient.position}-${ingredient.name}`}>
                <span>{String(ingredient.position).padStart(2, "0")}</span>
                <div>
                  <strong>{ingredient.canonicalName}</strong>
                  {ingredient.canonicalName !== ingredient.name ? <small>{ingredient.name}</small> : null}
                </div>
                <p>{ingredient.roles.join(", ")}</p>
              </li>
            ))}
          </ol>
        </details>

        <div className={styles.saveArea}>
          {authenticated ? (
            <>
              <div className={styles.saveCopy}>
                <Save aria-hidden="true" />
                <div><h3>Сохранить в Beauty ID</h3><p>Разбор останется в вашей личной библиотеке. Исходное фото не сохраняется.</p></div>
              </div>
              <label>
                <span>Название средства</span>
                <input
                  value={saveLabel}
                  onChange={(event) => onLabelChange(event.target.value.slice(0, 100))}
                  placeholder="Например, вечерняя сыворотка"
                  maxLength={100}
                />
              </label>
              <button type="button" onClick={onSave} disabled={saveState === "saving" || saveState === "saved"}>
                {saveState === "saved" ? <Check aria-hidden="true" /> : <Save aria-hidden="true" />}
                {saveState === "saving" ? "Сохраняем" : saveState === "saved" ? "Сохранено" : "Сохранить"}
              </button>
            </>
          ) : (
            <>
              <div className={styles.saveCopy}>
                <LockKeyhole aria-hidden="true" />
                <div><h3>Сохранить в Beauty ID</h3><p>Гостевой анализ доступен без регистрации. Войдите только если хотите сохранить результат.</p></div>
              </div>
              <Link href="/profile">Войти в профиль<ArrowRight aria-hidden="true" /></Link>
            </>
          )}
          {saveMessage ? <p className={saveState === "error" ? styles.saveError : styles.saveStatus} role="status">{saveMessage}</p> : null}
        </div>

        <div className={styles.medicalNotice}>
          <Info aria-hidden="true" />
          <p>{analysis.disclaimer}</p>
        </div>
      </motion.section>
    );
});

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
