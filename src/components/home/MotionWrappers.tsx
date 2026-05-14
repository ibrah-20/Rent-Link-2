'use client';

import { motion } from 'framer-motion';

export const MotionDiv = motion.div;
export const MotionH1 = motion.h1;
export const MotionP = motion.p;
export const AnimatePresence = (props: any) => {
  const { AnimatePresence: AP } = require('framer-motion');
  return <AP {...props} />;
};
