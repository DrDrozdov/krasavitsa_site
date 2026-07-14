const internalUrl = (process.env.ANALYTICS_DIGEST_INTERNAL_URL ?? "http://krasavitsa:3000").replace(/\/$/, "");
const secret = process.env.TELEGRAM_ADMIN_BOT_SECRET ?? "";
const timeZone = process.env.ANALYTICS_TIME_ZONE ?? "Europe/Moscow";
const configuredTime = process.env.ANALYTICS_DIGEST_TIME ?? "21:05";

function scheduleParts() {
  const match = /^(\d{1,2}):(\d{2})$/.exec(configuredTime);
  const hour = Number(match?.[1]);
  const minute = Number(match?.[2]);
  if (!match || hour > 23 || minute > 59) throw new Error("ANALYTICS_DIGEST_TIME must use HH:MM");
  return { hour, minute };
}

function zonedClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { hour: Number(value.hour), minute: Number(value.minute), second: Number(value.second) };
}

function delayUntilNextRun() {
  const target = scheduleParts();
  const current = zonedClock();
  const targetSeconds = target.hour * 3600 + target.minute * 60;
  const currentSeconds = current.hour * 3600 + current.minute * 60 + current.second;
  const deltaSeconds = (targetSeconds - currentSeconds + 86400) % 86400 || 86400;
  return deltaSeconds * 1000;
}

async function deliver() {
  if (secret.length < 32) throw new Error("TELEGRAM_ADMIN_BOT_SECRET must contain at least 32 characters");
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${internalUrl}/api/telegram/admin/digest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!response.ok) throw new Error(`Digest endpoint returned ${response.status}`);
      console.log(`[digest-scheduler] delivered at ${new Date().toISOString()}`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 15000));
    }
  }
  throw lastError;
}

function schedule() {
  const delay = delayUntilNextRun();
  console.log(`[digest-scheduler] next run in ${Math.round(delay / 60000)} minutes (${configuredTime} ${timeZone})`);
  setTimeout(async () => {
    try {
      await deliver();
    } catch (error) {
      console.error("[digest-scheduler] delivery failed", error);
    } finally {
      schedule();
    }
  }, delay);
}

schedule();
