
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from './Preloader';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '../ui/toaster';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500); 

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && <Preloader />}
            </AnimatePresence>
            
            {!isLoading && (
              <>
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                </main>
                <Footer />
                <Toaster />
              </>
            )}
        </>
    );
}
