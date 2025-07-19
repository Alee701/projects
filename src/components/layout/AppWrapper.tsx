
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '../ui/toaster';
import Preloader from './Preloader';

// Session storage key to track if the preloader has been shown
const PRELOADER_SESSION_KEY = 'preloader_shown';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    // Check session storage to see if preloader has been shown in this session
    const hasPreloaderBeenShown = typeof window !== 'undefined' && sessionStorage.getItem(PRELOADER_SESSION_KEY) === 'true';
    const [loading, setLoading] = useState(!hasPreloaderBeenShown);

    useEffect(() => {
        // If the preloader has already been shown in this session, don't run it again.
        if (hasPreloaderBeenShown) {
            setLoading(false);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(false);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
            }
            // Hide scrollbar during preloader, then show
            document.body.style.overflow = 'auto'; 
        }, 2800); // Adjust time to match your preloader animation

        // Initial state
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto'; // Ensure it's reset on component unmount
        };
    }, [hasPreloaderBeenShown]);

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && <Preloader />}
            </AnimatePresence>
            
            <div className={loading ? 'hidden' : ''}>
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                </main>
                <Footer />
                <Toaster />
            </div>
        </>
    );
}
