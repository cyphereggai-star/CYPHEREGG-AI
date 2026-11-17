export type Tier = 'free' | 'pro' | 'enterprise';

export type GenerationMode = 'generate' | 'analyze';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  tier: Tier;
  stripe_customer_id: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  mode: GenerationMode;
  language: string;
  prompt: string;
  result: string;
  status: 'completed' | 'failed';
  created_at: string;
}

export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'html'
  | 'sql';

export interface AuthErrorShape {
  message: string;
}
