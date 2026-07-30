/*
  PORTAL FCC V18 — PWA + PUSH

  Preencha os valores antes de publicar.
  A Publishable Key do Supabase e a VAPID Public Key podem ficar no frontend.
  NUNCA use Secret Key, service_role ou VAPID Private Key no GitHub Pages.
*/
window.FCC_CONFIG = {
  OCRSPACE_API_KEY: "K82786113188957",
  OCRSPACE_ENDPOINT: "https://api.ocr.space/parse/image",
  OCRSPACE_ENGINE: "3",

  SUPABASE_URL: "https://fxkjikfurlvfftpncunp.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_tla6br_lPVuEPBgsMFEDCw_58Pp-7jA",

  // Chave pública gerada pelo comando: npx web-push generate-vapid-keys
  // A chave privada deve ser guardada somente nos Secrets do Supabase.
  VAPID_PUBLIC_KEY: "BAib7Cx76y9ik8ugrssm4Ccpp2T3R0zvK9qH9rSHd-NGcTDs8GaHfwLySnDacPNAlmtrJfem_EbscTuEbWGy2jY"
};
