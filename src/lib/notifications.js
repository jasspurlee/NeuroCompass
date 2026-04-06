const scheduledTimers = new Map();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll("-", "+").replaceAll("_", "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  return Notification.requestPermission();
}

export function scheduleBrowserNotification(reminder) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if (scheduledTimers.has(reminder.id)) {
    return;
  }

  const triggerAt = new Date(reminder.scheduled_for).getTime();
  const delay = triggerAt - Date.now();

  if (delay <= 0) {
    return;
  }

  const timerId = window.setTimeout(() => {
    new Notification(reminder.title, {
      body: `${reminder.category} reminder`,
      tag: `reminder-${reminder.id}`
    });
    scheduledTimers.delete(reminder.id);
  }, delay);

  scheduledTimers.set(reminder.id, timerId);
}

export function clearScheduledNotification(reminderId) {
  const timerId = scheduledTimers.get(reminderId);
  if (!timerId) {
    return;
  }

  window.clearTimeout(timerId);
  scheduledTimers.delete(reminderId);
}

export async function subscribeToPush(vapidPublicKey) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { subscription: null, reason: "unsupported" };
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    return { subscription: null, reason: permission };
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return { subscription: existingSubscription, reason: "existing" };
  }

  if (!vapidPublicKey) {
    return { subscription: null, reason: "missing-vapid-key" };
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
  });

  return { subscription, reason: "created" };
}

export async function getExistingPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromPush() {
  const subscription = await getExistingPushSubscription();
  if (!subscription) {
    return false;
  }

  await subscription.unsubscribe();
  return true;
}
