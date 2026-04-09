import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Nosso Apê",
        short_name: "NossoApê",
        description: "Encontre o lar perfeito juntos",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    // Dev-only: proxy for link extraction (bypasses CORS)
    {
      name: "extract-proxy",
      configureServer(server) {
        server.middlewares.use("/api/extract", async (req, res) => {
          if (req.method === "OPTIONS") {
            res.writeHead(200)
            res.end()
            return
          }

          let body = ""
          req.on("data", (chunk: Buffer) => { body += chunk.toString() })
          req.on("end", async () => {
            try {
              const { url } = JSON.parse(body)
              if (!url) {
                res.writeHead(400, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: "URL is required" }))
                return
              }

              const response = await fetch(url, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  "Accept": "text/html,application/xhtml+xml",
                  "Accept-Language": "pt-BR,pt;q=0.9",
                },
              })

              const html = await response.text()

              res.writeHead(200, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ html }))
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Fetch failed"
              res.writeHead(500, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ error: message }))
            }
          })
        })
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    strictPort: true, // fail if port is taken instead of silently picking another
  },
})
