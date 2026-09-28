// Configuração pública do Supabase.
// A chave "publishable" é projetada para uso no navegador — a segurança real
// está nas políticas de RLS e no hook de validação no banco (nunca exponha a service_role).
export const SUPABASE_URL = "https://xsoxsxqgscmlvwggidmq.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_prwvpur0FwpEKRKUlY2_eQ_D-z8dwk1";

// Captcha (Cloudflare Turnstile). A site key é pública. Deixe vazio para desativar o captcha no app.
// Ative o captcha no Supabase (Auth → Attack Protection) só depois de preencher esta chave.
export const TURNSTILE_SITE_KEY = "";
