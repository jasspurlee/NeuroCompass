import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { hasSupabaseConfig, supabase } from "../lib/supabase";
import {
  getExistingPushSubscription,
  clearScheduledNotification,
  scheduleBrowserNotification,
  subscribeToPush,
  unsubscribeFromPush
} from "../lib/notifications";

const AppDataContext = createContext(null);

const starterReminders = [
  {
    id: "1",
    title: "Morning medication",
    category: "Medication",
    scheduled_for: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    completed: false,
    created_by: "self"
  },
  {
    id: "2",
    title: "Physical therapy visit",
    category: "Appointment",
    scheduled_for: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    completed: false,
    created_by: "caregiver"
  }
];

const starterNotes = [
  {
    id: "1",
    content: "Talked with Sam about lunch tomorrow.",
    created_at: new Date(Date.now() - 75 * 60 * 1000).toISOString()
  }
];

const starterInvites = [];

function createInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function sortReminders(items) {
  return [...items].sort(
    (left, right) =>
      new Date(left.scheduled_for).getTime() - new Date(right.scheduled_for).getTime()
  );
}

export function AppDataProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "Guest User",
    role: "survivor",
    linked_household: "default-home"
  });
  const [reminders, setReminders] = useState(starterReminders);
  const [notes, setNotes] = useState(starterNotes);
  const [invites, setInvites] = useState(starterInvites);
  const [pushSubscription, setPushSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(
    hasSupabaseConfig
      ? "Connected to Supabase."
      : "Demo mode. Add Supabase keys to enable syncing."
  );

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      starterReminders.forEach(scheduleBrowserNotification);
      return undefined;
    }

    let mounted = true;

    async function bootstrap() {
      const { data: authData } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(authData.session);
      if (!authData.session?.user) {
        setLoading(false);
        setStatus("Sign in to sync reminders with Supabase.");
        return;
      }

      const profileResult = await supabase
        .from("profiles")
        .select("full_name, role, linked_household")
        .eq("id", authData.session.user.id)
        .maybeSingle();

      if (profileResult.data) {
        setProfile(profileResult.data);
      }
      const existingPushSubscription = await getExistingPushSubscription();
      if (existingPushSubscription) {
        setPushSubscription(existingPushSubscription);
      }
      const activeHousehold = profileResult.data?.linked_household || "default-home";
      const [remindersResult, notesResult, invitesResult] = await Promise.all([
        supabase
          .from("reminders")
          .select("*")
          .eq("household_id", activeHousehold)
          .order("scheduled_for", { ascending: true }),
        supabase
          .from("conversation_notes")
          .select("*")
          .eq("household_id", activeHousehold)
          .order("created_at", { ascending: false }),
        supabase
          .from("caregiver_invites")
          .select("*")
          .eq("household_id", activeHousehold)
          .order("created_at", { ascending: false })
      ]);

      if (remindersResult.data) {
        setReminders(sortReminders(remindersResult.data));
        remindersResult.data.forEach(scheduleBrowserNotification);
      }
      if (notesResult.data) {
        setNotes(notesResult.data);
      }
      if (invitesResult.data) {
        setInvites(invitesResult.data);
      }
      setLoading(false);
    }

    bootstrap().catch((error) => {
      setStatus(error.message);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile({
          full_name: "Guest User",
          role: "survivor",
          linked_household: "default-home"
        });
        setInvites(starterInvites);
        setPushSubscription(null);
        return;
      }

      supabase
        .from("profiles")
        .select("full_name, role, linked_household")
        .eq("id", nextSession.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfile(data);

            supabase
              .from("caregiver_invites")
              .select("*")
              .eq("household_id", data.linked_household)
              .order("created_at", { ascending: false })
              .then(({ data: inviteData }) => {
                if (inviteData) {
                  setInvites(inviteData);
                }
              });
          }
        });
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const nextTask = reminders.find(
      (item) => !item.completed && new Date(item.scheduled_for).getTime() >= Date.now()
    );
    const lastCompletedTask = [...reminders]
      .filter((item) => item.completed)
      .sort(
        (left, right) =>
          new Date(right.scheduled_for).getTime() - new Date(left.scheduled_for).getTime()
      )[0];

    async function addReminder(payload) {
      const reminder = {
        id: crypto.randomUUID(),
        completed: false,
        created_by: profile.role,
        household_id: profile.linked_household,
        ...payload
      };

      setReminders((current) => sortReminders([...current, reminder]));
      scheduleBrowserNotification(reminder);

      if (hasSupabaseConfig) {
        const { error } = await supabase.from("reminders").insert(reminder);
        if (error) {
          setStatus(error.message);
        }
      }
    }

    async function completeReminder(id) {
      clearScheduledNotification(id);
      setReminders((current) =>
        current.map((item) => (item.id === id ? { ...item, completed: true } : item))
      );

      if (hasSupabaseConfig) {
        const { error } = await supabase
          .from("reminders")
          .update({ completed: true })
          .eq("id", id);
        if (error) {
          setStatus(error.message);
        }
      }
    }

    async function addNote(content) {
      const note = {
        id: crypto.randomUUID(),
        content,
        household_id: profile.linked_household,
        created_at: new Date().toISOString()
      };

      setNotes((current) => [note, ...current]);

      if (hasSupabaseConfig) {
        const { error } = await supabase.from("conversation_notes").insert(note);
        if (error) {
          setStatus(error.message);
        }
      }
    }

    async function signIn(email, password) {
      if (!hasSupabaseConfig) {
        setStatus("Demo mode only. Add Supabase credentials for authentication.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus(error.message);
        return;
      }

      await ensureProfile();
    }

    async function signUp(email, password, fullName, role = "survivor") {
      if (!hasSupabaseConfig) {
        setStatus("Demo mode only. Add Supabase credentials for authentication.");
        return;
      }

      const householdCode = createInviteCode();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            linked_household: householdCode
          }
        }
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("Account created. Check email verification settings in Supabase if sign-in is delayed.");
      if (data.user) {
        await upsertProfile(data.user.id, {
          full_name: fullName,
          role,
          linked_household: householdCode
        });
      }
    }

    async function signOut() {
      if (!hasSupabaseConfig) {
        setSession(null);
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        setStatus(error.message);
      }
    }

    async function savePushSubscription(subscription) {
      if (!hasSupabaseConfig || !session?.user) {
        setPushSubscription(subscription);
        return true;
      }

      const payload = {
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        household_id: profile.linked_household,
        user_id: session.user.id
      };

      const { error } = await supabase.from("push_subscriptions").upsert(payload, {
        onConflict: "endpoint"
      });

      if (error) {
        setStatus(error.message);
        return false;
      }

      setPushSubscription(subscription);
      return true;
    }

    async function enablePushNotifications() {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const { subscription, reason } = await subscribeToPush(vapidPublicKey);

      if (!subscription) {
        const messageByReason = {
          unsupported: "This device does not support web push notifications.",
          denied: "Notification permission was denied.",
          default: "Notification permission was dismissed.",
          "missing-vapid-key": "Add VITE_VAPID_PUBLIC_KEY to enable remote push.",
          granted: "Notification permission granted, but subscription was not created."
        };
        setStatus(messageByReason[reason] || "Could not enable push notifications.");
        return false;
      }

      const saved = await savePushSubscription(subscription);
      if (saved) {
        setStatus("Device alerts enabled.");
      }
      return saved;
    }

    async function disablePushNotifications() {
      const subscription = await getExistingPushSubscription();
      if (!subscription) {
        setPushSubscription(null);
        setStatus("Device alerts are already off.");
        return true;
      }

      if (hasSupabaseConfig) {
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        if (error) {
          setStatus(error.message);
          return false;
        }
      }

      await unsubscribeFromPush();
      setPushSubscription(null);
      setStatus("Device alerts turned off.");
      return true;
    }

    async function upsertProfile(userId, nextProfile) {
      if (!hasSupabaseConfig) {
        setProfile((current) => ({ ...current, ...nextProfile }));
        return;
      }

      const payload = {
        id: userId,
        full_name: nextProfile.full_name,
        role: nextProfile.role,
        linked_household: nextProfile.linked_household
      };

      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) {
        setStatus(error.message);
        return;
      }

      setProfile(payload);
    }

    async function ensureProfile() {
      if (!hasSupabaseConfig) {
        return;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role, linked_household")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        return;
      }

      const fallbackProfile = {
        full_name: user.user_metadata.full_name || "NeuroCompass User",
        role: user.user_metadata.role || "survivor",
        linked_household: user.user_metadata.linked_household || createInviteCode()
      };

      await upsertProfile(user.id, fallbackProfile);
    }

    async function createCaregiverInvite() {
      const invite = {
        id: crypto.randomUUID(),
        invite_code: createInviteCode(),
        household_id: profile.linked_household,
        created_by: profile.full_name || "NeuroCompass User",
        created_at: new Date().toISOString(),
        used_at: null
      };

      setInvites((current) => [invite, ...current]);

      if (hasSupabaseConfig) {
        const { error } = await supabase.from("caregiver_invites").insert(invite);
        if (error) {
          setInvites((current) => current.filter((item) => item.id !== invite.id));
          setStatus(error.message);
          return null;
        }
      }

      setStatus("Caregiver invite ready to share.");
      return invite;
    }

    async function joinHousehold(inviteCode) {
      const normalizedCode = inviteCode.trim().toUpperCase();
      if (!normalizedCode) {
        return false;
      }

      if (!hasSupabaseConfig) {
        setProfile((current) => ({
          ...current,
          role: "caregiver",
          linked_household: normalizedCode
        }));
        setStatus("Demo mode: joined the shared household locally.");
        return true;
      }

      const { data: invite, error } = await supabase
        .from("caregiver_invites")
        .select("*")
        .eq("invite_code", normalizedCode)
        .maybeSingle();

      if (error || !invite) {
        setStatus(error?.message || "Invite code not found.");
        return false;
      }

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("Sign in before joining a shared household.");
        return false;
      }

      await upsertProfile(user.id, {
        full_name: profile.full_name,
        role: "caregiver",
        linked_household: invite.household_id
      });

      await supabase
        .from("caregiver_invites")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invite.id);

      const [remindersResult, notesResult, invitesResult] = await Promise.all([
        supabase
          .from("reminders")
          .select("*")
          .eq("household_id", invite.household_id)
          .order("scheduled_for", { ascending: true }),
        supabase
          .from("conversation_notes")
          .select("*")
          .eq("household_id", invite.household_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("caregiver_invites")
          .select("*")
          .eq("household_id", invite.household_id)
          .order("created_at", { ascending: false })
      ]);

      if (remindersResult.data) {
        setReminders(sortReminders(remindersResult.data));
      }
      if (notesResult.data) {
        setNotes(notesResult.data);
      }
      if (invitesResult.data) {
        setInvites(invitesResult.data);
      }

      setStatus("Joined the shared household.");
      return true;
    }

    return {
      session,
      profile,
      setProfile,
      reminders,
      notes,
      invites,
      pushSubscription,
      nextTask,
      lastCompletedTask,
      addReminder,
      completeReminder,
      addNote,
      signIn,
      signUp,
      signOut,
      createCaregiverInvite,
      joinHousehold,
      enablePushNotifications,
      disablePushNotifications,
      loading,
      status
    };
  }, [invites, loading, notes, profile, pushSubscription, reminders, session, status]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}
