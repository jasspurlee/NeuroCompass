// Deploy with: supabase functions deploy send-reminder-push
// Required secrets:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - VAPID_PUBLIC_KEY
// - VAPID_PRIVATE_KEY
// - VAPID_SUBJECT

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:care@example.com";

const supabase = createClient(supabaseUrl, serviceRoleKey);

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json();
  const householdId = body.household_id;
  const reminderId = body.reminder_id;
  const title = body.title || "NeuroCompass reminder";
  const message = body.message || "You have a scheduled task.";
  const url = body.url || "/reminders";

  if (!householdId) {
    return Response.json({ error: "household_id is required" }, { status: 400 });
  }

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription")
    .eq("household_id", householdId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const payload = JSON.stringify({
    title,
    body: message,
    url,
    reminderId
  });

  const results = await Promise.allSettled(
    (subscriptions ?? []).map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, payload);
        return { endpoint: row.endpoint, delivered: true };
      } catch (pushError) {
        const statusCode = pushError.statusCode ?? 500;
        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        }

        return {
          endpoint: row.endpoint,
          delivered: false,
          statusCode,
          error: pushError.message
        };
      }
    })
  );

  return Response.json({
    delivered: results.filter((result) => result.status === "fulfilled").length,
    results
  });
});
