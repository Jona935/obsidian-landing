import { createClient } from '@supabase/supabase-js';

// Types for database tables
export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table_type: 'general' | 'vip' | 'booth';
  notes: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export interface MenuItem {
  id: string;
  category: 'cocktails' | 'shots' | 'bottles' | 'food';
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  available: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  dj_name: string;
  event_date: string;
  event_time: string | null;
  genre: string | null;
  image_url: string | null;
  spotify_url: string | null;
  featured: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  event_date: string | null;
  featured: boolean;
  created_at: string;
}

export interface ChatLog {
  id: string;
  session_id: string | null;
  user_message: string;
  bot_response: string;
  intent: 'reservation' | 'menu' | 'dj_info' | 'general' | null;
  created_at: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, 'id' | 'created_at'>;
        Update: Partial<Omit<Reservation, 'id' | 'created_at'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at'>;
        Update: Partial<Omit<MenuItem, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      gallery: {
        Row: GalleryImage;
        Insert: Omit<GalleryImage, 'id' | 'created_at'>;
        Update: Partial<Omit<GalleryImage, 'id' | 'created_at'>>;
      };
      chat_logs: {
        Row: ChatLog;
        Insert: Omit<ChatLog, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatLog, 'id' | 'created_at'>>;
      };
    };
  };
}

// Create Supabase client for client-side usage
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create Supabase client for server-side usage
export const createServerClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Singleton for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: always create new client
    return createServerClient();
  }
  
  // Client-side: use singleton
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
};
