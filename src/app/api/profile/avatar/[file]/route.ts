import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUserDataRoot } from "@/lib/user-store";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const { file } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/i.test(file)) return new NextResponse(null, { status: 404 });
  try {
    const data = await readFile(path.join(getUserDataRoot(), "avatars", file));
    const type = file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return new NextResponse(data, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=86400" } });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
