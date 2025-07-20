
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '../ui/toaster';
import Preloader from './Preloader';

const PRELOADER_SESSION_KEY = 'preloader_shown';
const LOGIN_PATH = '/super-secret-login-page';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const isLoginPage = pathname === LOGIN_PATH;

    useEffect(() => {
        const hasPreloaderBeenShown = sessionStorage.getItem(PRELOADER_SESSION_KEY) === 'true';

        if (hasPreloaderBeenShown) {
            setLoading(false);
            return;
        }

        document.body.style.overflow = 'hidden';
        const timer = setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem(PRELOADER_SESSION_KEY, 'true');
            document.body.style.overflow = 'auto'; 
        }, 2800); // Adjust time to match your preloader animation

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
        };
    }, []);

    if (loading && !isLoginPage) {
       return (
         <AnimatePresence mode="wait">
            <Preloader />
         </AnimatePresence>
       )
    }

    if (isLoginPage) {
        return (
            <>
                {children}
                <Toaster />
            </>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
            <Toaster />
        </div>
    );
}
