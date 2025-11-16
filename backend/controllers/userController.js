// backend/controllers/userController.js
// ======================================
// Работа с пользователями:
// - подписка / отписка
// - входящие "заявки" (кто подписан на меня, а я нет)
// - пользователи без связи (рекомендации)
// - общие друзья
// - список всех пользователей
// - проверка авторизации
// - получение профиля пользователя

const User = require("../model/User");
const response = require("../utils/responseHandler");
const { createNotificationAndEmit } = require("../utils/notify");

/**
 * Подписаться на пользователя
 * ===========================
 * POST /users/follow
 * body: { userIdToFollow }
 */
const followUser = async (req, res) => {
  const { userIdToFollow } = req.body;
  const userId = req?.user?.userId;

  if (!userIdToFollow) {
    return response(res, 400, "userIdToFollow обязателен");
  }

  if (userId === userIdToFollow) {
    return response(res, 400, "Нельзя подписаться на самого себя");
  }

  try {
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return response(res, 404, "Пользователь не найден");
    }

    if (currentUser.following.includes(userIdToFollow)) {
      return response(res, 400, "Вы уже подписаны на этого пользователя");
    }

    // Добавляем ID, не весь объект пользователя
    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(userId);

    // Обновляем счётчики
    currentUser.followingCount = currentUser.following.length;
    userToFollow.followerCount = userToFollow.followers.length;

    await currentUser.save();
    await userToFollow.save();

    // 🔔 Уведомление пользователю, на которого подписались
    await createNotificationAndEmit({
      user: userToFollow._id, // кому
      actor: userId, // кто подписался
      type: "follow",
      entityType: "user",
      entityId: userId,
    });

    return response(res, 200, "Подписка оформлена", {
      followingCount: currentUser.followingCount,
      followerCount: userToFollow.followerCount,
    });
  } catch (error) {
    console.error("❌ Ошибка в followUser:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Отписаться от пользователя
 * ==========================
 * POST /users/unfollow
 * body: { userIdToUnfollow }
 */
const unfollowUser = async (req, res) => {
  const { userIdToUnfollow } = req.body;
  const userId = req?.user?.userId;

  if (!userIdToUnfollow) {
    return response(res, 400, "userIdToUnfollow обязателен");
  }

  if (userId === userIdToUnfollow) {
    return response(res, 400, "Нельзя отписаться от самого себя");
  }

  try {
    const userToUnfollow = await User.findById(userIdToUnfollow);
    const currentUser = await User.findById(userId);

    if (!userToUnfollow || !currentUser) {
      return response(res, 404, "Пользователь не найден");
    }

    if (!currentUser.following.includes(userIdToUnfollow)) {
      return response(res, 400, "Вы не подписаны на этого пользователя");
    }

    // Убираем ID из списков following/followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userIdToUnfollow
    );

    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== userId
    );

    currentUser.followingCount = currentUser.following.length;
    userToUnfollow.followerCount = userToUnfollow.followers.length;

    await currentUser.save();
    await userToUnfollow.save();

    return response(res, 200, "Подписка отменена", {
      followingCount: currentUser.followingCount,
      followerCount: userToUnfollow.followerCount,
    });
  } catch (error) {
    console.error("❌ Ошибка в unfollowUser:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Удалить входящую "заявку в друзья"
 * (по сути отменить одностороннюю подписку на меня)
 * =================================================
 * POST /users/friend-request/remove
 * body: { requestSenderId }
 */
const deleteUserFromRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const { requestSenderId } = req.body;

    const requestSender = await User.findById(requestSenderId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!requestSender || !loggedInUser) {
      return response(res, 404, "Пользователь не найден");
    }

    // Проверяем, есть ли у отправителя подписка на нас
    const isRequestSent = requestSender.following.includes(loggedInUserId);

    if (!isRequestSent) {
      return response(
        res,
        404,
        "Для этого пользователя нет входящей заявки/подписки"
      );
    }

    // У отправителя удаляем нас из following
    requestSender.following = requestSender.following.filter(
      (id) => id.toString() !== loggedInUserId
    );

    // У нас удаляем его из followers
    loggedInUser.followers = loggedInUser.followers.filter(
      (id) => id.toString() !== requestSenderId
    );

    loggedInUser.followerCount = loggedInUser.followers.length;
    requestSender.followingCount = requestSender.following.length;

    await requestSender.save();
    await loggedInUser.save();

    return response(
      res,
      200,
      `Заявка от ${requestSender.username} успешно удалена`,
      {
        senderId: requestSender._id,
        receiverId: loggedInUser._id,
        followerCount: loggedInUser.followerCount,
        followingCount: requestSender.followingCount,
      }
    );
  } catch (error) {
    console.error("❌ Ошибка в deleteUserFromRequest:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить пользователей, которые на меня подписаны,
 * а я на них ещё нет — "входящие заявки"
 * ===================================================
 * GET /users/friend-request
 */
const getAllFriendsRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const loggedInUser = await User.findById(loggedInUserId).select(
      "followers following"
    );

    if (!loggedInUser) {
      return response(res, 404, "Пользователь не найден");
    }

    // Выбираем тех, кто в followers, но не в following
    const userToFollowBack = await User.find({
      _id: { $in: loggedInUser.followers, $nin: loggedInUser.following },
    }).select("username profilePicture email followerCount");

    return response(
      res,
      200,
      "Пользователи для взаимной подписки успешно получены",
      userToFollowBack
    );
  } catch (error) {
    console.error("❌ Ошибка в getAllFriendsRequest:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить пользователей, с которыми ещё нет связи:
 * - я на них не подписан
 * - они на меня не подписаны
 * - это не я сам
 * ================================================
 * GET /users/user-to-request
 */
const getAllUserForRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const loggedInUser = await User.findById(loggedInUserId).select(
      "followers following"
    );

    if (!loggedInUser) {
      return response(res, 404, "Пользователь не найден");
    }

    const excludedIds = [
      loggedInUser._id,
      ...loggedInUser.followers,
      ...loggedInUser.following,
    ];

    const userForFriendRequest = await User.find({
      _id: { $nin: excludedIds },
    }).select("username profilePicture email followerCount");

    return response(
      res,
      200,
      "Пользователи без связи успешно получены",
      userForFriendRequest
    );
  } catch (error) {
    console.error("❌ Ошибка в getAllUserForRequest:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить общих друзей между текущим пользователем и другим
 * ==========================================================
 * GET /users/mutual-friends?userIdToFollow=...
 */
const getAllMutualFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const { userIdToFollow } = req.query;

    if (!userIdToFollow) {
      return response(res, 400, "userIdToFollow обязателен");
    }

    const loggedInUser = await User.findById(loggedInUserId).select(
      "followers following"
    );
    const otherUser = await User.findById(userIdToFollow).select(
      "followers following"
    );

    if (!loggedInUser || !otherUser) {
      return response(res, 404, "Пользователь не найден");
    }

    const loggedFollowing = loggedInUser.following.map((id) => id.toString());
    const otherFollowing = otherUser.following.map((id) => id.toString());

    // Пересечение following
    const mutualIds = loggedFollowing.filter((id) =>
      otherFollowing.includes(id)
    );

    const users = await User.find({ _id: { $in: mutualIds } }).select(
      "username profilePicture"
    );

    return response(res, 200, "Общие друзья успешно получены", users);
  } catch (error) {
    console.error("❌ Ошибка в getAllMutualFriends:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получить всех пользователей, кроме текущего
 * ===========================================
 * GET /users
 */
const getAllUser = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const users = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("username profilePicture email followerCount");

    return response(res, 200, "Пользователи успешно получены", users);
  } catch (error) {
    console.error("❌ Ошибка в getAllUser:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Проверка авторизации + получение текущего пользователя
 * ======================================================
 * GET /users/check-auth
 */
const checkUserAuth = async (req, res) => {
  try {
    const userId = req?.user?.userId;
    if (!userId) {
      return response(
        res,
        401,
        "Неавторизован. Пожалуйста, войдите в систему."
      );
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("bio");

    if (!user) {
      return response(res, 403, "Пользователь не найден");
    }

    return response(
      res,
      200,
      "Пользователь авторизован и может пользоваться приложением",
      user
    );
  } catch (error) {
    console.error("❌ Ошибка в checkUserAuth:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * 👥 Список друзей текущего пользователя
 * Друзья = пользователи, где есть взаимная подписка:
 *   - я подписан на них (following)
 *   - и они подписаны на меня (followers)
 *
 * GET /users/friends
 */
const getUserFriends = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const me = await User.findById(currentUserId)
      .select("followers following")
      .lean();

    if (!me) {
      return response(res, 404, "Пользователь не найден");
    }

    const followingIds = (me.following || []).map((id) => id.toString());
    const followerIds = (me.followers || []).map((id) => id.toString());

    // взаимные
    const mutualIds = followingIds.filter((id) => followerIds.includes(id));

    if (!mutualIds.length) {
      return response(res, 200, "Друзей пока нет", []);
    }

    const friends = await User.find({ _id: { $in: mutualIds } })
      .select("_id username email profilePicture email followerCount")
      .lean();

    return response(res, 200, "Список друзей успешно получен", friends);
  } catch (error) {
    console.error("❌ Ошибка в getUserFriends:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

/**
 * Получение профиля пользователя по ID
 * ====================================
 * GET /users/profile/:userId
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req?.user?.userId;

    const userProfile = await User.findById(userId)
      .select("-password")
      .populate("bio"); // подтягиваем биографию

    if (!userProfile) {
      return response(res, 404, "Пользователь не найден");
    }

    const isOwner = String(loggedInUserId) === String(userId);

    return response(res, 200, "Профиль пользователя получен", {
      profile: userProfile,
      isOwner,
    });
  } catch (error) {
    console.error("❌ Ошибка в getUserProfile:", error);
    return response(res, 500, "Внутренняя ошибка сервера", error.message);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  deleteUserFromRequest,
  getAllFriendsRequest,
  getAllUserForRequest,
  getAllMutualFriends,
  getAllUser,
  checkUserAuth,
  getUserProfile,
  getUserFriends,
};
