"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

export function JournalReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: .42 });

  return <motion.div className="journal-reading-progress" style={reduceMotion ? { scaleX: 1 } : { scaleX }} aria-hidden="true" />;
}
