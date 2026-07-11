import "server-only";

import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
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
};

export type PublicUser = Pick<StoredUser, "id" | "email" | "nickname" | "avatarUrl" | "createdAt">;

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

export async function findUserByEmail(email: string) {
  const state = await readState();
  return state.users.find((user) => user.email === email.trim().toLowerCase()) ?? null;
}

export async function findUserById(id: string) {
  const state = await readState();
  return state.users.find((user) => user.id === id) ?? null;
}

export async function createUser(input: { email: string; nickname: string; password: string }): Promise<{ user: StoredUser | null; duplicate: boolean }> {
  let created: StoredUser | null = null;
  let duplicate = false;
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
    };
    state.users.push(created);
    await writeState(state);
  });
  writeQueue = task.catch(() => undefined);
  await task;
  return { user: created, duplicate };
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
