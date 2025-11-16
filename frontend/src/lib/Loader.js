"use client";

/**
 * 🔄 Глобальный лоадер приложения (монохромный стиль kSocial)
 */

import { motion } from "framer-motion";

// Анимация трёх точек
const dotVariants = {
  hidden: { opacity: 0.3, scale: 0.7 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.18,
      repeat: Infinity,
      repeatType: "reverse",
      duration: 0.55,
    },
  }),
};

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 dark:bg-background/95 backdrop-blur-sm">
      {/* Монохромный "логотип" kSocial в круге */}
      <motion.div
        className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border border-border flex items-center justify-center bg-card shadow-md"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.span
          className="text-4xl sm:text-5xl font-black tracking-tight text-foreground"
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          k
        </motion.span>
      </motion.div>

      {/* Анимированные точки */}
      <div className="flex space-x-3 mt-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-foreground/70"
            initial="hidden"
            animate="visible"
            custom={index}
            variants={dotVariants}
          />
        ))}
      </div>

      {/* Подпись */}
      <motion.div
        className="mt-3 text-2xl sm:text-3xl font-semibold tracking-[0.2em] text-foreground uppercase"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        kSocial
      </motion.div>
    </div>
  );
}
