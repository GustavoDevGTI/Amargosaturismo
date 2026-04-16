import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

const EVENTS_TABLE = "calendar_events";
const IMAGES_BUCKET = "calendar-event-images";
const DEFAULT_RETENTION_MONTHS = 2;
const MAX_RETENTION_MONTHS = 24;
const LIST_PAGE_SIZE = 100;
const UPDATE_BATCH_SIZE = 500;

type CleanupEventRow = {
  id: string;
  event_date: string;
  image_url: string | null;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Use POST." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ error: "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configurados." }, 500);
    }

    const payload = await parseJson(request);
    const retentionMonths = normalizeRetentionMonths(payload.retentionMonths);
    const cutoffDate = subtractMonths(new Date(), retentionMonths).toISOString().slice(0, 10);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: events, error: eventsError } = await admin
      .from(EVENTS_TABLE)
      .select("id, event_date, image_url")
      .not("image_url", "is", null)
      .lt("event_date", cutoffDate);

    if (eventsError) {
      return jsonResponse({ error: "Falha ao consultar eventos.", details: eventsError.message }, 500);
    }

    const cleanupEvents = (events || []) as CleanupEventRow[];
    if (!cleanupEvents.length) {
      return jsonResponse({
        ok: true,
        message: "Nenhum evento expirado com imagem para limpar.",
        retentionMonths,
        cutoffDate,
        deletedFiles: 0,
        clearedEvents: 0,
      });
    }

    const expiredDatePrefixes = Array.from(
      new Set(cleanupEvents.map((eventItem) => eventItem.event_date).filter(Boolean)),
    );

    let deletedFiles = 0;
    for (const prefix of expiredDatePrefixes) {
      deletedFiles += await deleteObjectsByDatePrefix(admin, prefix);
    }

    const eventIds = cleanupEvents.map((eventItem) => eventItem.id).filter(Boolean);
    let clearedEvents = 0;
    for (let index = 0; index < eventIds.length; index += UPDATE_BATCH_SIZE) {
      const batch = eventIds.slice(index, index + UPDATE_BATCH_SIZE);
      const { data: updatedRows, error: updateError } = await admin
        .from(EVENTS_TABLE)
        .update({ image_url: null })
        .in("id", batch)
        .select("id");

      if (updateError) {
        return jsonResponse({ error: "Falha ao limpar image_url dos eventos.", details: updateError.message }, 500);
      }

      clearedEvents += Array.isArray(updatedRows) ? updatedRows.length : batch.length;
    }

    return jsonResponse({
      ok: true,
      retentionMonths,
      cutoffDate,
      deletedFiles,
      clearedEvents,
      expiredDates: expiredDatePrefixes.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonResponse({ error: "Falha inesperada no cleanup.", details: message }, 500);
  }
});

async function deleteObjectsByDatePrefix(admin: ReturnType<typeof createClient>, datePrefix: string): Promise<number> {
  let offset = 0;
  let removedCount = 0;

  while (true) {
    const { data: listedObjects, error: listError } = await admin.storage
      .from(IMAGES_BUCKET)
      .list(datePrefix, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      throw new Error(`Falha ao listar objetos do prefixo ${datePrefix}: ${listError.message}`);
    }

    const objects = listedObjects || [];
    if (!objects.length) {
      break;
    }

    const objectPaths = objects
      .filter((objectItem) => objectItem.name && objectItem.id)
      .map((objectItem) => `${datePrefix}/${objectItem.name}`);

    if (objectPaths.length) {
      const { error: removeError } = await admin.storage.from(IMAGES_BUCKET).remove(objectPaths);
      if (removeError) {
        throw new Error(`Falha ao remover objetos do prefixo ${datePrefix}: ${removeError.message}`);
      }
      removedCount += objectPaths.length;
    }

    if (objects.length < LIST_PAGE_SIZE) {
      break;
    }

    offset += LIST_PAGE_SIZE;
  }

  return removedCount;
}

async function parseJson(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch (_error) {
    return {};
  }
}

function normalizeRetentionMonths(value: unknown): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_RETENTION_MONTHS;
  }

  const rounded = Math.floor(numericValue);
  if (rounded < 1) {
    return DEFAULT_RETENTION_MONTHS;
  }
  if (rounded > MAX_RETENTION_MONTHS) {
    return MAX_RETENTION_MONTHS;
  }
  return rounded;
}

function subtractMonths(baseDate: Date, months: number): Date {
  const nextDate = new Date(baseDate.getTime());
  nextDate.setUTCMonth(nextDate.getUTCMonth() - months);
  return nextDate;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders,
  });
}
