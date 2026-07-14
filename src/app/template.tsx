"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="page-transition"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.986, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.992, filter: "blur(8px)" }}
      transition={{ duration: reduceMotion ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
