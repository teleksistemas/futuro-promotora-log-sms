import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fetch } from "undici";

// Simple .env loader (avoids extra dependency)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnv();

type Query = {
  phone: string;
  pages?: number; // max pages to scan
  startSkip?: number; // initial skip
  max?: number; // max messages to scan
};

type CommandResponse = {
  resource?: {
    items?: Array<{
      id?: string;
      to?: string;
      [key: string]: unknown;
    }>;
  };
};

type NotificationResponse = {
  resource?: unknown;
};

const MSGING_HOST = process.env.MSGING_HOST ?? "https://futuropromotora.http.msging.net";
const RAW_MSGING_KEY = process.env.MSGING_KEY?.trim();
const MSGING_KEY = RAW_MSGING_KEY || undefined;
const AUTHORIZATION =
  MSGING_KEY && (MSGING_KEY.startsWith("Key ") ? MSGING_KEY : `Key ${MSGING_KEY}`);
const PAGE_SIZE = Number(process.env.MSGING_TAKE ?? "50");
const DEFAULT_SKIP = Number(process.env.MSGING_SKIP ?? "0");

if (!AUTHORIZATION) {
  throw new Error("Defina MSGING_KEY no ambiente com a sua chave Authorization");
}

const app = fastify({ logger: true });

// Serve frontend static build (Next.js export) from frontend/out
const frontendOutDir = path.resolve(process.cwd(), "frontend", "out");
app.register(fastifyStatic, {
  root: frontendOutDir,
  prefix: "/",
});

// Basic CORS to allow the Next.js frontend (usually running on another port) to call the API.
app.options("*", async (_request, reply) => {
  return reply
    .header("Access-Control-Allow-Origin", "*")
    .header("Access-Control-Allow-Methods", "GET,OPTIONS")
    .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    .code(204)
    .send();
});

app.addHook("onSend", (_request, reply, _payload, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET,OPTIONS");
  reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  done();
});

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D+/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `+${withCountry}@sms.gw.msging.net`;
}

async function fetchMessages(skip: number): Promise<CommandResponse> {
  const payload = {
    id: randomUUID(),
    to: "postmaster@msging.net",
    method: "get",
    uri: `/messages?$skip=${skip}&$take=${PAGE_SIZE}`,
  };

  const res = await fetch(`${MSGING_HOST}/commands`, {
    method: "POST",
    headers: {
      Authorization: AUTHORIZATION as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BLiP retornou ${res.status}: ${text}`);
  }

  return (await res.json()) as CommandResponse;
}

async function fetchNotification(messageId: string): Promise<NotificationResponse> {
  const payload = {
    id: randomUUID(),
    to: "postmaster@msging.net",
    method: "get",
    uri: `/notifications?id=${messageId}`,
  };

  const res = await fetch(`${MSGING_HOST}/commands`, {
    method: "POST",
    headers: {
      Authorization: AUTHORIZATION as string,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BLiP notificacoes retornou ${res.status}: ${text}`);
  }

  return (await res.json()) as NotificationResponse;
}

app.get("/message-id", async (request, reply) => {
  const { phone, pages = 50, startSkip = DEFAULT_SKIP, max = 5000 } = request.query as Query;

  if (!phone) {
    reply.code(400);
    return { error: "Parâmetro phone é obrigatório" };
  }

  const targetTo = normalizePhone(phone);
  let skip = startSkip;
  let scanned = 0;
  const maxPages = Math.max(1, pages);
  const maxMessages = Math.max(1, max);

  for (let i = 0; i < maxPages && scanned < maxMessages; i++) {
    const data = await fetchMessages(skip);
    const items = data?.resource?.items ?? [];

    const found = items.find((m) => m.to === targetTo);
    if (found?.id) {
      const notification = await fetchNotification(found.id);
      return { id: found.id, to: targetTo, skip, notification };
    }

    const count = items.length;
    scanned += count;
    if (!count) break;
    skip += count;
  }

  reply.code(404);
  return { error: `Telefone ${targetTo} não encontrado`, scanned, lastSkip: skip };
});

const port = Number(process.env.PORT ?? 8000);
const host = process.env.HOST ?? "0.0.0.0";

app
  .listen({ port, host })
  .then(() => app.log.info(`API ouvindo em http://${host}:${port}`))
  .catch((err) => {
    app.log.error(err, "Falha ao subir o servidor");
    process.exit(1);
  });
