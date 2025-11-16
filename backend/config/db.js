// backend/config/db.js
// =====================
// Подключение к MongoDB через Mongoose

const mongoose = require("mongoose");

/**
 * Функция подключения к базе данных MongoDB
 * Вызывается один раз в index.js перед стартом сервера
 */

const connectDb = async () => {
  // Проверяем, что строка подключения в .env
  if (!process.env.MONGO_URI) {
    console.error("❌ Переменная окружения MONGO_URI не задана");
    process.exit(1);
  }

  try {
    // Дополнительная настройка поведения Mongoose (по желанию)
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGO_URI, {
      // Эти опции в новых версиях mongoose уже не обязательны,
      // но можно оставить для совместимости
      // useNewUrlParser: true
      // useUnifiedTopology: true,
    });

    console.log("✅ Успешное подключение к MongoDB");

    // Необязательно, но удобно для отладки - логируем статусы
    mongoose.connection.on("error", (err) => {
      console.error("❌ Ошибка соединения с MongoDB:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ Соединение с MongoDB было разорвано");
    });
  } catch (error) {
    console.error("❌ Ошибка при подключении к базе данных:", error.message);
    process.exit(1); // Завершаем процесс, чтобы не держать "мёртвый" сервер
  }
};

module.exports = connectDb;
