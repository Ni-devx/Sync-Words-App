
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const useIsMounted = () => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);
    return isMounted;
};

const LandingHeader = () => {
    const isMounted = useIsMounted();

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-md bg-[#0A192F]/80 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="container mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-white hover:text-[#64ffda] transition-colors duration-300">Sync Words</Link>
                <nav className="flex items-center gap-5">
                    <Link href="/login" className="text-sm font-medium text-[#ccd6f6] hover:text-[#64ffda] transition-colors duration-300">ログイン</Link>
                    <Link href="/signup" className="text-sm font-medium bg-[#64ffda] text-[#0A192F] px-4 py-2 rounded-md shadow-lg hover:bg-opacity-80 transition-all duration-300">無料で始める</Link>
                </nav>
            </div>
        </header>
    );
};

export default LandingHeader;
