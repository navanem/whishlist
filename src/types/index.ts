export interface Child {
  id: string;
  name: string;
  avatar: string;
  color: string;
  birthdate?: string | null;
  created_at: string;
}

export interface Occasion {
  id: string;
  title: string;
  type: 'christmas' | 'birthday' | 'custom';
  year: number;
  is_active: number;
  created_at: string;
}

export interface Gift {
  id: string;
  child_id: string;
  occasion_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  product_url?: string | null;
  store_name?: string | null;
  price?: number | null;
  currency: string;
  priority: number; // 1: Petite idée, 2: Super envie, 3: Coup de cœur
  is_favorite: number;
  status: 'idea' | 'reserved' | 'bought' | 'received' | 'available';
  reserved_by?: string | null;
  reserved_at?: string | null;
  private_note?: string | null;
  created_at: string;
  child_name?: string;
  child_avatar?: string;
  child_color?: string;
  occasion_title?: string;
}

export interface Store {
  id: string;
  name: string;
  domain: string;
  search_url: string;
  icon: string;
  category: string;
  is_enabled: number;
}

export interface AppSettings {
  family_name: string;
  currency: string;
  share_token?: string;
}
