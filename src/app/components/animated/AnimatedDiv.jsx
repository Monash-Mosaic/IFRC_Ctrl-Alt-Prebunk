// components/FadeIn.jsx
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const AnimatedDiv = ({
    children,
    className = '',
    direction = 'up',
    delay = 0,
    hover = 1
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, threshold: 0.1 });

    const directionOffset = {
        up: 50,
        down: -50,
        left: 50,
        right: -50
    };

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{
                opacity: 0,
                y: direction === 'up' || direction === 'down' ? directionOffset[direction] : 0,
                x: direction === 'left' || direction === 'right' ? directionOffset[direction] : 0
            }}
            animate={isInView ? {
                opacity: 1,
                y: 0,
                x: 0
            } : {}}
            transition={{
                duration: 1.5,
                delay: delay,
                type: "spring",
                damping: 10,       // Lower = more bounciness (try 5-15)
                stiffness: 40,     // Lower = more fluid (try 40-100)
                mass: 0.5,         // Lower = faster movement
            }}
            whileHover={{ scale: hover }}
        >
            {children}
        </motion.div>
    );
};
