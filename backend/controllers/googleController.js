// backend/controllers/googleController.js
// =======================================
// Настройка авторизации через Google OAuth 2.0

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/User");
require("dotenv").config();

// РЕГИСТРАЦИЯ СТРАТЕГИИ GOOGLE
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // из .env
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // из .env
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // из .env
      passReqToCallback: false, // verify-функция БЕЗ req
    },

    // ВАЖНО: сигнатура именно такая:
    // (accessToken, refreshToken, profile, done)
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);

        const email = profile?.emails?.[0]?.value;
        const picture = profile?.photos?.[0]?.value;
        const displayName = profile?.displayName;

        if (!email) {
          return done(new Error("Google OAuth не вернул email"));
        }

        // 1. Пытаемся найти пользователя по email
        let user = await User.findOne({ email });

        if (user) {
          // если нет аватарки, но Google её дал — обновим
          if (!user.profilePicture && picture) {
            user.profilePicture = picture;
            await user.save();
          }
          return done(null, user);
        }

        // 2. Создаём нового пользователя
        user = await User.create({
          username: displayName || email,
          email,
          profilePicture: picture || null,
          password: null, // аккаунт через Google без пароля
        });

        return done(null, user);
      } catch (error) {
        console.error("Google Auth Error:", error);
        done(error);
      }
    }
  )
);

module.exports = passport;
