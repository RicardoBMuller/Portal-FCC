import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type PushEventRecord = {
  id: string;
  user_id: string;
  actor_user_id?: string | null;
  project_id?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  event_type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  created_at?: string;
};

type WebhookPayload = {
  type?: "INSERT" | "UPDATE" | "DELETE";
  table?: string;
  schema?: string;
  record?: PushEventRecord;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const webhookSecret = Deno.env.get("PUSH_WEBHOOK_SECRET") || "";
  if (webhookSecret && request.headers.get("x-webhook-secret") !== webhookSecret) {
    return json({ error: "INVALID_WEBHOOK_SECRET" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:portal-fcc@example.com";
  const appUrl = (Deno.env.get("APP_URL") || "https://ricardobmuller.github.io/Portal-FCC/").replace(/\/?$/, "/");

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return json({ error: "MISSING_SERVER_SECRETS" }, 500);
  }

  let payload: WebhookPayload;
  try { payload = await request.json(); }
  catch { return json({ error: "INVALID_JSON" }, 400); }

  const event = payload.record || (payload as unknown as PushEventRecord);
  if (!event?.id || !event.user_id) return json({ error: "INVALID_EVENT" }, 400);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("fcc_push_subscriptions")
    .select("id,endpoint,p256dh,auth_key")
    .eq("user_id", event.user_id)
    .eq("enabled", true);

  if (subscriptionsError) {
    await supabase.from("fcc_push_events").update({ last_error: subscriptionsError.message }).eq("id", event.id);
    return json({ error: subscriptionsError.message }, 500);
  }

  if (!subscriptions?.length) {
    await supabase.from("fcc_push_events").update({
      dispatched_at: new Date().toISOString(),
      delivery_count: 0,
      failed_count: 0,
      last_error: "NO_ACTIVE_SUBSCRIPTIONS",
    }).eq("id", event.id);
    return json({ ok: true, delivered: 0, reason: "NO_ACTIVE_SUBSCRIPTIONS" });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const relativeUrl = String(event.data?.url || "./");
  const notificationUrl = new URL(relativeUrl, appUrl).href;
  const notificationPayload = JSON.stringify({
    title: event.title || "Portal FCC",
    body: event.body || "Há uma nova atualização em um projeto do qual você participa.",
    icon: new URL("icons/icon-192.png", appUrl).href,
    badge: new URL("icons/badge-96.png", appUrl).href,
    tag: `fcc-${event.event_type}-${event.id}`,
    renotify: true,
    timestamp: event.created_at ? new Date(event.created_at).getTime() : Date.now(),
    data: {
      ...(event.data || {}),
      url: notificationUrl,
      event_id: event.id,
      event_type: event.event_type,
      project_id: event.project_id || null,
      entity_type: event.entity_type || null,
      entity_id: event.entity_id || null,
    },
  });

  let delivered = 0;
  let failed = 0;
  const errors: string[] = [];
  const invalidSubscriptionIds: string[] = [];

  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth_key },
      }, notificationPayload, { TTL: 60 * 60 * 24, urgency: event.event_type === "chat_message" ? "high" : "normal" });
      delivered += 1;
    } catch (error) {
      failed += 1;
      const statusCode = Number((error as { statusCode?: number }).statusCode || 0);
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${statusCode || "ERR"}: ${message}`);
      if (statusCode === 404 || statusCode === 410) invalidSubscriptionIds.push(subscription.id);
    }
  }));

  if (invalidSubscriptionIds.length) {
    await supabase.from("fcc_push_subscriptions").update({ enabled: false, updated_at: new Date().toISOString() }).in("id", invalidSubscriptionIds);
  }

  await supabase.from("fcc_push_events").update({
    dispatched_at: new Date().toISOString(),
    delivery_count: delivered,
    failed_count: failed,
    last_error: errors.length ? errors.join(" | ").slice(0, 2000) : null,
  }).eq("id", event.id);

  return json({ ok: true, delivered, failed, invalid_subscriptions: invalidSubscriptionIds.length });
});
