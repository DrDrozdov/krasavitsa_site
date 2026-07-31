import type {
  InciActive,
  InciAnalysis,
  InciConflict,
  InciFlag,
  InciFunctionalGroup,
  InciIngredient,
  InciPosition,
  InciSource,
} from "./inci-types";

const INCI_TEXT_LIMIT = 8_000;
const INCI_ROUTINE_LIMIT = 2_400;

type IngredientDefinition = {
  canonicalName: string;
  aliases: string[];
  roles: string[];
  active?: boolean;
  families?: string[];
  note?: string;
  concern?: {
    id: string;
    title: string;
    description: string;
  };
};

const DEFINITIONS: IngredientDefinition[] = [
  {
    canonicalName: "Вода",
    aliases: ["aqua", "water", "eau", "aqua/water/eau"],
    roles: ["Растворитель"],
    note: "Основа большинства водных формул.",
  },
  {
    canonicalName: "Глицерин",
    aliases: ["glycerin", "glycerol"],
    roles: ["Увлажнение"],
    note: "Притягивает воду и поддерживает комфорт кожи.",
  },
  {
    canonicalName: "Пропандиол",
    aliases: ["propanediol", "1,3-propanediol"],
    roles: ["Увлажнение", "Растворитель"],
    note: "Увлажнитель и растворитель для других компонентов.",
  },
  {
    canonicalName: "Бутиленгликоль",
    aliases: ["butylene glycol"],
    roles: ["Увлажнение", "Растворитель"],
  },
  {
    canonicalName: "Пентиленгликоль",
    aliases: ["pentylene glycol"],
    roles: ["Увлажнение", "Растворитель"],
  },
  {
    canonicalName: "Гиалуронат натрия",
    aliases: ["sodium hyaluronate", "hyaluronic acid", "hydrolyzed hyaluronic acid", "sodium acetylated hyaluronate"],
    roles: ["Увлажнение"],
    active: true,
    families: ["humectant"],
    note: "Гиалуроновый увлажнитель. Эффект зависит от всей формулы и нанесения.",
  },
  {
    canonicalName: "Бетаин",
    aliases: ["betaine"],
    roles: ["Увлажнение", "Смягчение"],
    note: "Осмолит, который помогает снизить ощущение сухости.",
  },
  {
    canonicalName: "Мочевина",
    aliases: ["urea", "hydroxyethyl urea"],
    roles: ["Увлажнение", "Смягчение"],
    active: true,
    families: ["humectant"],
    note: "Увлажняет и смягчает. Действие зависит от концентрации, которой INCI не показывает.",
  },
  {
    canonicalName: "Сквалан",
    aliases: ["squalane"],
    roles: ["Смягчение", "Поддержка барьера"],
    note: "Лёгкий эмолент, уменьшающий потерю влаги.",
  },
  {
    canonicalName: "Каприловые триглицериды",
    aliases: ["caprylic/capric triglyceride", "caprylic capric triglyceride"],
    roles: ["Смягчение"],
  },
  {
    canonicalName: "Диметикон",
    aliases: ["dimethicone", "amodimethicone"],
    roles: ["Смягчение", "Защита"],
    note: "Силикон, который сглаживает поверхность и снижает потерю влаги.",
  },
  {
    canonicalName: "Вазелин",
    aliases: ["petrolatum", "petroleum jelly"],
    roles: ["Защита", "Поддержка барьера"],
    note: "Окклюзивный компонент, который уменьшает потерю влаги.",
  },
  {
    canonicalName: "Минеральное масло",
    aliases: ["mineral oil", "paraffinum liquidum"],
    roles: ["Смягчение", "Защита"],
  },
  {
    canonicalName: "Масло ши",
    aliases: ["butyrospermum parkii butter", "shea butter"],
    roles: ["Смягчение", "Поддержка барьера"],
  },
  {
    canonicalName: "Масло жожоба",
    aliases: ["simmondsia chinensis seed oil", "jojoba seed oil", "jojoba oil"],
    roles: ["Смягчение"],
  },
  {
    canonicalName: "Цетеариловый спирт",
    aliases: ["cetearyl alcohol", "cetyl alcohol", "stearyl alcohol"],
    roles: ["Смягчение", "Текстура"],
    note: "Жирный спирт. Он не равен подсушивающему денатурированному спирту.",
  },
  {
    canonicalName: "Ниацинамид",
    aliases: ["niacinamide", "nicotinamide"],
    roles: ["Поддержка барьера", "Выравнивание тона", "Контроль себума"],
    active: true,
    families: ["niacinamide"],
    note: "Многофункциональный актив. INCI не сообщает его точную концентрацию.",
  },
  {
    canonicalName: "Пантенол",
    aliases: ["panthenol", "d-panthenol", "provitamin b5"],
    roles: ["Успокаивающее действие", "Увлажнение"],
    active: true,
    families: ["soothing"],
    note: "Поддерживает увлажнение и комфорт кожи.",
  },
  {
    canonicalName: "Аллантоин",
    aliases: ["allantoin"],
    roles: ["Успокаивающее действие"],
    active: true,
    families: ["soothing"],
    note: "Компонент для снижения ощущения дискомфорта.",
  },
  {
    canonicalName: "Бета-глюкан",
    aliases: ["beta-glucan", "beta glucan"],
    roles: ["Успокаивающее действие", "Увлажнение"],
    active: true,
    families: ["soothing"],
    note: "Поддерживает увлажнение и восстановительный уход.",
  },
  {
    canonicalName: "Центелла",
    aliases: ["centella asiatica extract", "centella asiatica leaf extract", "madecassoside", "asiaticoside"],
    roles: ["Успокаивающее действие", "Антиоксидант"],
    active: true,
    families: ["soothing"],
    note: "Растительный компонент для поддерживающего ухода.",
  },
  {
    canonicalName: "Церамиды",
    aliases: ["ceramide np", "ceramide ap", "ceramide eop", "ceramide ns", "ceramide as", "ceramide ng"],
    roles: ["Поддержка барьера"],
    active: true,
    families: ["barrier"],
    note: "Липиды барьера. Лучше работают в сбалансированной липидной системе формулы.",
  },
  {
    canonicalName: "Холестерин",
    aliases: ["cholesterol"],
    roles: ["Поддержка барьера"],
    active: true,
    families: ["barrier"],
    note: "Один из физиологических липидов защитного барьера кожи.",
  },
  {
    canonicalName: "Пептиды",
    aliases: ["palmitoyl tripeptide-1", "palmitoyl tetrapeptide-7", "copper tripeptide-1", "acetyl hexapeptide-8", "sh-polypeptide-1"],
    roles: ["Поддерживающий уход"],
    active: true,
    families: ["peptide"],
    note: "Пептидный компонент. Эффект зависит от конкретного пептида и готовой формулы.",
  },
  {
    canonicalName: "Ретинол",
    aliases: ["retinol"],
    roles: ["Обновление", "Выравнивание тона"],
    active: true,
    families: ["retinoid"],
    note: "Ретиноид с потенциалом раздражения. Вводите постепенно и используйте SPF днём.",
  },
  {
    canonicalName: "Ретиналь",
    aliases: ["retinal", "retinaldehyde"],
    roles: ["Обновление", "Выравнивание тона"],
    active: true,
    families: ["retinoid"],
    note: "Активный ретиноид. Вводите постепенно и используйте SPF днём.",
  },
  {
    canonicalName: "Ретинил пальмитат",
    aliases: ["retinyl palmitate", "retinyl acetate"],
    roles: ["Антиоксидант", "Обновление"],
    active: true,
    families: ["retinoid"],
    note: "Мягкое производное витамина A. Чувствительность зависит от формулы и кожи.",
  },
  {
    canonicalName: "Бакучиол",
    aliases: ["bakuchiol"],
    roles: ["Антиоксидант", "Поддерживающий уход"],
    active: true,
    families: ["bakuchiol"],
    note: "Растительный актив. Он не является ретиноидом, несмотря на частые сравнения.",
  },
  {
    canonicalName: "Салициловая кислота",
    aliases: ["salicylic acid"],
    roles: ["Отшелушивание", "Контроль себума"],
    active: true,
    families: ["bha", "exfoliant"],
    note: "BHA-кислота. Может усиливать сухость при сочетании с другими активными средствами.",
  },
  {
    canonicalName: "Гликолевая кислота",
    aliases: ["glycolic acid"],
    roles: ["Отшелушивание", "Выравнивание тона"],
    active: true,
    families: ["aha", "exfoliant"],
    note: "AHA-кислота. Частоту лучше повышать постепенно.",
  },
  {
    canonicalName: "Молочная кислота",
    aliases: ["lactic acid"],
    roles: ["Отшелушивание", "Увлажнение"],
    active: true,
    families: ["aha", "exfoliant"],
    note: "AHA-кислота и увлажняющий компонент. Роль зависит от концентрации и pH.",
  },
  {
    canonicalName: "Миндальная кислота",
    aliases: ["mandelic acid"],
    roles: ["Отшелушивание", "Выравнивание тона"],
    active: true,
    families: ["aha", "exfoliant"],
    note: "AHA-кислота. Даже мягкие кислоты могут раздражать при частом наслаивании.",
  },
  {
    canonicalName: "Глюконолактон",
    aliases: ["gluconolactone"],
    roles: ["Мягкое отшелушивание", "Увлажнение"],
    active: true,
    families: ["pha", "exfoliant"],
    note: "PHA-компонент. Обычно мягче AHA, но реакция кожи индивидуальна.",
  },
  {
    canonicalName: "Азелаиновая кислота",
    aliases: ["azelaic acid", "potassium azeloyl diglycinate"],
    roles: ["Выравнивание тона", "Контроль себума"],
    active: true,
    families: ["azelaic"],
    note: "Актив для тона и несовершенств. Может пощипывать на чувствительной коже.",
  },
  {
    canonicalName: "Витамин C",
    aliases: ["ascorbic acid", "l-ascorbic acid"],
    roles: ["Антиоксидант", "Выравнивание тона"],
    active: true,
    families: ["vitamin-c-acid"],
    note: "Чистая аскорбиновая кислота. Стабильность и переносимость зависят от формулы.",
  },
  {
    canonicalName: "Производное витамина C",
    aliases: ["ascorbyl glucoside", "sodium ascorbyl phosphate", "magnesium ascorbyl phosphate", "3-o-ethyl ascorbic acid", "tetrahexyldecyl ascorbate"],
    roles: ["Антиоксидант", "Выравнивание тона"],
    active: true,
    families: ["vitamin-c"],
    note: "Стабилизированное производное витамина C. Свойства зависят от конкретной формы.",
  },
  {
    canonicalName: "Транексамовая кислота",
    aliases: ["tranexamic acid"],
    roles: ["Выравнивание тона"],
    active: true,
    families: ["brightening"],
    note: "Актив для работы с неровным тоном.",
  },
  {
    canonicalName: "Альфа-арбутин",
    aliases: ["alpha-arbutin", "arbutin"],
    roles: ["Выравнивание тона"],
    active: true,
    families: ["brightening"],
    note: "Компонент для выравнивания тона. Важны стабильность и условия хранения.",
  },
  {
    canonicalName: "Бензоилпероксид",
    aliases: ["benzoyl peroxide"],
    roles: ["Уход при несовершенствах"],
    active: true,
    families: ["benzoyl-peroxide"],
    note: "Может сушить и раздражать кожу, а также обесцвечивать ткань.",
  },
  {
    canonicalName: "Сера",
    aliases: ["sulfur"],
    roles: ["Контроль себума", "Уход при несовершенствах"],
    active: true,
    families: ["sulfur"],
    note: "Может подсушивать при частом использовании.",
  },
  {
    canonicalName: "Цинк PCA",
    aliases: ["zinc pca"],
    roles: ["Контроль себума", "Увлажнение"],
    active: true,
    families: ["zinc"],
    note: "Компонент поддерживающего ухода за жирной и комбинированной кожей.",
  },
  {
    canonicalName: "Токоферол",
    aliases: ["tocopherol", "tocopheryl acetate"],
    roles: ["Антиоксидант"],
    active: true,
    families: ["antioxidant"],
    note: "Форма витамина E, защищающая липидную часть формулы.",
  },
  {
    canonicalName: "Зелёный чай",
    aliases: ["camellia sinensis leaf extract", "camellia sinensis extract"],
    roles: ["Антиоксидант", "Успокаивающее действие"],
    active: true,
    families: ["soothing", "antioxidant"],
    note: "Растительный антиоксидантный компонент.",
  },
  {
    canonicalName: "Денатурированный спирт",
    aliases: ["alcohol denat", "alcohol denat.", "sd alcohol 40-b", "ethanol"],
    roles: ["Растворитель", "Сенсорика"],
    concern: {
      id: "denatured-alcohol",
      title: "В формуле есть летучий спирт",
      description: "Он помогает текстуре и доставке компонентов, но на сухой или раздражённой коже может усиливать дискомфорт.",
    },
  },
  {
    canonicalName: "Отдушка",
    aliases: ["parfum", "fragrance", "aroma"],
    roles: ["Аромат"],
    concern: {
      id: "fragrance",
      title: "В формуле есть отдушка",
      description: "Это не делает средство плохим, но реактивной коже полезно учитывать индивидуальную чувствительность.",
    },
  },
  {
    canonicalName: "Лимонен",
    aliases: ["limonene", "d-limonene"],
    roles: ["Аромат"],
    concern: {
      id: "fragrance-allergens",
      title: "Указаны ароматические аллергены",
      description: "Они обязательны к маркировке и важны прежде всего при известной чувствительности к отдушкам.",
    },
  },
  {
    canonicalName: "Линалоол",
    aliases: ["linalool"],
    roles: ["Аромат"],
    concern: {
      id: "fragrance-allergens",
      title: "Указаны ароматические аллергены",
      description: "Они обязательны к маркировке и важны прежде всего при известной чувствительности к отдушкам.",
    },
  },
  {
    canonicalName: "Гераниол",
    aliases: ["geraniol"],
    roles: ["Аромат"],
    concern: {
      id: "fragrance-allergens",
      title: "Указаны ароматические аллергены",
      description: "Они обязательны к маркировке и важны прежде всего при известной чувствительности к отдушкам.",
    },
  },
  {
    canonicalName: "Цитронеллол",
    aliases: ["citronellol"],
    roles: ["Аромат"],
    concern: {
      id: "fragrance-allergens",
      title: "Указаны ароматические аллергены",
      description: "Они обязательны к маркировке и важны прежде всего при известной чувствительности к отдушкам.",
    },
  },
  {
    canonicalName: "Ментол",
    aliases: ["menthol"],
    roles: ["Сенсорика"],
    concern: {
      id: "menthol",
      title: "Есть охлаждающий компонент",
      description: "Ментол даёт ощущение прохлады, но у чувствительной кожи может вызывать жжение.",
    },
  },
  {
    canonicalName: "Эвкалиптовое масло",
    aliases: ["eucalyptus globulus leaf oil", "eucalyptus oil"],
    roles: ["Аромат"],
    concern: {
      id: "essential-oils",
      title: "Есть эфирное масло",
      description: "Ароматические масла могут быть комфортны не всем, особенно при нарушенном барьере.",
    },
  },
  {
    canonicalName: "Масло мяты",
    aliases: ["mentha piperita oil", "peppermint oil"],
    roles: ["Аромат", "Сенсорика"],
    concern: {
      id: "essential-oils",
      title: "Есть эфирное масло",
      description: "Ароматические масла могут быть комфортны не всем, особенно при нарушенном барьере.",
    },
  },
  {
    canonicalName: "Феноксиэтанол",
    aliases: ["phenoxyethanol"],
    roles: ["Консервация"],
    note: "Распространённый консервант, защищающий средство от микробного загрязнения.",
  },
  {
    canonicalName: "Этилгексилглицерин",
    aliases: ["ethylhexylglycerin"],
    roles: ["Консервация", "Смягчение"],
  },
  {
    canonicalName: "Бензоат натрия",
    aliases: ["sodium benzoate"],
    roles: ["Консервация"],
  },
  {
    canonicalName: "Сорбат калия",
    aliases: ["potassium sorbate"],
    roles: ["Консервация"],
  },
  {
    canonicalName: "Динатрий EDTA",
    aliases: ["disodium edta", "tetrasodium edta"],
    roles: ["Стабилизация"],
  },
  {
    canonicalName: "Карбомер",
    aliases: ["carbomer"],
    roles: ["Текстура"],
  },
  {
    canonicalName: "Ксантановая камедь",
    aliases: ["xanthan gum"],
    roles: ["Текстура"],
  },
  {
    canonicalName: "Лимонная кислота",
    aliases: ["citric acid"],
    roles: ["Настройка pH"],
    note: "Часто регулирует pH и не обязательно работает как самостоятельный кислотный пилинг.",
  },
  {
    canonicalName: "Гидроксид натрия",
    aliases: ["sodium hydroxide"],
    roles: ["Настройка pH"],
  },
];

