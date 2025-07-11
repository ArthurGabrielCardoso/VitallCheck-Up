import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carregar variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Expor variáveis de ambiente específicas (sem VITE_) de forma segura
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
      'import.meta.env.ADMIN_USERNAME': JSON.stringify(env.ADMIN_USERNAME),
      'import.meta.env.ADMIN_PASSWORD': JSON.stringify(env.ADMIN_PASSWORD),
      'import.meta.env.TINYMCE_API_KEY': JSON.stringify(env.TINYMCE_API_KEY),
      'import.meta.env.APP_URL': JSON.stringify(env.APP_URL),
      'import.meta.env.GOOGLE_PLACE_ID': JSON.stringify(env.GOOGLE_PLACE_ID),
    },
  }
});
