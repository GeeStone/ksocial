// backend/routes/postRoute.js
// ===========================
// Роуты для постов, лайков, комментариев, репостов и сторис

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/storage");

const {
  createPost,
  getAllPosts,
  getPostByUserId,
  getPostById, // ✅ добавили
  likePost,
  addCommentToPost,
  replyToComment,
  likeComment,
  sharePost,
  createStory,
  getAllStory,
  getVideoPosts,
  deletePost,
  deleteStory,
  deleteCommentFromPost,
} = require("../controllers/postController");

/* -------------------------------------------------------------------------- */
/*                                   ПОСТЫ                                    */
/* -------------------------------------------------------------------------- */

// POST /posts — создать пост
router.post("/", authMiddleware, upload.single("media"), createPost);

// GET /posts — получить общую ленту
router.get("/", authMiddleware, getAllPosts);

// GET /posts/user/:userId — посты конкретного пользователя
router.get("/user/:userId", authMiddleware, getPostByUserId);

/* -------------------------------------------------------------------------- */
/*                            ДЕЙСТВИЯ С ПОСТОМ                               */
/* -------------------------------------------------------------------------- */

// POST /posts/likes/:postId — лайк/анлайк поста
router.post("/likes/:postId", authMiddleware, likePost);

// POST /posts/comments/:postId — добавить комментарий
router.post("/comments/:postId", authMiddleware, addCommentToPost);

// POST /posts/comments/:postId/:commentId/reply — ответ на комментарий
router.post(
  "/comments/:postId/:commentId/reply",
  authMiddleware,
  replyToComment
);

// POST /posts/comments/:postId/:commentId/like — лайк/анлайк комментария
router.post("/comments/:postId/:commentId/like", authMiddleware, likeComment);

// POST /posts/share/:postId — репост
router.post("/share/:postId", authMiddleware, sharePost);

/* -------------------------------------------------------------------------- */
/*                                   СТОРИС                                   */
/* -------------------------------------------------------------------------- */

// POST /posts/story — создать сторис
router.post("/story", authMiddleware, upload.single("media"), createStory);

// GET /posts/story — получить все актуальные сторис
router.get("/story", authMiddleware, getAllStory);

// DELETE /posts/story/:storyId — удалить свою сторис (soft delete)
router.delete("/story/:storyId", authMiddleware, deleteStory);

/* -------------------------------------------------------------------------- */
/*                             ВИДЕО-ЛЕНТА (POSTS)                            */
/* -------------------------------------------------------------------------- */

// GET /posts/videos — все посты с mediaType = "video"
router.get("/videos", authMiddleware, getVideoPosts);

/* -------------------------------------------------------------------------- */
/*                            ОДИН ПОСТ + УДАЛЕНИЕ                            */
/* -------------------------------------------------------------------------- */

// GET /posts/:postId — получить один пост по ID
router.get("/:postId", authMiddleware, getPostById);

// DELETE /posts/:postId — удалить свой пост
router.delete("/:postId", authMiddleware, deletePost);

/* -------------------------------------------------------------------------- */
/*                        УДАЛЕНИЕ КОММЕНТАРИЯ К ПОСТУ                         */
/* -------------------------------------------------------------------------- */

// DELETE /posts/comments/:postId/:commentId — удалить свой комментарий
router.delete(
  "/comments/:postId/:commentId",
  authMiddleware,
  deleteCommentFromPost
);

module.exports = router;
