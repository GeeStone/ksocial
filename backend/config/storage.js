// backend/config/storage.js
// =========================
// Загрузка файлов в Yandex Object Storage через AWS S3 SDK
// + настройка multer для временного хранения файлов на диске

const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// === Проверяем необходимые переменные окружения ===
const REQUIRED_ENV_VARS = [
  "YANDEX_ENDPOINT",
  "YANDEX_BUCKET",
  "YANDEX_ACCESS_KEY_ID",
  "YANDEX_SECRET_ACCESS_KEY",
];

REQUIRED_ENV_VARS.forEach((name) => {
  if (!process.env[name]) {
    console.warn(`⚠️ ВНИМАНИЕ: переменная окружения ${name} не задана`);
  }
});

// === Гарантируем, что папка uploads существует ===
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdir(UPLOADS_DIR, { recursive: true });
  console.log("📁 Создана папка для загрузок:", UPLOADS_DIR);
}

// === Настройка клиента Яндекс Object Storage ===
const s3 = new S3Client({
  region: "ru-central1", // Регион Яндекс Облака
  endpoint: process.env.YANDEX_ENDPOINT, // Например: https://storage.yandexcloud.net
  credentials: {
    accessKeyId: process.env.YANDEX_ACCESS_KEY_ID,
    secretAccessKey: process.env.YANDEX_SECRET_ACCESS_KEY,
  },
});

// === Настройка multer для временного сохранения файлов на диске ===
// По умолчанию файлы будут попадать в backend/uploads/
const multerMiddleware = multer({
  dest: UPLOADS_DIR,
  limits: {
    fileSize: 20 * 1024 * 1024, // Ограничения размера файла 20 МБ
  },
});

/**
 * Универсальная функция загрузки файла в Yandex Object Storage
 * @param {Express.Multer.File} file - объект файла от multer (req.file)
 * @param {string} folder - логическая папка внутри бакета (например, "posts", "avatars")
 * @returns {Promise<{url: string, key: string}>}
 */
const uploadFileToYandex = async (file, folder = "uploads") => {
  if (!file) {
    throw new Error("Файл не передан в uploadFileToYandex");
  }

  try {
    // Создаём поток чтения файла с диска
    const fileStream = fs.createReadStream(file.path);

    // Уникальное имя файла в бакете: папка/таймстамп-оригинальноеИмя
    const key = `${folder}/${Date.now()}-${path.basename(file.originalname)}`;

    const uploadParams = {
      Bucket: process.env.YANDEX_BUCKET,
      Key: key,
      Body: fileStream,
      ACL: "public-read", // Делаем объект публично доступным по ссылке
      ContentType: file.mimetype,
    };

    // Отправляем файл в Yandex Object Storage
    await s3.send(new PutObjectCommand(uploadParams));

    // После успешной загрузки - удаляем временный файл с диска
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.warn("⚠️ Не удалось удалить временный файл:", err.message);
    }

    // Формируем публичный URL.
    // Обычно это: https://storage.yandexcloud.net/<bucket>/<key>
    const endpoint = process.env.YANDEX_ENDPOINT?.replace(/\/+$/, "") || "";
    const publicUrl = `${endpoint}/${process.env.YANDEX_BUCKET}/${key}`;

    return {
      url: publicUrl,
      key,
    };
  } catch (error) {
    console.error("❌ Ошибка загрузки в Яндекс Object Storage:", error);
    throw error;
  }
};

const upload = multerMiddleware;

module.exports = {
  multerMiddleware,
  upload,
  uploadFileToYandex,
};
