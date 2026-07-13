import "server-only";

import { createHash, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredUser = {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  passwordSalt: string;
  avatarUrl?: string;
  createdAt: string;
  acceptedPrivacyAt: string;
  acceptedTermsAt: string;
  emailVerifiedAt?: string;
  emailVerificationHash?: string;
  emailVerificationExpiresAt?: string;
  favorites?: SavedProduct[];
  recommendationHistory?: RecommendationHistory[];
  consents?: UserConsents;
};

export type PublicUser = Pick<StoredUser, "id" | "email" | "nickname" | "avatarUrl" | "createdAt">;
export type SavedProduct = { id: string; name: string; category: string; reason: string; image?: string; price?: string; rating?: number; savedAt: string };
export type RecommendationHistory = { id: string; query: string; mode: "skin" | "hair" | "perfume"; summary: string; products: SavedProduct[]; createdAt: string };
export type UserConsents = { privacy: boolean; terms: boolean; analytics: boolean; updatedAt: string };

type UserState = { users: StoredUser[] };

const dataRoot = process.env.USER_DATA_DIR ?? process.env.ANALYTICS_DATA_DIR ?? path.join(process.cwd(), ".data");
const usersPath = path.join(dataRoot, "users.json");
let writeQueue = Promise.resolve();

async function readState(): Promise<UserState> {
  try {
    return JSON.parse(await readFile(usersPath, "utf8")) as UserState;
  } catch {
    return { users: [] };
  }
}

async function writeState(state: UserState) {
  await mkdir(dataRoot, { recursive: true });
  await writeFile(usersPath, JSON.stringify(state, null, 2), "utf8");
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, email: user.email, nickname: user.nickname, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
}

function safeProduct(input: Partial<SavedProduct>): SavedProduct | null {
  if (!input.name || !input.category || !input.reason) return null;
  return {
    id: typeof input.id === "string" && input.id.length <= 180 ? input.id : randomUUID(),
    name: input.name.slice(0, 180),
    category: input.category.slice(0, 100),
    reason: input.reason.slice(0, 700),
    image: input.image?.startsWith("/") ? input.image.slice(0, 260) : undefined,
    price: typeof input.price === "string" ? input.price.slice(0, 80) : undefined,
    rating: Number.isFinite(input.rating) ? Math.max(1, Math.min(5, Number(input.rating))) : undefined,
    savedAt: new Date().toISOString(),
  };
}

export async function getUserLibrary(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;
  return {
    favorites: user.favorites ?? [],
    history: user.recommendationHistory ?? [],
    consents: user.consents ?? { privacy: true, terms: true, analytics: false, updatedAt: user.createdAt },
  };
}

export async function toggleFavorite(userId: string, input: Partial<SavedProduct>) {
  const product = safeProduct(input);
  if (!product) return null;
  let result: SavedProduct[] | null = null;
  const task = writeQueue.then(async () => {
    const state = await readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) return;
    const favorites = user.favorites ?? [];
    const existing = favorites.findIndex((item) => item.name.toLowerCase() === product.name.toLowerCase());
    user.favorites = existing >= 0 ? favorites.filter((_, index) => index !== existing) : [product, ...favorites].slice(0, 40);
    result = user.favorites;
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return result;
}

export async function saveRecommendationHistory(userId: string, input: { query?: string; mode?: string; summary?: string; products?: Partial<SavedProduct>[] }) {
  const mode = input.mode === "hair" || input.mode === "perfume" ? input.mode : "skin";
  const products = (input.products ?? []).map(safeProduct).filter((item): item is SavedProduct => Boolean(item)).slice(0, 4);
  if (!input.query || !products.length) return null;
  let result: RecommendationHistory[] | null = null;
  const task = writeQueue.then(async () => {
    const state = await readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) return;
    const entry: RecommendationHistory = {
      id: randomUUID(), query: input.query!.slice(0, 1200), mode,
      summary: (input.summary ?? "Подборка сохранена.").slice(0, 700), products, createdAt: new Date().toISOString(),
    };
    user.recommendationHistory = [entry, ...(user.recommendationHistory ?? [])].slice(0, 20);
    result = user.recommendationHistory;
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return result;
}

export async function updateUserConsents(userId: string, input: Partial<Pick<UserConsents, "privacy" | "terms" | "analytics">>) {
  let result: UserConsents | null = null;
  const task = writeQueue.then(async () => {
    const state = await readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) return;
    user.consents = {
      privacy: typeof input.privacy === "boolean" ? input.privacy : user.consents?.privacy ?? true,
      terms: typeof input.terms === "boolean" ? input.terms : user.consents?.terms ?? true,
      analytics: typeof input.analytics === "boolean" ? input.analytics : user.consents?.analytics ?? false,
      updatedAt: new Date().toISOString(),
    };
    result = user.consents;
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return result;
}

export async function findUserByEmail(email: string) {
  const state = await readState();
  return state.users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const state = await readState();
  return state.users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: { email: string; nickname: string; password: string }): Promise<{ user: StoredUser | null; duplicate: boolean; verificationToken?: string }> {
  let created: StoredUser | null = null;
  let duplicate = false;
  const verificationToken = randomUUID().replaceAll("-", "");
  const task = writeQueue.then(async () => {
    const state = await readState();
    const email = input.email.trim().toLowerCase();
    if (state.users.some((user) => user.email === email)) {
      duplicate = true;
      return;
    }
    const salt = randomUUID().replaceAll("-", "");
    const now = new Date().toISOString();
    created = {
      id: randomUUID(),
      email,
      nickname: input.nickname.trim(),
      passwordSalt: salt,
      passwordHash: scryptSync(input.password, salt, 64).toString("hex"),
      createdAt: now,
      acceptedPrivacyAt: now,
      acceptedTermsAt: now,
      emailVerificationHash: createHash("sha256").update(verificationToken).digest("hex"),
      emailVerificationExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      favorites: [],
      recommendationHistory: [],
      consents: { privacy: true, terms: true, analytics: false, updatedAt: now },
    };
    state.users.push(created);
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return { user: created, duplicate, verificationToken: created ? verificationToken : undefined };
}

export async function verifyUserEmail(token: string) {
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const task = writeQueue.then(async () => {
    const state = await readState();
    const user = state.users.find((item) => item.emailVerificationHash === tokenHash);
    if (!user || !user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt).getTime() < Date.now()) return null;
    user.emailVerifiedAt = new Date().toISOString();
    delete user.emailVerificationHash;
    delete user.emailVerificationExpiresAt;
    await writeState(state);
    return user;
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}

export function verifyPassword(user: StoredUser, password: string) {
  const expected = Buffer.from(user.passwordHash, "hex");
  const actual = scryptSync(password, user.passwordSalt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function setUserAvatar(userId: string, avatarUrl: string) {
  let updated: StoredUser | null = null;
  const task = writeQueue.then(async () => {
    const state = await readState();
    const user = state.users.find((item) => item.id === userId);
    if (!user) return;
    user.avatarUrl = avatarUrl;
    updated = user;
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return updated;
}

export async function deleteUser(userId: string) {
  let deleted = false;
  const task = writeQueue.then(async () => {
    const state = await readState();
    const existing = state.users.find((user) => user.id === userId);
    const next = state.users.filter((user) => user.id !== userId);
    deleted = next.length !== state.users.length;
    if (deleted) {
      await writeState({ users: next });
      if (existing?.avatarUrl) {
        const fileName = path.basename(existing.avatarUrl);
        await unlink(path.join(dataRoot, "avatars", fileName)).catch(() => undefined);
      }
    }
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return deleted;
}

export function getUserDataRoot() {
  return dataRoot;
}
