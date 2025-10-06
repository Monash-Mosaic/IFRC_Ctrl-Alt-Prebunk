// components/AnimatedButton.jsx
'use client';

import { motion } from 'framer-motion';

export const AnimatedButton = ({
  children,
  onClick,
  className = '',
  direction = 'up'
}) => {
  const directionOffset = {
    up: 50,
    down: -50,
    left: 50,
    right: -50
  };
  return (

    <motion.button
      className={`${className}`}
      initial={{
        opacity: 0,
        y: direction === 'up' || direction === 'down' ? directionOffset[direction] : 0,
        x: direction === 'left' || direction === 'right' ? directionOffset[direction] : 0
      }}
      whileHover={{ scale: 1.1, duration: 0.05 }}
      animate={{ opacity: 1, x: 0, y: 0 }}    // Slide down and fade in
      transition={{
        type: "spring",  // Bouncy spring animation
        duration: 1,
        damping: 10,     // Less bounciness
        stiffness: 50   // Snappier motion
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};