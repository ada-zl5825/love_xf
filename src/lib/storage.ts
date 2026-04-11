import { supabase } from "./supabase";
import type { Message } from "@/types";

export interface StorageProvider {
  getAcceptedAt(): Promise<string | null>;
  setAcceptedAt(timestamp: string): Promise<void>;
  clearAcceptedAt(): Promise<void>;
  getMessages(): Promise<Message[]>;
  addMessage(author: string, content: string, color: number): Promise<Message | null>;
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

  async getMessages(): Promise<Message[]> {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    return (data as Message[]) ?? [];
  }

  async addMessage(
    author: string,
    content: string,
    color: number,
  ): Promise<Message | null> {
    const { data } = await supabase
      .from("messages")
      .insert({ author, content, color })
      .select()
      .single();

    return (data as Message) ?? null;
  }
}

export const storage: StorageProvider = new SupabaseProvider();
