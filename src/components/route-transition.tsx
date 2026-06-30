"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteTransition() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 620);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={pathname}
          className="route-glass-wash"
          initial={{ opacity: 0, scale: 1.01, filter: "blur(12px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.012, filter: "blur(16px)" }}
          transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}
    </AnimatePresence>
  );
}
