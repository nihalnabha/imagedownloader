import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center transition-all ${
        isScrolled ? 'bg-white bg-opacity-90 text-black shadow-md' : 'bg-transparent text-white'
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <Image src="/Logo.png" alt="Logo" width={40} height={40} />
        <span className="font-semibold text-lg"></span>
      </div>
    </header>
  );
};

export default Header;
