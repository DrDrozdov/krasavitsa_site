import "server-only";
import type { SearchMode } from "@/lib/beauty-engine";

const BEAUTY_STEMS = [
  "акне", "аромат", "бальзам", "блеск", "волос", "воспал", "гель", "духи", "жирн", "запах", "защит", "кожа", "кожи", "кондиционер", "космет", "крем", "кудр", "лицо", "лосьон", "маска", "мускус", "нота", "окраш", "отдуш", "парф", "пилинг", "порист", "прыщ", "раздраж", "ретин", "солнц", "сыворот", "сух", "термозащит", "тоник", "увлаж", "уход", "шампун", "шлейф", "spf",
];
const OFF_TOPIC_STEMS = [
  "автомоб", "акци", "билет", "биткоин", "блюд", "валют", "видеоигр", "врачебн", "домашн", "закон", "игр", "инвест", "код", "крипт", "курс", "математ", "недвиж", "новост", "погод", "полит", "программ", "путеше", "рецепт", "спорт", "фильм", "футбол", "школ", "экзамен",
];
const MODE_INTENTS = ["вариант", "вечер", "ежеднев", "не знаю", "нужен", "подар", "подбер", "посовет", "свеж", "сладк", "хочу", "цена", "цен", "бюджет"];

export function isBeautyRelevantRequest(query: string, mode: SearchMode): boolean {
  const letters = query.toLocaleLowerCase("ru").match(/[a-zа-яё]/g) ?? [];
  const distinct = new Set(letters).size;
  const normalized = query.toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  if (letters.length < 7 || distinct < 3) return false;
  if (/(.)\1{6,}/iu.test(normalized)) return false;
  if (/^(?:https?:\/\/|www\.|[@#/]|\d+[\s.,-]*)/iu.test(normalized)) return false;
  if (/(?:игнорируй|системн(?:ый|ые)? промпт|инструкц(?:ия|ии)|developer message|jailbreak)/iu.test(normalized)) return false;
  if (OFF_TOPIC_STEMS.some((stem) => normalized.includes(stem))) return false;
  if (BEAUTY_STEMS.some((stem) => normalized.includes(stem))) return true;
  const words = normalized.split(" ").filter((word) => word.length >= 2);
  return words.length >= 2 && MODE_INTENTS.some((stem) => normalized.includes(stem)) && Boolean(mode);
}
