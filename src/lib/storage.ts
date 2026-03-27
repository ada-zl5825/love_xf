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

// Future implementation — swap the export below to use Supabase instead.
// class SupabaseProvider implements StorageProvider {
//   async getAcceptedAt() { /* fetch from supabase */ }
//   async setAcceptedAt(timestamp: string) { /* upsert to supabase */ }
//   async clearAcceptedAt() { /* delete from supabase */ }
// }

export const storage: StorageProvider = new LocalStorageProvider();
