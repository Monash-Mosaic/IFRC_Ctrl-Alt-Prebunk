// components/Typewriter.jsx
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export const Typewriter = ({
    text,
    speed = 50,
    className = '',
    cursor = false,
}) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else {
            setIsComplete(true);
        }
    }, [currentIndex, speed, text]);

    return (
        <div className={`${className}`}>
            <span>{displayText}</span>
            {cursor && (
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{
                        duration: 0.5,
                        repeat: isComplete ? Infinity : 0,
                        repeatDelay: 0
                    }}
                >
                    |
                </motion.span>
            )}
        </div>
    );
};