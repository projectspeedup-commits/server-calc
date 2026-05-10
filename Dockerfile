# Используем официальный образ Node.js
FROM node:20-slim AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

# Собираем фронтенд
RUN npm run build

# Финальный легковесный образ
FROM node:20-slim

WORKDIR /app

# Копируем только нужное из билдера
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules

# Создаем папку для базы данных
RUN mkdir -p /app/data

# Устанавливаем tsx глобально для запуска сервера
RUN npm install -g tsx

ENV NODE_ENV=production
EXPOSE 3000

# Запуск сервера
CMD ["tsx", "server.ts"]
