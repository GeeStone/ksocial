// backend/controllers/createOrUpdateController.js
// ===============================================
// Контроллеры для работы с биографией пользователя и обновлением профиля

const response = require("../utils/responseHandler");
const Bio = require("../model/UserBio");
const User = require("../model/User");
const { uploadFileToYandex } = require("../config/storage");

/**
 * Создание или обновление биографии пользователя
 * ==============================================
 * PUT /users/bio/:userId
 * или (вариант) только по токену, если будешь вызывать без :userId
 */

const createOrUpdateUserBio = async (req, res) => {
  try {
    // Берём userId из токена (более безопасный вариант)
    const userIdFromToken = req.user?.userId;
    const userIdFromParams = req.params?.userId;

    const userId = userIdFromToken || userIdFromParams;

    if (!userId) {
      return response(res, 400, "Идентификатор пользователя не найден");
    }

    const {
      bioText,
      liveIn,
      relationship,
      workplace,
      education,
      phone,
      hometown,
    } = req.body;

    // findOneAndUpdate с upsert: true - создаёт, если нет
    const bio = await Bio.findOneAndUpdate(
      { user: userId },
      {
        bioText,
        liveIn,
        relationship,
        workplace,
        education,
        phone,
        hometown,
        user: userId,
      },
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );

    // Сохраняем ссылку на Bio в документе User
    // 🔧 Баг был тут: вместо User,Bio.findByIdAndUpdate(...)
    await User.findByIdAndUpdate(userId, { bio: bio._id });

    return response(res, 201, "Биография успешно создана/обновлена", bio);
  } catch (error) {
    console.error("❌ Ошибка в createOrUpdateUserBio:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

// Вспомогательная функция: извлекает URL из результата upload'a
const extractUrlFromUpload = (r) =>
  r?.secure_url || r?.url || r?.Location || r?.location || null;

/**
 * Обновление обложки профиля (coverPhoto)
 * ======================================
 * PUT /users/profile/cover-photo/:userId
 * form-data: { coverPhoto: <file> }
 */

const updateCoverPhoto = async (req, res) => {
  try {
    // 🔧 Баг был: const { userId } = req.message;
    // Берём userId из параметров маршрута
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return response(res, 400, "Файл обложки не был передан");
    }

    const uploadResult = await uploadFileToYandex(file, "covers");
    const coverPhoto = extractUrlFromUpload(uploadResult);

    if (!coverPhoto) {
      return response(res, 400, "Не удалось получить URL загруженного файла");
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { coverPhoto } },
      { new: true }
    ).select("-password");

    // 🔧 Баг был: if (!upload) {...}
    if (!updated) {
      return response(res, 404, "Пользователь с таким ID не найден");
    }

    return response(res, 200, "Обложка профиля успешно обновлена", updated);
  } catch (error) {
    console.error("❌ Ошибка в updateCoverPhoto:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Обновление основных данных профиля + аватар
 * ===========================================
 * PUT /users/profile/:userId
 * form-data:
 *  - profilePicture: <file> (опционально)
 *  - username, gender, dateOfBirth (в теле запроса)
 */
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, gender, dateOfBirth } = req.body;
    const file = req.file;

    let profilePicture;

    // Если передан файл - загружаем его в Yandex Object Storage
    if (file) {
      const uploadResult = await uploadFileToYandex(file, "avatars");
      profilePicture = extractUrlFromUpload(uploadResult);

      if (!profilePicture) {
        return response(res, 400, "Не удалось получить URL загруженного файла");
      }
    }

    // Формируем объект $set только из реально переданных полей
    const $set = {
      ...(username && { username }),
      ...(gender && { gender }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(profilePicture && { profilePicture }),
    };

    if (Object.keys($set).length === 0) {
      return response(res, 400, "Нет данных для обновления");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return response(res, 404, "Пользователь с таким ID не найден");
    }

    return response(
      res,
      200,
      "Профиль пользователя успешно обновлён",
      updatedUser
    );
  } catch (error) {
    console.error("❌ Ошибка в updateUserProfile:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = {
  createOrUpdateUserBio,
  updateCoverPhoto,
  updateUserProfile,
};
