import { supabase } from "./supabase";

const ACCEPTED_AT_KEY = "love_xf_accepted_at";

export interface StorageProvider {
  getAcceptedAt(): Promise<string | null>;
  setAcceptedAt(timestamp: string): Promise<void>;
  clearAcceptedAt(): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  async getAcceptedAt(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCEPTED_AT_KEY);
  }

  async setAcceptedAt(timestamp: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCEPTED_AT_KEY, timestamp);
  }

  async clearAcceptedAt(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCEPTED_AT_KEY);
  }
}

const local = new LocalStorageProvider();

class SupabaseProvider implements StorageProvider {
  async getAcceptedAt(): Promise<string | null> {
    const cached = await local.getAcceptedAt();
    if (cached) return cached;

    try {
      const { data } = await supabase
        .from("accepted")
        .select("accepted_at")
        .eq("id", 1)
        .single();

      if (data?.accepted_at) {
        const ts = data.accepted_at as string;
        await local.setAcceptedAt(ts);
        return ts;
      }
    } catch {
      // offline or table empty — fall through
    }
    return null;
  }

  async setAcceptedAt(timestamp: string): Promise<void> {
    await local.setAcceptedAt(timestamp);

    try {
      await supabase
        .from("accepted")
        .upsert({ id: 1, accepted_at: timestamp }, { onConflict: "id" });
    } catch {
      // offline — local cache is already set
    }
  }

  async clearAcceptedAt(): Promise<void> {
    await local.clearAcceptedAt();

    try {
      await supabase.from("accepted").delete().eq("id", 1);
    } catch {
      // offline
    }
  }
}

export const storage: StorageProvider = new SupabaseProvider();
