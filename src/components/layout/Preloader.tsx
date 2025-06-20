'use client';

import { motion } from 'framer-motion';
import { CodeXml } from 'lucide-react';

const containerVariants = {
  initial: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeInOut',
    },
  },
};

const iconVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'backOut',
    },
  },
};

const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: 'easeInOut',
            delay: 0.2,
        }
    }
}

export default function Preloader() {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      exit="exit"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
    >
        <motion.div variants={iconVariants} initial="initial" animate="animate">
            <CodeXml className="h-16 w-16 text-primary" />
        </motion.div>
        <motion.h1 
            variants={textVariants}
            initial="initial"
            animate="animate"
            className="mt-4 font-headline text-2xl font-bold text-primary"
        >
            Code with Ali Imran
        </motion.h1>
    </motion.div>
  );
}
