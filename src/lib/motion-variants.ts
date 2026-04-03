import type { Variants } from 'framer-motion';

/** Page stack: stagger children (Timer → To-do → Progress). */
export const pageContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

export const pageSection: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 32,
    },
  },
};

export const springSnappy = { type: 'spring' as const, stiffness: 420, damping: 32 };
export const springSoft = { type: 'spring' as const, stiffness: 280, damping: 28 };

export const staggerGrid: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

export const gridTile: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
};
