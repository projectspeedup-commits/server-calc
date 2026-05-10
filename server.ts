import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, "arsenal.db"));

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'manager',
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calculations (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    payload TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`);

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Seed Admin User
async function seedAdmin() {
  try {
    const userCount: any = db.prepare("SELECT count(*) as count FROM users").get();
    if (userCount.count === 0) {
      console.log("--- Инициализация базы данных: Создание администратора ---");
      const hashedPassword = await bcrypt.hash("admin", 10);
      db.prepare("INSERT INTO users (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)")
        .run("admin-001", "admin", hashedPassword, "admin", Date.now());
      console.log("--- Создан пользователь по умолчанию: логин 'admin', пароль 'admin' ---");
    }
  } catch (err) {
    console.error("Ошибка при инициализации админа:", err);
  }
}
seedAdmin();

const JWT_SECRET = process.env.JWT_SECRET || "arsenal-secret-key-123";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Auth API
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
      if (!user) return res.status(401).json({ error: "Неверный логин или пароль" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Неверный логин или пароль" });

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
      res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Ошибка сервера" });
    }
  });

  app.post("/api/update-auth", async (req, res) => {
    const { token, newUsername, newPassword } = req.body;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.role !== "admin") return res.status(403).json({ error: "Forbidden" });

      const updates: string[] = [];
      const params: any[] = [];

      if (newUsername) {
        updates.push("username = ?");
        params.push(newUsername);
      }

      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updates.push("password = ?");
        params.push(hashedPassword);
      }

      if (updates.length === 0) return res.status(400).json({ error: "No updates provided" });

      params.push(decoded.id);
      db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...params);

      res.json({ success: true, message: "Данные успешно обновлены. Пожалуйста, войдите снова." });
    } catch (err) {
      console.error("Update auth error:", err);
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // API Routes
  
  // History API
  app.get("/api/history", (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    
    try {
      const rows = db.prepare("SELECT * FROM calculations WHERE userId = ? ORDER BY createdAt DESC").all(userId);
      const history = rows.map((row: any) => ({
        id: row.id,
        ...JSON.parse(row.payload),
        createdAt: row.createdAt
      }));
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/history", (req, res) => {
    const { userId, payload } = req.body;
    if (!userId || !payload) return res.status(400).json({ error: "userId and payload are required" });

    const id = Math.random().toString(36).substring(2, 11);
    const createdAt = Date.now();

    try {
      db.prepare("INSERT INTO calculations (id, userId, payload, createdAt) VALUES (?, ?, ?, ?)")
        .run(id, userId, JSON.stringify(payload), createdAt);
      res.json({ id });
    } catch (err) {
      res.status(500).json({ error: "Failed to save calculation" });
    }
  });

  app.delete("/api/history/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare("DELETE FROM calculations WHERE id = ?").run(id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete calculation" });
    }
  });

  app.delete("/api/history", (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    try {
      db.prepare("DELETE FROM calculations WHERE userId = ?").run(userId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // Settings API
  app.get("/api/settings/:key", (req, res) => {
    const { key } = req.params;
    try {
      const row: any = db.prepare("SELECT * FROM settings WHERE key = ?").get(key);
      if (row) {
        res.json(JSON.parse(row.value));
      } else {
        res.json(null);
      }
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings/:key", (req, res) => {
    const { key } = req.params;
    const value = req.body;
    const updatedAt = Date.now();

    try {
      db.prepare("INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES (?, ?, ?)")
        .run(key, JSON.stringify(value), updatedAt);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
