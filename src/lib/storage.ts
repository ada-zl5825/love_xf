import { supabase } from "./supabase";

export interface StorageProvider {
  getAcceptedAt(): Promise<string | null>;
  setAcceptedAt(timestamp: string): Promise<void>;
  clearAcceptedAt(): Promise<void>;
}

class SupabaseProvider implements StorageProvider {
  async getAcceptedAt(): Promise<string | null> {
    const { data } = await supabase
      .from("accepted")
      .select("accepted_at")
      .eq("id", 1)
      .single();

    return (data?.accepted_at as string) ?? null;
  }

  async setAcceptedAt(timestamp: string): Promise<void> {
    await supabase
      .from("accepted")
      .upsert({ id: 1, accepted_at: timestamp }, { onConflict: "id" });
  }

  async clearAcceptedAt(): Promise<void> {
    await supabase.from("accepted").delete().eq("id", 1);
  }
}

export const storage: StorageProvider = new SupabaseProvider();
