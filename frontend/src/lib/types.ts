export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseConnection {
  id: string;
  workspace_id: string;
  db_type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  extra_params: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  database_connection?: DatabaseConnection | null;
}

export interface Chat {
  id: string;
  title: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  metadata_json?: {
    sql?: string | null;
    results?: Record<string, unknown>[] | null;
    error?: string | null;
  } | null;
  created_at: string;
}
