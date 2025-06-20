
"use client";

import Header from './Header';
import Footer from './Footer';
import { Toaster } from '../ui/toaster';

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
            <Toaster />
        </>
    );
}