const ALIAS_INDEX = new Map<string, IngredientDefinition>();
for (const definition of DEFINITIONS) {
  for (const alias of definition.aliases) ALIAS_INDEX.set(normalizeLookup(alias), definition);
}

const ROUTINE_PATTERNS = [
  { id: "retinoid", label: "ретиноид", pattern: /\b(retinol|retinal|retinoid|tretinoin|adapalene)\b|ретинол|ретиналь|ретиноид|третиноин|адапален/iu },
  { id: "aha", label: "AHA-кислоты", pattern: /\b(aha|glycolic|lactic|mandelic)\b|гликолев|молочн\w*\s+кисл|миндальн\w*\s+кисл|aha-?кисл/iu },
  { id: "bha", label: "BHA или салициловая кислота", pattern: /\b(bha|salicylic)\b|салицилов|bha-?кисл/iu },
  { id: "pha", label: "PHA-кислоты", pattern: /\b(pha|gluconolactone)\b|глюконолактон|pha-?кисл/iu },
  { id: "benzoyl-peroxide", label: "бензоилпероксид", pattern: /\bbenzoyl peroxide\b|бензоилпероксид|бензоил\w*\s+пероксид/iu },
  { id: "vitamin-c-acid", label: "кислая форма витамина C", pattern: /\b(l-ascorbic|ascorbic acid)\b|аскорбинов\w*\s+кисл|кисл\w*\s+витамин\w*\s+c/iu },
  { id: "azelaic", label: "азелаиновая кислота", pattern: /\bazelaic\b|азелаинов/iu },
  { id: "exfoliant", label: "пилинг или эксфолиант", pattern: /пилинг|эксфолиант|peel pads?|кислотн\w*\s+тонер/iu },
  { id: "sensitive", label: "чувствительная или раздражённая кожа", pattern: /чувствительн|раздражен|раздражён|жжение|розацеа|дерматит|нарушен\w*\s+барьер/iu },
] as const;

