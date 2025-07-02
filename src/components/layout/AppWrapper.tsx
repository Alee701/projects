
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '../ui/toaster';
import Preloader from './Preloader';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            // Hide scrollbar during preloader, then show
            document.body.style.overflow = 'auto'; 
        }, 2800); // Adjust time to match your preloader animation

        // Initial state
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto'; // Ensure it's reset on component unmount
        };
    }, []);

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && <Preloader />}
            </AnimatePresence>
            
            {!loading && (
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
