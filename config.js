/*
  CONFIGURAÇÃO DO PORTAL FCC

  1) OCR.Space
     - Use sua chave gratuita atual.

  2) Supabase
     - SUPABASE_URL: Project URL / Data API URL do projeto calculadora-fcc.
     - SUPABASE_PUBLISHABLE_KEY: chave pública sb_publishable_...

  A Publishable Key do Supabase pode ficar no frontend. A segurança dos dados
  é definida pelas permissões/RLS do SQL fornecido com o projeto.

  ATENÇÃO: a chave gratuita do OCR.Space também ficará visível no GitHub Pages.
  Neste modo simples, alguém que inspecione o código pode consumir a sua franquia OCR.
*/
window.FCC_CONFIG = {
  OCRSPACE_API_KEY: "K82786113188957",
  OCRSPACE_ENDPOINT: "https://api.ocr.space/parse/image",
  OCRSPACE_ENGINE: "3",

  SUPABASE_URL: "https://fxkjikfurlvfftpncunp.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_tla6br_lPVuEPBgsMFEDCw_58Pp-7jA"
};