const POSITION_LABELS: InciPosition[] = ["начало списка", "середина списка", "конец списка"];

function normalizeLookup(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[.%]/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeInciText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, INCI_TEXT_LIMIT);
}

export function sanitizeRoutineText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, INCI_ROUTINE_LIMIT);
}

export function parseInciIngredients(input: string) {
  const text = sanitizeInciText(input)
    .replace(/^\s*(ingredients?|inci|состав)\s*[:：]\s*/iu, "")
    .replace(/\bmay contain\s*[:：]?/giu, ",")
    .replace(/\bможет содержать\s*[:：]?/giu, ",");
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of text) {
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth = Math.max(0, depth - 1);
    if ((char === "," || char === ";" || char === "\n") && depth === 0) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());

  return parts
    .map((part) => part
      .replace(/^[\s•·*\-–—\d.)]+/u, "")
      .replace(/\s+/g, " ")
      .replace(/[.;:]+$/g, "")
      .trim())
    .filter((part) => part.length > 1 && part.length <= 180)
    .slice(0, 120);
}

function positionHint(index: number, total: number): InciPosition {
  const startBoundary = Math.min(5, Math.max(2, Math.ceil(total * 0.28)));
  const endBoundary = total <= 10
    ? Math.max(startBoundary, Math.floor(total * 0.72))
    : Math.max(10, Math.floor(total * 0.72));
  if (index < startBoundary) return POSITION_LABELS[0];
  if (index >= endBoundary) return POSITION_LABELS[2];
  return POSITION_LABELS[1];
}

