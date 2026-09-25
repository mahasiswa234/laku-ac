
import 'dotenv/config';

import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./src/server/routes/api";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());

app.use(express.json({
  limit: "25mb",
}));

app.use(express.urlencoded({
  limit: "25mb",
  extended: true,
}));

// API Routes
app.use("/api", apiRoutes);

/**
 * Development:
 * Jalankan Vite sebagai middleware agar React dan API
 * tetap berjalan melalui localhost:3000.
 *
 * Production/Vercel:
 * Vercel menangani Express sebagai serverless function,
 * sehingga Vite middleware tidak dijalankan di sini.
 */
async function configureServer() {
  if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    // Support React Router
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

/**
 * Local development.
 *
 * Vercel tidak menjalankan app.listen().
 */
async function startServer() {
  await configureServer();

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

// Jalankan server lokal
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Export Express app untuk Vercel
export default app;

