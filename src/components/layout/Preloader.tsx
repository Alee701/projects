'use client';

import { motion } from 'framer-motion';
import { CodeXml } from 'lucide-react';

const containerVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'circOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: 'circIn',
      delay: 0.2, // A short delay before fading out
    },
  },
};

const iconVariants = {
  initial: {
    scale: 0.5,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'backOut',
      delay: 0.2
    },
  },
};

const titleContainerVariants = {
  initial: {},
  animate: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.15,
    },
  },
};

const titleWordVariants = {
  initial: {
    y: '100%',
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const title = "Code with Ali Imran";
const titleWords = title.split(" ");

export default function Preloader() {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
        <motion.div variants={iconVariants}>
            <CodeXml className="h-16 w-16 text-primary" />
        </motion.div>
        
        <div className="mt-6 overflow-hidden">
            <motion.h1 
                variants={titleContainerVariants}
                className="font-headline text-2xl sm:text-3xl font-bold text-primary flex"
            >
                {titleWords.map((word, index) => (
                    <motion.span
                        key={index}
                        variants={titleWordVariants}
                        className="inline-block mr-[0.5ch]"
                    >
                        {word}
                    </motion.span>
                ))}
            </motion.h1>
        </div>
    </motion.div>
  );
}