function findDefinition(name: string) {
  const normalized = normalizeLookup(name);
  const exact = ALIAS_INDEX.get(normalized);
  if (exact) return exact;

  for (const [alias, definition] of ALIAS_INDEX) {
    if (normalized === alias || (alias.length > 8 && normalized.includes(alias))) return definition;
  }
  return undefined;
}

function createIngredient(name: string, index: number, total: number): InciIngredient & { definition?: IngredientDefinition } {
  const definition = findDefinition(name);
  return {
    name,
    canonicalName: definition?.canonicalName ?? name,
    position: index + 1,
    positionHint: positionHint(index, total),
    recognized: Boolean(definition),
    active: Boolean(definition?.active),
    roles: definition?.roles ?? ["Функция не определена локальным словарём"],
    note: definition?.note,
    definition,
  };
}

function buildFunctionalGroups(ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>): InciFunctionalGroup[] {
  const groups = new Map<string, string[]>();
  for (const ingredient of ingredients) {
    if (!ingredient.recognized) continue;
    for (const role of ingredient.roles) {
      const names = groups.get(role) ?? [];
      if (!names.includes(ingredient.canonicalName)) names.push(ingredient.canonicalName);
      groups.set(role, names);
    }
  }
  return [...groups.entries()]
    .map(([label, names]) => ({
      id: label.toLocaleLowerCase("ru-RU").replace(/[^a-zа-яё0-9]+/giu, "-"),
      label,
      count: names.length,
      ingredients: names.slice(0, 6),
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ru"))
    .slice(0, 8);
}

function buildFlags(ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>) {
  const grouped = new Map<string, InciFlag>();
  for (const ingredient of ingredients) {
    const concern = ingredient.definition?.concern;
    if (!concern) continue;
    const existing = grouped.get(concern.id);
    if (existing) {
      if (!existing.ingredients.includes(ingredient.canonicalName)) existing.ingredients.push(ingredient.canonicalName);
      continue;
    }
    grouped.set(concern.id, {
      id: concern.id,
      level: "attention",
      title: concern.title,
      description: concern.description,
      ingredients: [ingredient.canonicalName],
    });
  }
  return [...grouped.values()];
}

function detectRoutineSignals(routineText: string) {
  const normalized = sanitizeRoutineText(routineText);
  return ROUTINE_PATTERNS.filter((signal) => signal.pattern.test(normalized));
}

function hasFamily(ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>, family: string) {
  return ingredients.some((ingredient) => ingredient.definition?.families?.includes(family));
}

function namesForFamilies(
  ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>,
  families: string[],
) {
  return ingredients
    .filter((ingredient) => ingredient.definition?.families?.some((family) => families.includes(family)))
    .map((ingredient) => ingredient.canonicalName)
    .filter((name, index, names) => names.indexOf(name) === index);
}

function buildConflicts(
  ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>,
  routineText: string,
): { signals: string[]; conflicts: InciConflict[] } {
  const detected = detectRoutineSignals(routineText);
  const signalIds = new Set(detected.map((signal) => signal.id));
  const conflicts: InciConflict[] = [];
  const add = (conflict: InciConflict) => {
    if (!conflicts.some((item) => item.id === conflict.id)) conflicts.push(conflict);
  };

  if (hasFamily(ingredients, "retinoid") && signalIds.has("retinoid")) {
    add({
      id: "retinoid-duplicate",
      level: "attention",
      title: "В уходе уже есть ретиноид",
      description: "Два ретиноидных средства в один вечер чаще увеличивают раздражение, а не пользу.",
      suggestion: "Оставьте одно средство на применение или согласуйте схему с дерматологом.",
      matched: namesForFamilies(ingredients, ["retinoid"]),
    });
  }
  if (hasFamily(ingredients, "retinoid") && (signalIds.has("aha") || signalIds.has("bha") || signalIds.has("pha") || signalIds.has("exfoliant"))) {
    add({
      id: "retinoid-exfoliant",
      level: "attention",
      title: "Ретиноид и отшелушивание",
      description: "Такое сочетание может повысить сухость, жжение и чувствительность.",
      suggestion: "Разведите средства по разным вечерам и сначала оцените переносимость каждого отдельно.",
      matched: [...namesForFamilies(ingredients, ["retinoid"]), ...detected.filter((item) => ["aha", "bha", "pha", "exfoliant"].includes(item.id)).map((item) => item.label)],
    });
  }
  if (hasFamily(ingredients, "exfoliant") && (signalIds.has("retinoid") || signalIds.has("aha") || signalIds.has("bha") || signalIds.has("pha") || signalIds.has("exfoliant"))) {
    add({
      id: "exfoliant-layering",
      level: "attention",
      title: "Возможное наслаивание активов",
      description: "В средстве есть отшелушивающий компонент, и похожая нагрузка уже указана в текущем уходе.",
      suggestion: "Не начинайте с ежедневного сочетания. Чередуйте дни и следите за барьером кожи.",
      matched: [...namesForFamilies(ingredients, ["aha", "bha", "pha"]), ...detected.filter((item) => ["retinoid", "aha", "bha", "pha", "exfoliant"].includes(item.id)).map((item) => item.label)],
    });
  }
  if (hasFamily(ingredients, "benzoyl-peroxide") && (signalIds.has("retinoid") || signalIds.has("aha") || signalIds.has("bha") || signalIds.has("exfoliant"))) {
    add({
      id: "benzoyl-active-load",
      level: "attention",
      title: "Бензоилпероксид и активный уход",
      description: "Одновременное нанесение с ретиноидами или кислотами может заметно повысить раздражение.",
      suggestion: "Используйте в разное время суток или в разные дни, если врач не назначил другую схему.",
      matched: ["Бензоилпероксид", ...detected.filter((item) => ["retinoid", "aha", "bha", "exfoliant"].includes(item.id)).map((item) => item.label)],
    });
  }
  if (hasFamily(ingredients, "retinoid") && signalIds.has("benzoyl-peroxide")) {
    add({
      id: "retinoid-benzoyl",
      level: "attention",
      title: "Ретиноид и бензоилпероксид",
      description: "Сочетание часто сушит кожу. Совместимость также зависит от конкретной формы ретиноида.",
      suggestion: "Разведите нанесение по времени и следуйте инструкции к продуктам.",
      matched: [...namesForFamilies(ingredients, ["retinoid"]), "бензоилпероксид"],
    });
  }
  if (hasFamily(ingredients, "vitamin-c-acid") && signalIds.has("benzoyl-peroxide")) {
    add({
      id: "vitamin-c-benzoyl",
      level: "info",
      title: "Витамин C и бензоилпероксид",
      description: "Одновременное нанесение может быть менее комфортным и не всегда оправдано.",
      suggestion: "Простой вариант: витамин C утром, бензоилпероксид вечером.",
      matched: [...namesForFamilies(ingredients, ["vitamin-c-acid"]), "бензоилпероксид"],
    });
  }
  if ((buildFlags(ingredients).length > 0) && signalIds.has("sensitive")) {
    add({
      id: "sensitive-fragrant-formula",
      level: "info",
      title: "Реактивная кожа и сенсорные компоненты",
      description: "В контексте ухода указана чувствительность, а в составе есть компоненты, которые иногда вызывают дискомфорт.",
      suggestion: "Сделайте патч-тест и не наносите средство на уже раздражённую кожу.",
      matched: buildFlags(ingredients).flatMap((flag) => flag.ingredients).slice(0, 5),
    });
  }

  return {
    signals: detected.map((signal) => signal.label),
    conflicts: conflicts.slice(0, 5),
  };
}

function buildPositives(ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>) {
  const positives: string[] = [];
  if (hasFamily(ingredients, "barrier")) positives.push("Есть липиды, поддерживающие защитный барьер.");
  if (hasFamily(ingredients, "soothing")) positives.push("Есть компоненты для успокаивающего и восстановительного ухода.");
  if (hasFamily(ingredients, "humectant")) positives.push("Формула содержит выраженный увлажняющий блок.");
  if (hasFamily(ingredients, "retinoid") && hasFamily(ingredients, "barrier")) positives.push("Ретиноид дополнен барьерной поддержкой внутри формулы.");
  if (!positives.length && ingredients.some((ingredient) => ingredient.roles.includes("Увлажнение"))) {
    positives.push("В составе есть базовые увлажняющие компоненты.");
  }
  return positives.slice(0, 4);
}

function buildOverview(
  ingredients: Array<InciIngredient & { definition?: IngredientDefinition }>,
  actives: InciActive[],
  flags: InciFlag[],
) {
  if (actives.length) {
    const names = actives.slice(0, 3).map((active) => active.name).join(", ");
    return `В центре формулы: ${names}. Позиция в INCI помогает оценить порядок, но не раскрывает точные проценты.`;
  }
  if (ingredients.some((ingredient) => ingredient.roles.includes("Увлажнение"))) {
    return `Состав выглядит как базовая увлажняющая формула${flags.length ? " с компонентами, важными для чувствительной кожи" : ""}. Точные концентрации по списку INCI определить нельзя.`;
  }
  return "Сканер распознал структуру списка, но локальному словарю не хватает данных для уверенного вывода о главном акценте формулы.";
}

export function analyzeInciText(
  inciText: string,
  routineText = "",
  source: InciSource = "text",
): InciAnalysis {
  const extractedText = sanitizeInciText(inciText);
  const names = parseInciIngredients(extractedText);
  if (names.length < 2) throw new Error("INCI_TOO_SHORT");

  const enriched = names.map((name, index) => createIngredient(name, index, names.length));
  const publicIngredients: InciIngredient[] = enriched.map((ingredient) => ({
    name: ingredient.name,
    canonicalName: ingredient.canonicalName,
    position: ingredient.position,
    positionHint: ingredient.positionHint,
    recognized: ingredient.recognized,
    active: ingredient.active,
    roles: ingredient.roles,
    note: ingredient.note,
  }));
  const actives: InciActive[] = enriched
    .filter((ingredient) => ingredient.active)
    .map((ingredient) => ({
      name: ingredient.canonicalName,
      inciName: ingredient.name,
      positionHint: ingredient.positionHint,
      roles: ingredient.roles,
      note: ingredient.note ?? "Активный компонент в составе.",
    }))
    .filter((active, index, items) => items.findIndex((item) => item.name === active.name) === index)
    .slice(0, 12);
  const flags = buildFlags(enriched);
  const routine = buildConflicts(enriched, routineText);
  const firstActives = actives.slice(0, 2).map((active) => active.name);
  const headline = firstActives.length
    ? `Акцент формулы: ${firstActives.join(" и ")}`
    : enriched.some((ingredient) => ingredient.roles.includes("Увлажнение"))
      ? "Базовая увлажняющая формула"
      : "Формула без очевидного ведущего актива";

  return {
    version: 1,
    source,
    extractedText,
    analyzedAt: new Date().toISOString(),
    headline,
    overview: buildOverview(enriched, actives, flags),
    ingredientCount: publicIngredients.length,
    recognizedCount: publicIngredients.filter((ingredient) => ingredient.recognized).length,
    ingredients: publicIngredients,
    actives,
    functionalGroups: buildFunctionalGroups(enriched),
    flags,
    routineSignals: routine.signals,
    conflicts: routine.conflicts,
    positives: buildPositives(enriched),
    disclaimer: "Это информационный разбор, а не диагноз и не гарантия переносимости. При аллергии, дерматите, беременности или лечении кожи обсудите активы со специалистом.",
  };
}
