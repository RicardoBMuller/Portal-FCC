/*
  PORTAL FCC V18 — PWA + PUSH

  Preencha os valores antes de publicar.
  A Publishable Key do Supabase e a VAPID Public Key podem ficar no frontend.
  NUNCA use Secret Key, service_role ou VAPID Private Key no GitHub Pages.
*/
window.FCC_CONFIG = {
  OCRSPACE_API_KEY: "COLE_AQUI_SUA_CHAVE_OCR_SPACE",
  OCRSPACE_ENDPOINT: "https://api.ocr.space/parse/image",
  OCRSPACE_ENGINE: "3",

  SUPABASE_URL: "COLE_AQUI_SUA_PROJECT_URL_DO_SUPABASE",
  SUPABASE_PUBLISHABLE_KEY: "COLE_AQUI_SUA_PUBLISHABLE_KEY_DO_SUPABASE",

  // Chave pública gerada pelo comando: npx web-push generate-vapid-keys
  // A chave privada deve ser guardada somente nos Secrets do Supabase.
  VAPID_PUBLIC_KEY: "COLE_AQUI_SUA_VAPID_PUBLIC_KEY"
};
