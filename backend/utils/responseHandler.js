// backend/utils/responseHandler.js
// ================================
// Универсальная функция для отправки ответа в одном формате

/**
 * Универсальный обработчик ответов
 * @param {Response} res - объект ответа Express
 * @param {number} statusCode - HTTP-код (200, 400, 500 и т.д.)
 * @param {string} message - текстовое сообщение
 * @param {object|null} data - полезная нагрузка (данные, если есть)
 */
const response = (res, statusCode, message, data = null) => {
  const isSuccess = statusCode < 400;

  const responseObject = {
    status: isSuccess ? "success" : "error",
    code: statusCode,
    message,
  };

  // Добавляем data только если она есть
  if (data !== null && data !== undefined) {
    responseObject.data = data;
  }

  return res.status(statusCode).json(responseObject);
};

module.exports = response;
