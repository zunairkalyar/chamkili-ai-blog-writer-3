
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <img src="/public/logo.svg" alt="Chamkili Logo" className="h-10 w-10 mr-3"/>
        <span className="text-xl font-semibold font-serif text-brand-text-dark">Chamkili AI Content Strategist</span>
      </div>
    </header>
  );
};

export default Header;
