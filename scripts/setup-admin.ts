import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, "arsenal.db"));

async function seed() {
  console.log("--- Создание администратора ---");
  
  const username = "admin";
  const password = "admin_password_change_me_123"; // I will provide a command to set this
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = "admin-" + Math.random().toString(36).substring(7);

  try {
    db.prepare("INSERT OR REPLACE INTO users (id, username, password, role, createdAt) VALUES (?, ?, ?, ?, ?)")
      .run(userId, username, hashedPassword, "admin", Date.now());
    
    console.log(`Успех! Пользователь '${username}' создан.`);
    console.log(`Пароль по умолчанию: ${password}`);
    console.log("-------------------------------");
    console.log("Теперь вы можете войти в систему.");
  } catch (err) {
    console.error("Ошибка при создании пользователя:", err);
  } finally {
    db.close();
  }
}

seed();
